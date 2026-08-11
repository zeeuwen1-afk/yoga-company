import { ImageResponse } from "next/og";

export const alt = "Yoga Companie — opleidingsinstituut voor yoga";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Deelafbeelding voor sociale media, in de huisstijl uit §5. Wordt bij het
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
        backgroundColor: "#FAF6EC",
        padding: "80px",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 34, color: "#6E6A5C" }}>
        Yoga Companie
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
            color: "#22382C",
            maxWidth: "900px",
          }}
        >
          Opleidingsinstituut voor yoga
        </div>
        <div style={{ fontSize: 36, color: "#6E6A5C" }}>
          Opleidingen, trainingen en yogalessen
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: "10px",
          width: "220px",
          backgroundColor: "#2E4A3B",
        }}
      />
    </div>,
    size,
  );
}
