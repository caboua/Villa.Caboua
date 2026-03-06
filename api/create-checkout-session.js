import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const { name, email, startDate, endDate, adults, children, total } = req.body;
    if(!name || !email || !startDate || !endDate || !total)
      return res.status(400).json({ error:"Données manquantes" });

    // Envoi vers Zapier
    try {
      await fetch(ZAPIER_WEBHOOK_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name,email,startDate,endDate,adults,children,total })
      });
    } catch(e){ console.error("Erreur Zapier:", e); }

    // Session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      mode:"payment",
      customer_email: email,
      line_items:[{
        price_data:{
          currency:"eur",
          product_data:{ name:`Réservation Villa CABOUA (${startDate} → ${endDate})` },
          unit_amount: Math.round(total*100)
        },
        quantity:1
      }],
      success_url:`${req.headers.origin}?success=true`,
      cancel_url:`${req.headers.origin}?canceled=true`
    });

    res.status(200).json({ url: session.url });

  } catch(err){
    console.error("Erreur create-checkout-session:", err);
    res.status(500).json({ error: err.message });
  }
}
