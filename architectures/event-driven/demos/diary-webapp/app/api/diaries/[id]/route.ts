import { type NextRequest, NextResponse } from "next/server";

// ホスト OS で diary-service は 8000 番で動いている想定
const DIARY_ORIGIN = "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await fetch(`${DIARY_ORIGIN}/diaries/${id}`);

  if (!r.ok) return new NextResponse(null, { status: r.status });
  const json = await r.json();
  return NextResponse.json(json);
}
