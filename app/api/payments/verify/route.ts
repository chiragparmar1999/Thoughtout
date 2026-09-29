import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getUserIdFromRequest } from "@/lib/get-user";

const config = {
  audience_ticket: { table: "audience_tickets", statusColumn: "payment_status" },
  performer_registration: { table: "performer_registrations", statusColumn: "payment_status" },
  creator_package: { table: "creator_packages", statusColumn: "status" },
} as const;

type PaymentType = keyof typeof config;

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const type = b.type as PaymentType;
    const item = config[type];
    if (!item || !b.recordId || !b.razorpay_order_id || !b.razorpay_payment_id || !b.razorpay_signature)
      return NextResponse.json({ error: "Invalid payment verification payload." }, { status: 400 });

    if (!verifyRazorpaySignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature))
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });

    const admin = supabaseAdmin();
    const { data: record, error: readError } = await admin.from(item.table).select("id, user_id, razorpay_order_id").eq("id", b.recordId).single();
    if (readError || !record || record.razorpay_order_id !== b.razorpay_order_id)
      return NextResponse.json({ error: "Payment order does not match the booking." }, { status: 400 });

    const userId = await getUserIdFromRequest(req);
    if (record.user_id && record.user_id !== userId)
      return NextResponse.json({ error: "You are not allowed to update this payment." }, { status: 403 });

    const update = item.statusColumn === "status"
      ? { status: "paid", razorpay_payment_id: b.razorpay_payment_id }
      : { payment_status: "paid", razorpay_payment_id: b.razorpay_payment_id };

    const { error } = await admin.from(item.table).update(update).eq("id", b.recordId).eq("razorpay_order_id", b.razorpay_order_id);
    if (error) return NextResponse.json({ error: "Could not update payment status." }, { status: 500 });

    return NextResponse.json({ ok: true, message: "Payment verified successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
