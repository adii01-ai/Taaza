import { NextResponse, type NextRequest } from "next/server";
import { AiRefusalError, extractFoodItems, SCAN_KINDS, type ScanKind } from "@/lib/ai/claude";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ImageType = (typeof TYPES)[number];

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  const kind = form?.get("kind");
  if (!(file instanceof File) || !TYPES.includes(file.type as ImageType)) {
    return NextResponse.json({ error: "Please choose a JPG, PNG or WebP photo." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large. Please use one under 5 MB." }, { status: 413 });
  }
  const scanKind: ScanKind = SCAN_KINDS.includes(kind as ScanKind) ? (kind as ScanKind) : "fridge_photo";

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await extractFoodItems({ base64, mediaType: file.type as ImageType, kind: scanKind });
    const items = result.items.map((item) => ({
      ...item,
      shelf_life_days: Math.min(Math.max(Math.round(item.shelf_life_days), 0), 730),
    }));
    return NextResponse.json({ items, note: result.note, kind: scanKind });
  } catch (error) {
    if (error instanceof AiRefusalError) {
      return NextResponse.json({ error: "We couldn't read that photo. Try a clearer one." }, { status: 422 });
    }
    console.error("scan failed", error);
    return NextResponse.json({ error: "Scanning is unavailable right now. Please try again." }, { status: 502 });
  }
}
