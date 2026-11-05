// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { getReviewImages } from "@/lib/vehicleQueries";

export const runtime = "nodejs";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!, // Editor role, server only
  useCdn: false,
});

export async function GET() {
  const images = await getReviewImages();
  return NextResponse.json({ images });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const customerName = String(form.get("customerName") || "").trim();
    const rating = Number(form.get("rating"));
    const reviewText = String(form.get("reviewText") || "").trim();
    const shoeId = form.get("shoeId") as string | null;
    const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

    if (!customerName) return NextResponse.json({ error: "Name required." }, { status: 400 });
    if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
    if (files.length > 4) return NextResponse.json({ error: "Max 4 images." }, { status: 400 });

    const reviewImages = await Promise.all(
      files.map(async (file) => {
        const asset = await writeClient.assets.upload(
          "image",
          Buffer.from(await file.arrayBuffer()),
          { filename: file.name, contentType: file.type }
        );
        return {
          _type: "image",
          _key: crypto.randomUUID(),
          asset: { _type: "reference", _ref: asset._id },
        };
      })
    );

    await writeClient.create({
      _type: "review",
      customerName,
      rating,
      reviewText,
      reviewImages,
      isApproved: false,
      isVerifiedPurchase: false,
      createdAt: new Date().toISOString(),
      ...(shoeId && { shoe: { _type: "reference", _ref: shoeId } }),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error." }, { status: 500 });
  }
}