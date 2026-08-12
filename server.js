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
const userSessions = {};
let tokenNumber = 0;

app.post("/webhook", async (req, res) => {

    console.log("WhatsApp Webhook Received:");
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const message =
            req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) {
            return res.sendStatus(200);
        }

        const from = message.from;
        const text = message.text?.body?.trim() || "";

        console.log("Message received from:", from);
        console.log("Text:", text);

        // Create session for new user
        if (!userSessions[from]) {
            userSessions[from] = {
                step: "START",
                name: ""
            };
        }

        const session = userSessions[from];

        let reply = "";

        // STEP 1
        if (session.step === "START") {
            reply =
                "Namaste 👋 SmartClinic mein token book karne ke liye 1 bhejiye.";
            session.step = "WAITING_FOR_ONE";
        }

        // STEP 2
        else if (session.step === "WAITING_FOR_ONE") {

            if (text === "1") {
                reply = "Apna naam bhejiye.";
                session.step = "WAITING_FOR_NAME";
            } else {
                reply = "Token book karne ke liye sirf 1 bhejiye.";
            }
        }

        // STEP 3
        else if (session.step === "WAITING_FOR_NAME") {

            session.name = text;

            if (tokenNumber >= 100) {
                reply =
                    "Sorry 😔 Aaj ke saare 100 tokens book ho chuke hain.";
            } else {
                tokenNumber++;

                reply =
                    `Token booking successful ✅\n\n` +
                    `Name: ${session.name}\n` +
                    `Token Number: #${tokenNumber}\n\n` +
                    `SmartClinic mein aapka token confirm hai. 🙏`;

                session.step = "DONE";
            }
        }

        // STEP 4
        else if (session.step === "DONE") {

            reply =
                `Aapka token #${tokenNumber} already booked hai. ✅\n\n` +
                `Naya token book karne ke liye "new" bhejiye.`;
        }

        // NEW BOOKING
        if (text.toLowerCase() === "new") {

            userSessions[from] = {
                step: "WAITING_FOR_ONE",
                name: ""
            };

            reply =
                "Theek hai 👍\n\nNaya token book karne ke liye 1 bhejiye.";
        }

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
                        body: reply
                    }
                })
            }
        );

        const result = await response.json();

        console.log("WhatsApp API Status:", response.status);
        console.log(
            "WhatsApp API Result:",
            JSON.stringify(result, null, 2)
        );

        res.sendStatus(200);

    } catch (error) {
        console.error("Reply error:", error);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`SmartClinic AI Server running on port ${PORT}`);
});

