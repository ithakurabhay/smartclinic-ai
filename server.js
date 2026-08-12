require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/", (req, res) => {
    res.send("SmartClinic AI Server is Running ✅");
});
app.get("/privacy-policy", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>SmartClinic AI - Privacy Policy</title>
        </head>
        <body>
            <h1>SmartClinic AI Privacy Policy</h1>
            <p>SmartClinic AI respects your privacy.</p>

            <h2>Information We Collect</h2>
            <p>
                We may receive your WhatsApp phone number and messages
                necessary for token booking and appointment services.
            </p>

            <h2>How We Use Information</h2>
            <p>
                We use this information only to provide SmartClinic AI
                token booking and appointment services.
            </p>

            <h2>Data Sharing</h2>
            <p>We do not sell your personal information to third parties.</p>

            <h2>Contact</h2>
            <p>Contact the SmartClinic AI team for privacy questions.</p>
        </body>
        </html>
    `);
});

// WhatsApp webhook verification
app.get("/webhook", (req, res) => {

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully ✅");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Receive WhatsApp messages
app.post("/webhook", async (req, res) => {

    console.log("WhatsApp Webhook Received:");
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const message =
            req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {
            const from = message.from;

            console.log("Message received from:", from);

            const response = await fetch(
 `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "text",
      text: {
        preview_url: false,
        body: "Hello 👋 SmartClinic AI is active! Your message has been received."
      }
    })
  }
);

const result = await response.json();

console.log("WhatsApp API Status:", response.status);
console.log("WhatsApp API Result:", JSON.stringify(result, null, 2));


        }

        res.sendStatus(200);

    } catch (error) {
        console.error("Reply error:", error);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`SmartClinic AI Server running on port ${PORT}`);
});

