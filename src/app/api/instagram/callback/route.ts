import { NextResponse } from "next/server";

// TODO: 從 Marsen.AI.Did 搬移完整實作，並更新 Instagram App 的 callback URL
export async function GET() {
  return NextResponse.json(
    { error: "IG Token API 尚未設定" },
    { status: 501 },
  );
}
