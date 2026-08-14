import { ImageResponse } from "next/og";

export const alt = "YogaCompany — opleidingsinstituut voor yoga";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Deelafbeelding voor sociale media, in de huisstijl uit §2 van de bouwprompt. Wordt bij het
 * bouwen gegenereerd, dus er hoeft geen bestand beheerd te worden.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F6FAF9",
        padding: "80px",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 34, color: "#566E6A" }}>
        YogaCompany
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontSize: 82,
            lineHeight: 1.1,
            color: "#163F3C",
            maxWidth: "900px",
          }}
        >
          Opleidingsinstituut voor yoga
        </div>
        <div style={{ fontSize: 36, color: "#566E6A" }}>
          Opleidingen, trainingen en yogalessen
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: "10px",
          width: "220px",
          backgroundColor: "#1F5551",
        }}
      />
    </div>,
    size,
  );
}
