import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Method Not Allowed" });
  }

  try {
    const { nights, guests } = req.body;

    const amountPerNight = 180;
    const cleaningFee = 120;
    const taxPerPerson = 1.5;

    const priceRental = nights * amountPerNight;
    const tax = nights * guests * taxPerPerson;
    const totalAmount = priceRental + tax + cleaningFee;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Séjour Villa CABOUA",
              description: `${nights} nuits pour ${guests} voyageurs`
            },
            unit_amount: totalAmount * 100
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/index.html`
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe checkout session failed" });
  }
}
