import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Tabbladpictogram: de merkletters op het diepgroen uit §5. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2E4A3B",
        color: "#FAF6EC",
        fontSize: 17,
        fontFamily: "serif",
        letterSpacing: "-0.5px",
      }}
    >
      YC
    </div>,
    size,
  );
}
