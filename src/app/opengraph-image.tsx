import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PhoneSell — Sell your old phone in Mumbai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg,#0b1f3a 0%,#1e4d8c 55%,#0b1f3a 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, color: "#e0c27a", textTransform: "uppercase" }}>
          PhoneSell
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 18, lineHeight: 1.1, maxWidth: 900 }}>
          Sell Your Phone, Get the Best Value.
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: "rgba(255,255,255,0.8)" }}>
          Doorstep pickup across Mumbai, Mira Road, Bhayandar & Thane
        </div>
        <div style={{ marginTop: 36, fontSize: 24, color: "#c4a35a" }}>Call 7068867486</div>
      </div>
    ),
    { ...size },
  );
}
