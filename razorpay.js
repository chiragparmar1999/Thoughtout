const crypto = require('crypto');

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const isConfigured = Boolean(KEY_ID && KEY_SECRET);

async function createOrder({ amountInr, receipt, notes }) {
  if (!isConfigured) return null;
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: Math.round(Number(amountInr) * 100), currency: 'INR', receipt, notes: notes || {} }),
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed: ${res.status} ${await res.text()}`);
  return res.json();
}
function verifySignature({ order_id, payment_id, signature }) {
  if (!isConfigured || !order_id || !payment_id || !signature) return false;
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(`${order_id}|${payment_id}`).digest('hex');
  const a = Buffer.from(expected, 'utf8'), b = Buffer.from(String(signature), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
module.exports = { isConfigured, createOrder, verifySignature, KEY_ID };