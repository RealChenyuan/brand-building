import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const res = await fetch(
    `https://bs3-hb1.corp.kuaishou.com/mmu-aiplatform-temp/${id}`,
    {
      headers: {
        responseType: "arrayBuffer",
      },
    }
  );

  const imgBuffer = await res.arrayBuffer();

  const imageBuffer = Buffer.from(imgBuffer);
  const base64Image = imageBuffer.toString("base64");
  const image = `data:${res.headers.get("content-type")};base64,${base64Image}`;
  return NextResponse.json(image);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const res = await fetch(
    `https://bs3-hb1.corp.kuaishou.com/mmu-aiplatform-temp/${id}`
  );
  console.log("🚀 ~ file: route.ts:22 ~ POST ~ res:", res);
  return res;
}
