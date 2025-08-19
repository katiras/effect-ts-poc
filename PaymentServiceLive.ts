import Stripe from "stripe";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import { PaymentService } from "./PaymentService";

const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-07-30.basil" });
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const PaymentServiceLive: PaymentService = {
  createPaymentIntent: (amount, currency) =>
    pipe(
      Effect.tryPromise(() =>
        stripe.paymentIntents.create({
          amount,
          currency,
          payment_method: 'pm_card_visa',
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          }
        })
      ),
      Effect.map((pi) => pi.id),
      Effect.mapError((error) => error as Error)
    ),

  confirmPayment: (paymentIntentId) =>
    pipe(
      Effect.tryPromise(() => stripe.paymentIntents.confirm(paymentIntentId)),
      Effect.map(() => true),
      Effect.mapError((error) => error as Error)
    ),

  createCheckoutSession: (amount, currency, successUrl, cancelUrl) =>
    pipe(
      Effect.tryPromise(() =>
        stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name: 'Payment',
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
        })
      ),
      Effect.map((session) => session.url!),
      Effect.mapError((error) => error as Error)
    ),

  getSession: (sessionId) =>
    pipe(
      Effect.tryPromise(() => stripe.checkout.sessions.retrieve(sessionId)),
      Effect.mapError((error) => error as Error)
    ),

  verifyWebhook: (body, signature) =>
    pipe(
      Effect.try(() => stripe.webhooks.constructEvent(body, signature!, stripeWebhookSecret)),
      Effect.mapError(error => new Error(String(error)))
    )
};
