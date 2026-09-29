import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserIdFromRequest } from "@/lib/get-user";
import { CATEGORIES, EVENT, PERFORMER_FEE, VIDEO_PACKAGE_FEE, EXTRA_MINUTE_RATE } from "@/lib/data";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.name || !b.contact_no || !b.instagram_id || !b.email || !CATEGORIES.includes(b.category))
      return NextResponse.json({ error: "Please fill all fields." }, { status: 400 });

    const videoUpsell = !!b.video_upsell;
    const extraMins = videoUpsell ? Math.max(0, Number(b.video_extra_minutes) || 0) : 0;
    const amount = videoUpsell ? VIDEO_PACKAGE_FEE + extraMins * EXTRA_MINUTE_RATE : PERFORMER_FEE;

    const userId = await getUserIdFromRequest(req);
    const { data, error } = await supabaseAdmin()
      .from("performer_registrations")
      .insert({
        event_slug: EVENT.slug, name: b.name, contact_no: b.contact_no, instagram_id: b.instagram_id,
        email: b.email, category: b.category, video_upsell: videoUpsell, video_extra_minutes: extraMins,
        amount_inr: amount, user_id: userId,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Could not save registration." }, { status: 500 });

    const order = await createRazorpayOrder({
      amountInr: amount,
      receipt: `performer_${data.id}`,
      notes: { type: "performer_registration", record_id: data.id, category: b.category },
    });

    await supabaseAdmin().from("performer_registrations").update({ razorpay_order_id: order.id }).eq("id", data.id);

    return NextResponse.json({ id: data.id, amount, orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to start Razorpay payment. Check server payment credentials." }, { status: 500 });
  }
}
