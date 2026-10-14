import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET(req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  const px = Math.min(1024, Math.max(48, parseInt(size, 10) || 192));
  const maskable = new URL(req.url).searchParams.get("maskable") === "1";
  const globe = px * (maskable ? 0.46 : 0.56);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg,#38bdf8 0%,#2563eb 45%,#7c3aed 100%)",
          borderRadius: maskable ? 0 : px * 0.225,
        }}
      >
        <svg width={globe} height={globe} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
          <path d="M4.2 7h15.6M4.2 17h15.6" />
        </svg>
      </div>
    ),
    { width: px, height: px }
  );
}
