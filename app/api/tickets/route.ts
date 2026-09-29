import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserIdFromRequest } from "@/lib/get-user";
import { TICKETS, EVENT } from "@/lib/data";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const { tier, name, email, phone } = await req.json();
    const t = TICKETS.find((x) => x.id === tier);
    if (!t || !name || !email || !phone) return NextResponse.json({ error: "Invalid details." }, { status: 400 });

    const userId = await getUserIdFromRequest(req);
    const { data, error } = await supabaseAdmin()
      .from("audience_tickets")
      .insert({ event_slug: EVENT.slug, tier, amount_inr: t.price, buyer_name: name, buyer_email: email, buyer_phone: phone, user_id: userId })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Could not save booking." }, { status: 500 });

    const order = await createRazorpayOrder({
      amountInr: t.price,
      receipt: `ticket_${data.id}`,
      notes: { type: "audience_ticket", record_id: data.id, tier },
    });

    await supabaseAdmin().from("audience_tickets").update({ razorpay_order_id: order.id }).eq("id", data.id);

    return NextResponse.json({ id: data.id, amount: t.price, orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to start Razorpay payment. Check server payment credentials." }, { status: 500 });
  }
}
