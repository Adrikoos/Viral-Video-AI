export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({ ok:true, configured:Boolean(process.env.VIDEO_API_URL && process.env.VIDEO_API_KEY), version:"3.0.0" });
}