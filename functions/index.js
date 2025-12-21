require('dotenv').config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Pune cheia ta SECRETĂ aici (sk_test_...)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  

admin.initializeApp();

// Aceasta este funcția API pe care o vom apela din React
exports.createStripeCheckout = functions.https.onRequest(async (req, res) => {
  // Setam CORS manual ca sa putem apela functia de pe orice domeniu (localhost sau vercel)
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Raspundem la cererile pre-flight (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(400).send("Please send a POST request");
    return;
  }

  try {
    const { items, email, orderId } = req.body;

    // Transformam produsele pentru Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "ron",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Bani in bani (LEI * 100)
      },
      quantity: item.quantity,
    }));

    // Logica taxa transport (sub 100 RON)
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (subtotal < 100) {
        lineItems.push({
            price_data: {
                currency: 'ron',
                product_data: {
                    name: 'Transport Rapid (FanCourier)',
                },
                unit_amount: 2000, // 20.00 RON
            },
            quantity: 1,
        });
    }

    // Cream sesiunea
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: email,
      success_url: `${req.headers.origin}/profile?success=true`,
      cancel_url: `${req.headers.origin}/checkout?canceled=true`,

      metadata: {
      orderId: orderId 
        }
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  // --- RAW BODY FIX ---
  let rawBody;
  if (req.rawBody) {
    rawBody = req.rawBody;
  } else {
    rawBody = req.body;
  }
  // --------------------

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    if (orderId) {
        console.log(`💰 Plata confirmata pentru comanda: ${orderId}. Actualizez stocul...`);
        
        const db = admin.firestore();
        const orderRef = db.collection("orders").doc(orderId);

        // 1. Luam datele comenzii ca sa stim ce produse s-au cumparat
        const orderSnap = await orderRef.get();
        
        if (orderSnap.exists) {
            const orderData = orderSnap.data();
            const items = orderData.items || [];

            // 2. Initializam un BATCH (grup de operatiuni)
            // Este mai eficient decat sa facem update unul cate unul
            const batch = db.batch();

            // 3. Trecem prin fiecare produs si ii scadem stocul
            items.forEach((item) => {
                // Presupunand ca item are campul 'id' (ID-ul produsului din baza de date)
                if (item.id) {
                    const productRef = db.collection("products").doc(item.id);
                    
                    // Folosim increment(-cantitate) ca sa scadem
                    // Ex: Daca a luat 2 bucati, scadem 2
                    batch.update(productRef, {
                        stock: admin.firestore.FieldValue.increment(-item.quantity)
                    });
                }
            });

            // 4. Actualizam si statusul comenzii in acelasi timp
            batch.update(orderRef, {
                status: "processing",
                isPaid: true,
                paymentMethod: "stripe_webhook",
                paidAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 5. Executam toate modificarile deodata
            await batch.commit();
            console.log("✅ Stoc actualizat si comanda marcata ca platita.");
        }
    }
  }

  res.json({ received: true });
});