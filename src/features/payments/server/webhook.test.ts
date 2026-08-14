import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MollieBetaling } from "@/lib/mollie";

/**
 * De webhook van Mollie.
 *
 * Twee dingen moeten hier hard staan:
 *
 *   1. **De inhoud van het verzoek telt niet.** Mollie stuurt alleen een id en
 *      ondertekent niets. De status komt uit een eigen aanroep naar Mollie.
 *   2. **Twee keer verwerken is één keer.** Mollie levert dezelfde webhook
 *      meerdere keren af en probeert het opnieuw bij een storing.
 *
 * De databaseclient is vervangen door een dubbelganger die de voorwaardelijke
 * update nabootst: `neq('status', 'paid')` levert bij een tweede poging geen
 * rij op, precies zoals Postgres dat zou doen.
 */

type Bestelling = {
  id: string;
  profile_id: string;
  status: string;
  currency: string;
  paid_at: string | null;
  mollie_payment_id: string | null;
};

const bestellingen = new Map<string, Bestelling>();
const regels = new Map<
  string,
  { course_id: string | null; amount_cents: number }[]
>();
const inschrijvingen: {
  profile_id: string;
  course_id: string;
  status: string;
}[] = [];
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

      if (tabel === "order_items") {
        let orderId = "";
        const bouwer = {
          select() {
            return bouwer;
          },
          eq(_kolom: string, waarde: string) {
            orderId = waarde;
            return bouwer;
          },
          not() {
            return Promise.resolve({
              data: regels.get(orderId) ?? [],
              error: null,
            });
          },
        };
        return bouwer;
      }

      if (tabel === "enrollments") {
        const bouwer = {
          upsert(rij: {
            profile_id: string;
            course_id: string;
            status: string;
          }) {
            const bestaand = inschrijvingen.find(
              (i) =>
                i.profile_id === rij.profile_id &&
                i.course_id === rij.course_id,
            );
            if (bestaand) Object.assign(bestaand, rij);
            else inschrijvingen.push({ ...rij });
            return bouwer;
          },
          update(waarden: { status: string }) {
            for (const rij of inschrijvingen) Object.assign(rij, waarden);
            return bouwer;
          },
          eq() {
            return bouwer;
          },
          neq() {
            return Promise.resolve({ data: null, error: null });
          },
          select() {
            return bouwer;
          },
          single() {
            return Promise.resolve({
              data: { id: `enr-${inschrijvingen.length}` },
              error: null,
            });
          },
        };
        return bouwer;
      }

      // orders
      let doelId = "";
      let doelBetaling = "";
      let uitgesloten = "";
      let toegestaan: string[] | null = null;
      let nieuweWaarden: Partial<Bestelling> = {};
      let isUpdate = false;

      const bouwer = {
        select() {
          return bouwer;
        },
        update(waarden: Partial<Bestelling>) {
          isUpdate = true;
          nieuweWaarden = waarden;
          return bouwer;
        },
        eq(kolom: string, waarde: string) {
          if (kolom === "mollie_payment_id") doelBetaling = waarde;
          else doelId = waarde;
          return bouwer;
        },
        neq(_kolom: string, waarde: string) {
          uitgesloten = waarde;
          return bouwer;
        },
        in(_kolom: string, waarden: string[]) {
          toegestaan = waarden;
          return bouwer;
        },
        maybeSingle() {
          const rij = doelBetaling
            ? [...bestellingen.values()].find(
                (b) => b.mollie_payment_id === doelBetaling,
              )
            : bestellingen.get(doelId);

          if (!rij) return Promise.resolve({ data: null, error: null });

          if (!isUpdate) return Promise.resolve({ data: rij, error: null });

          // Zoals de database: staat de rij al in de doeltoestand, dan raakt de
          // update niets en komt er geen rij terug.
          if (uitgesloten && rij.status === uitgesloten) {
            return Promise.resolve({ data: null, error: null });
          }
          if (toegestaan && !toegestaan.includes(rij.status)) {
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

const haalBetalingMock = vi.fn();

vi.mock("@/lib/mollie", async (origineel) => {
  const echt = await origineel<typeof import("@/lib/mollie")>();
  return { ...echt, haalBetaling: (id: string) => haalBetalingMock(id) };
});

const { verwerkWebhook } = await import("./webhook");

function betaling(overschrijf: Partial<MollieBetaling> = {}): MollieBetaling {
  return {
    id: "tr_test123",
    status: "paid",
    amount: { value: "795.00", currency: "EUR" },
    metadata: { order_id: "bestelling-1" },
    ...overschrijf,
  };
}

beforeEach(() => {
  bestellingen.clear();
  regels.clear();
  inschrijvingen.length = 0;
  auditRegels.length = 0;
  haalBetalingMock.mockReset();

  bestellingen.set("bestelling-1", {
    id: "bestelling-1",
    profile_id: "klant-1",
    status: "open",
    currency: "eur",
    paid_at: null,
    mollie_payment_id: "tr_test123",
  });
  regels.set("bestelling-1", [{ course_id: "cursus-1", amount_cents: 79500 }]);
});

describe("de status komt van Mollie, niet uit het verzoek", () => {
  it("haalt de betaling op bij het meegegeven id", async () => {
    haalBetalingMock.mockResolvedValue(betaling());

    await verwerkWebhook("tr_test123");

    expect(haalBetalingMock).toHaveBeenCalledWith("tr_test123");
  });

  it("verwerkt niets als Mollie zegt dat de betaling nog loopt", async () => {
    haalBetalingMock.mockResolvedValue(betaling({ status: "open" }));

    const uitkomst = await verwerkWebhook("tr_test123");

    expect(uitkomst.verwerkt).toBe(false);
    expect(bestellingen.get("bestelling-1")?.status).toBe("open");
    expect(inschrijvingen).toHaveLength(0);
  });

  it("laat een onbekende betaling met rust in plaats van te struikelen", async () => {
    haalBetalingMock.mockResolvedValue(
      betaling({ id: "tr_onbekend", metadata: null }),
    );

    const uitkomst = await verwerkWebhook("tr_onbekend");

    expect(uitkomst.verwerkt).toBe(false);
    expect(uitkomst.toelichting).toContain("geen bestelling");
  });
});

describe("een geslaagde betaling", () => {
  it("zet de bestelling op betaald en activeert de inschrijving", async () => {
    haalBetalingMock.mockResolvedValue(betaling());

    const uitkomst = await verwerkWebhook("tr_test123");

    expect(uitkomst.verwerkt).toBe(true);
    expect(bestellingen.get("bestelling-1")?.status).toBe("paid");
    expect(inschrijvingen).toHaveLength(1);
    expect(inschrijvingen[0]).toMatchObject({
      profile_id: "klant-1",
      course_id: "cursus-1",
      status: "betaald",
      order_id: "bestelling-1",
    });
    expect(uitkomst.enrollmentIds).toHaveLength(1);
  });

  it("doet bij een tweede aflevering niets meer", async () => {
    haalBetalingMock.mockResolvedValue(betaling());

    await verwerkWebhook("tr_test123");
    const eerstePaidAt = bestellingen.get("bestelling-1")?.paid_at;

    const tweede = await verwerkWebhook("tr_test123");

    expect(tweede.verwerkt).toBe(false);
    expect(tweede.toelichting).toContain("stond al op betaald");
    expect(bestellingen.get("bestelling-1")?.paid_at).toBe(eerstePaidAt);
    expect(inschrijvingen).toHaveLength(1);
  });

  it("vindt de bestelling ook als alleen de metadata hem noemt", async () => {
    bestellingen.get("bestelling-1")!.mollie_payment_id = null;
    haalBetalingMock.mockResolvedValue(betaling());

    const uitkomst = await verwerkWebhook("tr_test123");

    expect(uitkomst.verwerkt).toBe(true);
    expect(bestellingen.get("bestelling-1")?.status).toBe("paid");
  });
});

describe("een mislukte betaling", () => {
  it.each(["failed", "expired", "canceled"] as const)(
    "annuleert de bestelling bij status %s",
    async (status) => {
      haalBetalingMock.mockResolvedValue(betaling({ status }));

      const uitkomst = await verwerkWebhook("tr_test123");

      expect(uitkomst.verwerkt).toBe(true);
      expect(bestellingen.get("bestelling-1")?.status).toBe("canceled");
      expect(inschrijvingen).toHaveLength(0);
    },
  );

  it("laat een al betaalde bestelling niet alsnog omvallen", async () => {
    haalBetalingMock.mockResolvedValue(betaling());
    await verwerkWebhook("tr_test123");

    // Een late 'expired' na een geslaagde betaling mag niets afpakken.
    haalBetalingMock.mockResolvedValue(betaling({ status: "expired" }));
    const uitkomst = await verwerkWebhook("tr_test123");

    expect(uitkomst.verwerkt).toBe(false);
    expect(bestellingen.get("bestelling-1")?.status).toBe("paid");
  });
});

describe("een terugbetaling", () => {
  it("trekt de bestelling en de toegang in", async () => {
    haalBetalingMock.mockResolvedValue(betaling());
    await verwerkWebhook("tr_test123");

    haalBetalingMock.mockResolvedValue(
      betaling({ amountRefunded: { value: "795.00", currency: "EUR" } }),
    );
    const uitkomst = await verwerkWebhook("tr_test123");

    expect(uitkomst.verwerkt).toBe(true);
    expect(bestellingen.get("bestelling-1")?.status).toBe("refunded");
    expect(auditRegels).toContainEqual(
      expect.objectContaining({ action: "terugbetaling_verwerkt" }),
    );
  });

  it("verwerkt een herhaalde melding niet nog eens", async () => {
    haalBetalingMock.mockResolvedValue(
      betaling({ amountRefunded: { value: "795.00", currency: "EUR" } }),
    );

    await verwerkWebhook("tr_test123");
    const tweede = await verwerkWebhook("tr_test123");

    expect(tweede.verwerkt).toBe(false);
    expect(auditRegels).toHaveLength(1);
  });
});
