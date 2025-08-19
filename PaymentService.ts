import { Effect } from "@effect/io/Effect";
import { Tag } from "@effect/data/Context";
import Stripe from "stripe";

export interface PaymentService {
    createPaymentIntent: (amount: number, currency: string) => Effect<never, Error, string>;
    confirmPayment: (paymentIntentId: string) => Effect<never, Error, boolean>;
    createCheckoutSession: (amount: number, currency: string, successUrl: string, cancelUrl: string) => Effect<never, Error, string>;
    getSession: (sessionId: string) => Effect<never, Error, Stripe.Checkout.Session>;
    verifyWebhook: (body: string, signature: string) => Effect<never, Error, Stripe.Event>;
}

export const PaymentService = Tag<PaymentService>();