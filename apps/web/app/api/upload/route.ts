import { NextResponse } from "next/server";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const rateLimit = await enforceRateLimit({
      key: "upload_image",
      limit: 30,
      windowSeconds: 60 * 60
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: rateLimit.error || "Upload limit reached." },
        { status: rateLimit.userId ? 429 : 401, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file." }, { status: 400 });
    }

    const upload = await saveUploadedImage(file);
    return NextResponse.json(upload, { headers: rateLimitHeaders(rateLimit) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
