/**
 * E-mailbouwstenen in de huisstijl uit §5.
 *
 * Bewust zonder componentbibliotheek: `@react-email/components` is door de
 * makers als niet-ondersteund gemarkeerd, en een verlaten pakket hoort niet in
 * een platform dat jaren mee moet. De renderer (`@react-email/render`) wordt
 * wél onderhouden en zet deze componenten om naar HTML en platte tekst.
 *
 * E-mailclients zijn ouderwets: tabellen voor de opmaak, stijlen inline, geen
 * moderne CSS. Dat verklaart de manier waarop dit is opgeschreven.
 */

/**
 * Palet "Petrol en abrikoos", dezelfde waarden als in `globals.css`.
 *
 * De mail blijft licht van achtergrond terwijl de site donker is. Dat is met
 * opzet: een donkere mail vecht met de eigen weergave van elke mailclient, en
 * de meeste tonen hem ergens tussen jouw kleur en die van henzelf in. Het
 * merk zit hier in de petrolkleurige balk, de knop en het zand.
 */
const KLEUR = {
  groen: "#1F4D58",
  groenDonker: "#133B45",
  creme: "#FCFAF6",
  zandLicht: "#F3EBDC",
  inkt: "#16323A",
  gedempt: "#4E6970",
  lijn: "#DECCAA",
} as const;

const SANS =
  "'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "'EB Garamond', Georgia, 'Times New Roman', serif";

export function Mail({
  voorvertoning,
  children,
}: {
  /** Regel die de inbox naast het onderwerp toont. */
  voorvertoning: string;
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>YogaCompany</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: KLEUR.creme,
          fontFamily: SANS,
          color: KLEUR.inkt,
          fontSize: "16px",
          lineHeight: 1.6,
        }}
      >
        {/* Voorvertoning: zichtbaar in de inbox, niet in de mail zelf. */}
        <div
          style={{
            display: "none",
            overflow: "hidden",
            lineHeight: "1px",
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          {voorvertoning}
        </div>

        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: KLEUR.creme }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 16px" }}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: "560px",
                    backgroundColor: "#ffffff",
                    border: `1px solid ${KLEUR.lijn}`,
                    borderRadius: "12px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "32px 32px 8px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: SERIF,
                            fontSize: "20px",
                            fontWeight: 600,
                            color: KLEUR.groenDonker,
                          }}
                        >
                          YogaCompany
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 32px 32px" }}>{children}</td>
                    </tr>
                  </tbody>
                </table>

                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: "560px" }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: "20px 32px",
                          fontSize: "12px",
                          color: KLEUR.gedempt,
                        }}
                      >
                        YogaCompany · opleidingsinstituut voor yoga
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function Kop({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        margin: "0 0 16px",
        fontFamily: SERIF,
        fontSize: "28px",
        lineHeight: 1.25,
        fontWeight: 600,
        color: KLEUR.groenDonker,
      }}
    >
      {children}
    </h1>
  );
}

export function Alinea({
  children,
  gedempt = false,
}: {
  children: React.ReactNode;
  gedempt?: boolean;
}) {
  return (
    <p
      style={{
        margin: "0 0 16px",
        fontSize: gedempt ? "14px" : "16px",
        lineHeight: 1.6,
        color: gedempt ? KLEUR.gedempt : KLEUR.inkt,
      }}
    >
      {children}
    </p>
  );
}

export function Knop({ href, children }: { href: string; children: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: KLEUR.groen,
              borderRadius: "8px",
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "14px 28px",
                fontFamily: SANS,
                fontSize: "16px",
                fontWeight: 600,
                color: KLEUR.creme,
                textDecoration: "none",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Blok met praktische gegevens, bijvoorbeeld bij een inschrijving. */
export function Gegevens({
  rijen,
}: {
  rijen: { label: string; waarde: string }[];
}) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        backgroundColor: KLEUR.zandLicht,
        borderRadius: "8px",
        margin: "8px 0 24px",
      }}
    >
      <tbody>
        {rijen.map((rij) => (
          <tr key={rij.label}>
            <td style={{ padding: "12px 20px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: KLEUR.gedempt,
                }}
              >
                {rij.label}
              </span>
              <span style={{ display: "block", fontSize: "16px" }}>
                {rij.waarde}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Scheiding() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${KLEUR.lijn}`,
        margin: "24px 0",
      }}
    />
  );
}
