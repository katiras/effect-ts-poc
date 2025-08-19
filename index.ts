import "dotenv/config"
import express from "express"
import swaggerUi from "swagger-ui-express"
import * as Effect from "@effect/io/Effect"
import { pipe } from "@effect/data/Function";
import { PaymentService } from "./PaymentService"
import { PaymentServiceLive } from "./PaymentServiceLive"
import Stripe from "stripe";

const app = express()
app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(require('./swagger-output.json')))

app.post("/create-checkout", (req, res) => {
  const amount = req.body.amount
  const currency = req.body.currency

  return Effect.runPromise(
    PaymentService.pipe(
      Effect.provideService(PaymentService, PaymentServiceLive),
      Effect.flatMap(svc => svc.createCheckoutSession(amount, currency, successUrl, cancelUrl)),
      Effect.map(checkoutUrl => ({ checkoutUrl }))
    ))
    .then(result => res.json(result))
    .catch(error => { res.status(500).json({ error }) })
})

app.get("/success", (req, res) => {
  const { session_id } = req.query

  return Effect.runPromise(
    pipe(
      Effect.sync(() => session_id),
      Effect.filterOrFail(
        (id): id is string => !!id,
        () => new MissingSessionIdError()
      ),
      Effect.flatMap(id =>
        PaymentService.pipe(
          Effect.provideService(PaymentService, PaymentServiceLive),
          Effect.flatMap(svc => svc.getSession(id.toString()))
        )
      ),
      Effect.map(session => successPageHtml(session)),
      Effect.catchTag(MissingSessionIdError.name, (error) => Effect.sync(() => res.status(400).send({ message: error.message })))))
    .then(html => res.send(html))
    .catch(error => res.status(500).json({ error }))
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Swagger docs at http://localhost:${PORT}/docs`)
})

const successUrl = "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}"
const cancelUrl = "http://localhost:3000/cancel"
const successPageHtml = (session: Stripe.Checkout.Session) => `
  <html>
    <head><title>Payment Processing</title></head>
    <body>
      <h1>Payment Received!</h1>
      <p>We're processing your payment. You'll receive confirmation shortly.</p>
      <pre>${JSON.stringify(session, null, 2)}</pre>
      <script>
        setTimeout(() => {
          window.location.href = '/payment-status?session=' + '${session.id}'
        }, 10000)
      </script>
    </body>
  </html>
`

class MissingSessionIdError extends Error {
  readonly _tag = MissingSessionIdError.name
  constructor() {
    super("Missing session id")
  }
}