import { ImageResponse } from "next/og";

export const alt = "Nordic Signals — Weekly Nordic AI & engineering hiring signals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#07090f",
          color: "#e2e8f0",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "70px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#22d3ee",
              boxShadow: "0 0 22px #22d3ee",
            }}
          />
          <div style={{ fontSize: 22, color: "#22d3ee", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Nordic Signals
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, color: "#fff", lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Weekly Nordic AI &amp;
          </div>
          <div style={{ fontSize: 68, color: "#fff", lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.02em" }}>
            engineering hiring signals.
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 12, lineHeight: 1.4 }}>
            Tracking 150+ Nordic tech companies. Updated daily.
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, color: "#64748b", fontSize: 20 }}>
          <span>Klarna</span><span>·</span>
          <span>Northvolt</span><span>·</span>
          <span>Spotify</span><span>·</span>
          <span>Wolt</span><span>·</span>
          <span>Polestar</span><span>·</span>
          <span>Lovable</span>
        </div>
      </div>
    ),
    size,
  );
}
