export type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void }; }
}

export async function openRazorpay(options: RazorpayOptions) {
  if (!window.Razorpay) {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-razorpay="checkout"]');
      if (existing) { existing.addEventListener("load", () => resolve()); existing.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout."))); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpay = "checkout";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
      document.body.appendChild(script);
    });
  }
  if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable.");
  new window.Razorpay(options).open();
}
