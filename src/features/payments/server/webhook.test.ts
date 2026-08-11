import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

/**
 * De webhook mag een gebeurtenis nooit twee keer verwerken. Stripe levert er
 * soms meer dan één af, en probeert het opnieuw bij een storing.
 *
 * Deze tests vervangen de databaseclient door een dubbelganger die de
 * voorwaardelijke update nabootst: `neq('status', 'betaald')` levert bij een
 * tweede poging geen rij op, precies zoals Postgres dat zou doen.
 */

type Inschrijving = { id: string; status: string; paid_at: string | null };

const inschrijvingen = new Map<string, Inschrijving>();
const auditRegels: { action: string; entity_id: string | null }[] = [];

function maakDubbelganger() {
  return {
    from(tabel: string) {
      if (tabel === "audit_log") {
        return {
          insert(rij: { action: string; entity_id: string | null }) {
            auditRegels.push(rij);
            return Promise.resolve({ error: null });
          },
        };
      }

      // enrollments
      let doelId = "";
      let uitgeslotenStatus = "";
      let nieuweWaarden: Partial<Inschrijving> = {};

      const bouwer = {
        update(waarden: Partial<Inschrijving>) {
          nieuweWaarden = waarden;
          return bouwer;
        },
        eq(_kolom: string, waarde: string) {
          doelId = waarde;
          return bouwer;
        },
        neq(_kolom: string, waarde: string) {
          uitgeslotenStatus = waarde;
          return bouwer;
        },
        select() {
          return bouwer;
        },
        maybeSingle() {
          const rij = inschrijvingen.get(doelId);

          // Zoals de databank: staat de rij al in de doeltoestand, dan raakt
          // de update niets en komt er geen rij terug.
          if (!rij || rij.status === uitgeslotenStatus) {
            return Promise.resolve({ data: null, error: null });
          }

          Object.assign(rij, nieuweWaarden);
          return Promise.resolve({ data: { id: rij.id }, error: null });
        },
      };

      return bouwer;
    },
  };
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => maakDubbelganger(),
}));

vi.mock("./checkout", () => ({
  enrollmentIdBijPaymentIntent: vi.fn(async () => "inschrijving-1"),
}));

const { verwerkGebeurtenis } = await import("./webhook");

function checkoutVoltooid(
  overschrijf: Partial<{
    payment_status: string;
    enrollment_id: string | null;
    amount_total: number;
  }> = {},
) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        payment_status: overschrijf.payment_status ?? "paid",
        amount_total: overschrijf.amount_total ?? 299500,
        client_reference_id: null,
        metadata:
          overschrijf.enrollment_id === null
            ? {}
            : { enrollment_id: overschrijf.enrollment_id ?? "inschrijving-1" },
      },
    },
  } as unknown as Stripe.Event;
}

describe("Stripe-webhook", () => {
  beforeEach(() => {
    inschrijvingen.clear();
    auditRegels.length = 0;
    inschrijvingen.set("inschrijving-1", {
      id: "inschrijving-1",
      status: "in_afwachting",
      paid_at: null,
    });
  });

  it("zet een betaalde inschrijving op betaald", async () => {
    const uitkomst = await verwerkGebeurtenis(checkoutVoltooid());

    expect(uitkomst.verwerkt).toBe(true);
    expect(uitkomst.enrollmentId).toBe("inschrijving-1");
    expect(inschrijvingen.get("inschrijving-1")?.status).toBe("betaald");
  });

  it("verwerkt dezelfde gebeurtenis geen tweede keer", async () => {
    await verwerkGebeurtenis(checkoutVoltooid());
    const betaaldatum = inschrijvingen.get("inschrijving-1")?.paid_at;

    const tweede = await verwerkGebeurtenis(checkoutVoltooid());

    expect(tweede.verwerkt).toBe(false);
    expect(tweede.enrollmentId).toBeUndefined();
    // De oorspronkelijke betaaldatum blijft staan.
    expect(inschrijvingen.get("inschrijving-1")?.paid_at).toBe(betaaldatum);
  });

  it("wacht af zolang de betaling nog niet rond is", async () => {
    const uitkomst = await verwerkGebeurtenis(
      checkoutVoltooid({ payment_status: "unpaid" }),
    );

    expect(uitkomst.verwerkt).toBe(false);
    expect(inschrijvingen.get("inschrijving-1")?.status).toBe("in_afwachting");
  });

  it("slaat een sessie zonder inschrijving over in plaats van te falen", async () => {
    const uitkomst = await verwerkGebeurtenis(
      checkoutVoltooid({ enrollment_id: null }),
    );

    expect(uitkomst.verwerkt).toBe(false);
    expect(uitkomst.toelichting).toContain("zonder enrollment_id");
  });

  it("verwerkt een iDEAL-betaling die pas later slaagt", async () => {
    const gebeurtenis = {
      type: "checkout.session.async_payment_succeeded",
      data: {
        object: {
          id: "cs_test_2",
          amount_total: 84500,
          client_reference_id: "inschrijving-1",
          metadata: {},
        },
      },
    } as unknown as Stripe.Event;

    const uitkomst = await verwerkGebeurtenis(gebeurtenis);

    expect(uitkomst.verwerkt).toBe(true);
    expect(inschrijvingen.get("inschrijving-1")?.status).toBe("betaald");
  });

  it("annuleert de inschrijving bij een mislukte iDEAL-betaling", async () => {
    const gebeurtenis = {
      type: "checkout.session.async_payment_failed",
      data: {
        object: {
          id: "cs_test_3",
          client_reference_id: "inschrijving-1",
          metadata: {},
        },
      },
    } as unknown as Stripe.Event;

    await verwerkGebeurtenis(gebeurtenis);

    expect(inschrijvingen.get("inschrijving-1")?.status).toBe("geannuleerd");
  });

  it("annuleert bij terugbetaling en legt dat vast in het audit log", async () => {
    inschrijvingen.set("inschrijving-1", {
      id: "inschrijving-1",
      status: "betaald",
      paid_at: "2026-01-01T00:00:00.000Z",
    });

    const gebeurtenis = {
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_test_1" } },
    } as unknown as Stripe.Event;

    const uitkomst = await verwerkGebeurtenis(gebeurtenis);

    expect(uitkomst.verwerkt).toBe(true);
    expect(inschrijvingen.get("inschrijving-1")?.status).toBe("geannuleerd");
    expect(auditRegels).toHaveLength(1);
    expect(auditRegels[0]?.action).toBe("terugbetaling_verwerkt");
  });

  it("verwerkt een terugbetaling geen tweede keer", async () => {
    inschrijvingen.set("inschrijving-1", {
      id: "inschrijving-1",
      status: "geannuleerd",
      paid_at: null,
    });

    const gebeurtenis = {
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_test_1" } },
    } as unknown as Stripe.Event;

    const uitkomst = await verwerkGebeurtenis(gebeurtenis);

    expect(uitkomst.verwerkt).toBe(false);
    expect(auditRegels).toHaveLength(0);
  });

  it("laat gebeurtenissen die ons niet aangaan met rust", async () => {
    const gebeurtenis = {
      type: "customer.created",
      data: { object: {} },
    } as unknown as Stripe.Event;

    const uitkomst = await verwerkGebeurtenis(gebeurtenis);

    expect(uitkomst.verwerkt).toBe(false);
    expect(uitkomst.toelichting).toContain("vraagt geen actie");
  });
});
