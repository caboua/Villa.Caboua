import express from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pour lire les webhooks Stripe
app.use(
  "/api/webhook-stripe",
  bodyParser.raw({ type: "application/json" })
);
app.use(bodyParser.json());

// ======== CREATE CHECKOUT SESSION ========
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { total } = req.body; // facultatif si tu veux passer le montant dynamiquement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Réservation Villa CABOUA"
            },
            unit_amount: 50000 // 500€ pour test
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}?success=true`,
      cancel_url: `${req.headers.origin}?canceled=true`
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======== WEBHOOK STRIPE ========
app.post("/api/webhook-stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Si paiement complété
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Envoi email au propriétaire et au client
    await sendEmails(session);
  }

  res.status(200).json({ received: true });
});

// ======== NODEMAILER ========
async function sendEmails(session) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email au propriétaire
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Nouvelle réservation Villa CABOUA",
    text: `Une nouvelle réservation a été effectuée.\n\nSession ID: ${session.id}`
  });

  // Email au client (si email fourni)
  if (session.customer_email) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: session.customer_email,
      subject: "Confirmation réservation Villa CABOUA",
      text: `Merci pour votre réservation !\n\nSession ID: ${session.id}`
    });
  }

  console.log("✅ Emails envoyés avec succès");
}

// ======== LANCEMENT DU SERVEUR ========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});