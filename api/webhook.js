import Stripe from "stripe";
import { MongoClient } from "mongodb";
import { sendEmails } from "./reservations";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const client = new MongoClient(process.env.MONGODB_URI);

let db;
async function getDB() { if(!db){ await client.connect(); db = client.db(); } return db.collection("reservations"); }

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch(err){
    console.log("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if(event.type === "checkout.session.completed"){
    const session = event.data.object;
    const collection = await getDB();
    const reservation = await collection.findOne({ stripeSessionId: session.id });
    if(reservation){
      await collection.updateOne({ _id: reservation._id }, { $set: { status: "confirmed" } });
      await sendEmails({ ...reservation, depositPaid: session.amount_total/100 });
    }
  }
  res.json({ received: true });
}
