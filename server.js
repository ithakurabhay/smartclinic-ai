require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.send("SmartClinic AI Server is Running ✅");
});

// ===============================
// PRIVACY POLICY
// ===============================

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

// ===============================
// WEBHOOK VERIFICATION
// ===============================

app.get("/webhook", (req, res) => {

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

// ===============================
// USER SESSIONS
// ===============================

const userSessions = {};
let tokenNumber = 0;

// ===============================
// SEND TEXT MESSAGE
// ===============================

async function sendText(to, body) {

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
                to: to,
                type: "text",
                text: {
                    preview_url: false,
                    body: body
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
}

// ===============================
// LANGUAGE MENU
// ===============================

async function sendLanguageMenu(to) {

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
                to: to,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: {
                        text:
                            "Namaste 👋 Welcome to SmartClinic AI 🏥\n\n" +
                            "Please select your language:"
                    },
                    action: {
                        buttons: [
                            {
                                type: "reply",
                                reply: {
                                    id: "LANG_HI",
                                    title: "🇮🇳 हिंदी"
                                }
                            },
                            {
                                type: "reply",
                                reply: {
                                    id: "LANG_EN",
                                    title: "🇬🇧 English"
                                }
                            }
                        ]
                    }
                }
            })
        }
    );

    const result = await response.json();

    console.log(
        "Language Menu Result:",
        JSON.stringify(result, null, 2)
    );
}

// ===============================
// MAIN MENU
// ===============================

async function sendMainMenu(to, language = "hi") {

    const isHindi = language === "hi";

    const bodyText = isHindi
        ? "SmartClinic AI 🏥\n\nकृपया नीचे दिए गए विकल्प में से चुनें:"
        : "SmartClinic AI 🏥\n\nPlease select an option:";

    const buttonText = isHindi
        ? "मुख्य मेनू"
        : "Main Menu";

    const rows = isHindi
        ? [
            {
                id: "TOKEN",
                title: "🏥 टोकन बुक करें",
                description: "नया टोकन बुक करें"
            },
            {
                id: "APPOINTMENT",
                title: "📅 अपॉइंटमेंट बुक करें",
                description: "डॉक्टर से अपॉइंटमेंट लें"
            },
            {
                id: "DOCTOR_TIME",
                title: "🕐 डॉक्टर का समय",
                description: "डॉक्टर की उपलब्धता देखें"
            },
            {
                id: "EMERGENCY",
                title: "🚨 इमरजेंसी",
                description: "आपातकालीन सहायता"
            }
        ]
        : [
            {
                id: "TOKEN",
                title: "🏥 Book Token",
                description: "Book a new token"
            },
            {
                id: "APPOINTMENT",
                title: "📅 Book Appointment",
                description: "Book an appointment"
            },
            {
                id: "DOCTOR_TIME",
                title: "🕐 Doctor Timing",
                description: "Check doctor availability"
            },
            {
                id: "EMERGENCY",
                title: "🚨 Emergency",
                description: "Emergency assistance"
            }
        ];

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
                to: to,
                type: "interactive",
                interactive: {
                    type: "list",
                    body: {
                        text: bodyText
                    },
                    action: {
                        button: buttonText,
                        sections: [
                            {
                                title: isHindi
                                    ? "SmartClinic सेवाएं"
                                    : "SmartClinic Services",
                                rows: rows
                            }
                        ]
                    }
                }
            })
        }
    );

    const result = await response.json();

    console.log(
        "Main Menu Result:",
        JSON.stringify(result, null, 2)
    );
}

// ===============================
// WHATSAPP WEBHOOK
// ===============================

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

        const text =
            message.text?.body?.trim() || "";

        const buttonId =
            message.interactive?.button_reply?.id || "";

        const listId =
            message.interactive?.list_reply?.id || "";

        const selectedId =
            buttonId || listId;

        console.log("Message received from:", from);
        console.log("Text:", text);
        console.log("Selected ID:", selectedId);

        // ===============================
        // CREATE SESSION
        // ===============================

        if (!userSessions[from]) {

            userSessions[from] = {
                step: "START",
                language: null,
                name: ""
            };
        }

        const session = userSessions[from];

        // ===============================
        // HI / HELLO
        // ===============================

        if (
            text.toLowerCase() === "hi" ||
            text.toLowerCase() === "hello" ||
            text.toLowerCase() === "hey" ||
            text.toLowerCase() === "namaste"
        ) {

            session.step = "LANGUAGE";

            await sendLanguageMenu(from);

            return res.sendStatus(200);
        }

        // ===============================
        // LANGUAGE SELECTION
        // ===============================

        if (selectedId === "LANG_HI") {

            session.language = "hi";
            session.step = "MENU";

            await sendMainMenu(from, "hi");

            return res.sendStatus(200);
        }

        if (selectedId === "LANG_EN") {

            session.language = "en";
            session.step = "MENU";

            await sendMainMenu(from, "en");

            return res.sendStatus(200);
        }

        // ===============================
        // TOKEN BOOKING
        // ===============================

        if (selectedId === "TOKEN") {

            session.step = "WAITING_FOR_NAME";

            const reply =
                session.language === "en"
                    ? "Please send your name."
                    : "कृपया अपना नाम भेजें।";

            await sendText(from, reply);

            return res.sendStatus(200);
        }

        // ===============================
        // APPOINTMENT
        // ===============================

        if (selectedId === "APPOINTMENT") {

            session.step = "WAITING_FOR_APPOINTMENT_DATE";

            const reply =
                session.language === "en"
                    ? "📅 Please send your preferred appointment date.\n\nExample: 15-08-2026"
                    : "📅 कृपया अपॉइंटमेंट की तारीख भेजें।\n\nउदाहरण: 15-08-2026";

            await sendText(from, reply);

            return res.sendStatus(200);
        }

        // ===============================
        // DOCTOR TIME
        // ===============================

        if (selectedId === "DOCTOR_TIME") {

            const reply =
                session.language === "en"
                    ? "🕐 Doctor Timing\n\nDr. Sharma\nMonday to Saturday\n10:00 AM to 8:00 PM"
                    : "🕐 डॉक्टर का समय\n\nDr. Sharma\nसोमवार से शनिवार\nसुबह 10:00 बजे से शाम 8:00 बजे तक";

            await sendText(from, reply);

            await sendMainMenu(
                from,
                session.language || "hi"
            );

            return res.sendStatus(200);
        }

        // ===============================
        // EMERGENCY
        // ===============================

        if (selectedId === "EMERGENCY") {

            const reply =
                session.language === "en"
                    ? "🚨 EMERGENCY\n\nIf this is a medical emergency, please contact your nearest emergency service or visit the nearest hospital immediately."
                    : "🚨 इमरजेंसी\n\nअगर यह मेडिकल इमरजेंसी है, तो तुरंत नजदीकी अस्पताल या इमरजेंसी सेवा से संपर्क करें।";

            await sendText(from, reply);

            await sendMainMenu(
                from,
                session.language || "hi"
            );

            return res.sendStatus(200);
        }

        // ===============================
        // TOKEN NAMEgit push origin master
        // ===============================

        if (session.step === "WAITING_FOR_NAME") {

            if (!text) {
                return res.sendStatus(200);
            }

            session.name = text;

            if (tokenNumber >= 100) {

                const reply =
                    session.language === "en"
                        ? "Sorry 😔 All 100 tokens for today are already booked."
                        : "माफ़ कीजिए 😔 आज के सभी 100 टोकन बुक हो चुके हैं।";

                await sendText(from, reply);

                return res.sendStatus(200);
            }

            tokenNumber++;

            const reply =
                session.language === "en"
                    ? `Token booking successful ✅\n\nName: ${session.name}\nToken Number: #${tokenNumber}\n\nYour SmartClinic token is confirmed. 🙏`
                    : `टोकन बुकिंग सफल ✅\n\nनाम: ${session.name}\nटोकन नंबर: #${tokenNumber}\n\nSmartClinic में आपका टोकन कन्फर्म है। 🙏`;

            session.step = "DONE";

            await sendText(from, reply);

            return res.sendStatus(200);
        }

        // ===============================
        // APPOINTMENT DATE
        // ===============================

        if (session.step === "WAITING_FOR_APPOINTMENT_DATE") {

            const date = text;

            session.appointmentDate = date;

            const reply =
                session.language === "en"
                    ? `📅 Appointment request received.\n\nDate: ${date}\nDoctor: Dr. manu\n\nWe will confirm your appointment shortly.`
                    : `📅 अपॉइंटमेंट रिक्वेस्ट प्राप्त हुई।\n\nतारीख: ${date}\nडॉक्टर: Dr. manu\n\nआपकी अपॉइंटमेंट जल्द कन्फर्म की जाएगी।`;

            session.step = "MENU";

            await sendText(from, reply);

            await sendMainMenu(
                from,
                session.language || "hi"
            );

            return res.sendStatus(200);
        }

        // ===============================
        // DONE / OLD TOKEN
        // ===============================

        if (session.step === "DONE") {

            if (text.toLowerCase() === "new") {

                session.step = "WAITING_FOR_NAME";
                session.name = "";

                const reply =
                    session.language === "en"
                        ? "Okay 👍\n\nPlease send your name for the new token."
                        : "ठीक है 👍\n\nनए टोकन के लिए अपना नाम भेजें।";

                await sendText(from, reply);

                return res.sendStatus(200);
            }

            await sendMainMenu(
                from,
                session.language || "hi"
            );

            return res.sendStatus(200);
        }

        // ===============================
        // FALLBACK
        // ===============================

        await sendMainMenu(
            from,
            session.language || "hi"
        );

        res.sendStatus(200);

    } catch (error) {

        console.error("Reply error:", error);
        res.sendStatus(500);
    }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(
        `SmartClinic AI Server running on port ${PORT}`
    );
});