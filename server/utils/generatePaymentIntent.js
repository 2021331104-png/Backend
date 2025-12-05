import Stripe from "stripe";
import database from "../database/db.js";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeCurrency = process.env.STRIPE_CURRENCY || "usd";

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function generatePaymentIntent(orderId, totalPrice) {
  if (!stripe) {
    return { success: false, message: "Stripe secret key not configured." };
  }

  const amount = Math.max(0, Math.round(Number(totalPrice || 0) * 100));
  if (!amount) {
    return { success: false, message: "Invalid payment amount." };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: stripeCurrency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    await database.query(
      `INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id)
       VALUES ($1, 'Online', 'Pending', $2)
       ON CONFLICT (order_id) DO UPDATE SET
         payment_intent_id = EXCLUDED.payment_intent_id,
         payment_status = 'Pending'`,
      [orderId, paymentIntent.client_secret]
    );

    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return { success: false, message: "Failed to create payment intent." };
  }
}
