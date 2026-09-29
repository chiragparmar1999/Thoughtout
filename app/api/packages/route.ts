import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserIdFromRequest } from "@/lib/get-user";
import { PACKAGE } from "@/lib/data";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.name || !b.email || !b.phone) return NextResponse.json({ error: "Please fill all fields." }, { status: 400 });

    const userId = await getUserIdFromRequest(req);
    const { data, error } = await supabaseAdmin().from("creator_packages").insert({
      package_name: PACKAGE.name, price_inr: PACKAGE.price,
      buyer_name: b.name, buyer_email: b.email, buyer_phone: b.phone, instagram_id: b.instagram_id || null,
      user_id: userId, status: "pending_payment",
    }).select("id").single();
    if (error) return NextResponse.json({ error: "Could not save request." }, { status: 500 });

    const order = await createRazorpayOrder({
      amountInr: PACKAGE.price,
      receipt: `package_${data.id}`,
      notes: { type: "creator_package", record_id: data.id },
    });

    await supabaseAdmin().from("creator_packages").update({ razorpay_order_id: order.id }).eq("id", data.id);

    return NextResponse.json({ id: data.id, amount: PACKAGE.price, orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to start Razorpay payment. Check server payment credentials." }, { status: 500 });
  }
}
