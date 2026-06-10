import { NextResponse } from "next/server";

// TODO: 從 Marsen.AI.Did 搬移完整實作，並更新 Instagram OAuth callback URL
export async function POST() {
  return NextResponse.json(
    { error: "IG Token API 尚未設定，請先完成 Instagram App 設定" },
    { status: 501 },
  );
}
