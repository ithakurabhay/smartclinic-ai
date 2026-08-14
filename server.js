require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

/* =========================================================
   CONFIG
========================================================= */

const PORT = process.env.PORT || 3000;

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "smartclinic_verify_2026";

const CLINIC_NAME = process.env.CLINIC_NAME || "SmartClinic AI";
const DOCTOR_NAME = process.env.DOCTOR_NAME || "Dr. SmartClinic";

const GRAPH_VERSION = process.env.GRAPH_VERSION || "v23.0";

const WHATSAPP_URL =
  `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;


/* =========================================================
   POSTGRESQL
========================================================= */

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "smartclinic",
});


/* =========================================================
   TEXT DICTIONARY
========================================================= */

const TEXTS = {

  en: {

    welcome:
      `Welcome to *${CLINIC_NAME}* 🏥\n\nPlease select your preferred language:`,

    langEnglish: "🇬🇧 English",
    langHindi: "🇮🇳 हिंदी",

    askName:
      "Great! What is your *full name*?",

    invalidName:
      "Please enter a valid name using letters only.",

    askPhone:
      "Thanks! Please share your *10-digit phone number*.",

    invalidPhone:
      "Please enter a valid 10-digit phone number.",

    registrationDone: (name) =>
      `Thank you, *${name}*!\n\nYour registration is complete ✅`,

      mainMenuHeader: (name) =>
  `Hi *${name}* 👋\n\nHow can we help you today?`,

    mainMenuButton: "📋 Open Menu",

    book: "📅 Book Appointment",
    timing: "👨‍⚕️ Doctor Timings",
    emergency: "🚨 Emergency",
    token: "🎟️ Token / Queue Status",
    language: "🌐 Change Language",
    details: "👤 My Details",

    mainMenu: "🏠 Main Menu",

    chooseDate:
      "📅 Please choose a date for your appointment:",

    chooseDateButton:
      "Select Date",

    chooseSlot:
      "🕐 Choose an available time slot:",

    noSlots:
      "Sorry, no slots are available for this date.",

    confirmAppointment: (date, slot) =>
      `Please confirm your appointment:\n\n📅 Date: *${date}*\n🕐 Slot: *${slot}*\n👨‍⚕️ Doctor: *${DOCTOR_NAME}*`,

    confirmYes: "✅ Confirm",
    confirmNo: "❌ Cancel",

    appointmentBooked: (token, date, slot) =>
      `🎉 *Appointment booked successfully!*\n\n🎟️ Token Number: *${token}*\n📅 Date: *${date}*\n🕐 Slot: *${slot}*\n👨‍⚕️ Doctor: *${DOCTOR_NAME}*\n\nPlease arrive a few minutes before your appointment. 🙏`,

    appointmentCancelled:
      "❌ Your appointment request was cancelled.\n\nYou can start again anytime from the Main Menu.",

    doctorTiming:
      `👨‍⚕️ *${DOCTOR_NAME} - Consultation Timings*\n\nMonday - Saturday\n🕙 10:00 AM - 1:00 PM\n🕔 5:00 PM - 8:00 PM\n\nSunday: Closed`,

    emergency:
      "🚨 *Emergency Assistance*\n\nIf this is a life-threatening medical emergency, please contact your nearest hospital/emergency service immediately.\n\nDo not wait for a WhatsApp response.",

    emergencyRecorded:
      "🚨 Your emergency request has been recorded.\n\nPlease contact the nearest emergency medical service immediately. Our staff will review your request as soon as possible.",

    noToken:
      "🎟️ You do not have any active appointment/token for today.\n\nWould you like to book an appointment?",

    tokenStatus: (token, date, slot, position) =>
      `🎟️ *Your Token: ${token}*\n\n📅 Date: ${date}\n🕐 Slot: ${slot}\n👥 Patients ahead of you: ${position}`,

    myDetails: (name, phone, lang) =>
      `👤 *Your Details*\n\nName: ${name}\nPhone: ${phone}\nLanguage: ${lang === "hi" ? "Hindi" : "English"}`,

    languageChanged:
      "🌐 Language changed successfully.",

    invalidInput:
      "⚠️ Sorry, I didn't understand that.\n\nPlease choose one of the available options.",

    back:
      "⬅️ Back",

    yes:
      "Yes",

    no:
      "No"
  },


  hi: {

    welcome:
      `*${CLINIC_NAME}* में आपका स्वागत है 🏥\n\nकृपया अपनी पसंदीदा भाषा चुनें:`,

    langEnglish: "🇬🇧 English",
    langHindi: "🇮🇳 हिंदी",

    askName:
      "बहुत बढ़िया! कृपया अपना *पूरा नाम* भेजें।",

    invalidName:
      "कृपया सही नाम दर्ज करें।",

    askPhone:
      "धन्यवाद! कृपया अपना *10 अंकों का मोबाइल नंबर* भेजें।",

    invalidPhone:
      "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।",

    registrationDone: (name) =>
      `धन्यवाद, *${name}*!\n\nआपका रजिस्ट्रेशन पूरा हो गया है ✅`,

    mainMenuButton: "📋 मुख्य मेनू",

    book: "📅 अपॉइंटमेंट बुक करें",
    timing: "👨‍⚕️ डॉक्टर का समय",
    emergency: "🚨 इमरजेंसी",
    token: "🎟️ टोकन / कतार स्थिति",
    language: "🌐 भाषा बदलें",
    details: "👤 मेरी जानकारी",

    mainMenu: "🏠 मुख्य मेनू",

    chooseDate:
      "📅 कृपया अपॉइंटमेंट के लिए तारीख चुनें:",

    chooseDateButton:
      "तारीख चुनें",

    chooseSlot:
      "🕐 कृपया उपलब्ध समय चुनें:",

    noSlots:
      "क्षमा करें, इस तारीख के लिए कोई स्लॉट उपलब्ध नहीं है।",

    confirmAppointment: (date, slot) =>
      `कृपया अपना अपॉइंटमेंट कन्फर्म करें:\n\n📅 तारीख: *${date}*\n🕐 समय: *${slot}*\n👨‍⚕️ डॉक्टर: *${DOCTOR_NAME}*`,

    confirmYes: "✅ कन्फर्म",
    confirmNo: "❌ कैंसल",

    appointmentBooked: (token, date, slot) =>
      `🎉 *अपॉइंटमेंट सफलतापूर्वक बुक हो गया!*\n\n🎟️ टोकन नंबर: *${token}*\n📅 तारीख: *${date}*\n🕐 समय: *${slot}*\n👨‍⚕️ डॉक्टर: *${DOCTOR_NAME}*\n\nकृपया अपॉइंटमेंट से कुछ मिनट पहले पहुंचें। 🙏`,

    appointmentCancelled:
      "❌ आपका अपॉइंटमेंट कैंसल कर दिया गया है।\n\nआप मुख्य मेनू से दोबारा शुरू कर सकते हैं।",

    doctorTiming:
      `👨‍⚕️ *${DOCTOR_NAME} - डॉक्टर का समय*\n\nसोमवार - शनिवार\n🕙 सुबह 10:00 - दोपहर 1:00\n🕔 शाम 5:00 - रात 8:00\n\nरविवार: बंद`,

    emergency:
      "🚨 *इमरजेंसी सहायता*\n\nअगर यह जानलेवा मेडिकल इमरजेंसी है, तो तुरंत नजदीकी अस्पताल या इमरजेंसी सेवा से संपर्क करें।\n\nWhatsApp जवाब का इंतजार न करें।",

    emergencyRecorded:
      "🚨 आपकी इमरजेंसी रिक्वेस्ट रिकॉर्ड कर ली गई है।\n\nकृपया तुरंत नजदीकी इमरजेंसी मेडिकल सेवा से संपर्क करें। हमारी टीम आपकी रिक्वेस्ट जल्द से जल्द देखेगी।",

    noToken:
      "🎟️ आज के लिए आपका कोई एक्टिव अपॉइंटमेंट/टोकन नहीं है।\n\nक्या आप अपॉइंटमेंट बुक करना चाहते हैं?",

    tokenStatus: (token, date, slot, position) =>
      `🎟️ *आपका टोकन: ${token}*\n\n📅 तारीख: ${date}\n🕐 समय: ${slot}\n👥 आपसे आगे मरीज: ${position}`,

    myDetails: (name, phone, lang) =>
      `👤 *आपकी जानकारी*\n\nनाम: ${name}\nफोन: ${phone}\nभाषा: ${lang === "hi" ? "हिंदी" : "English"}`,

    languageChanged:
      "🌐 भाषा सफलतापूर्वक बदल दी गई है।",

    invalidInput:
      "⚠️ माफ कीजिए, मैं इसे समझ नहीं पाया।\n\nकृपया उपलब्ध विकल्पों में से चुनें।",

    back:
      "⬅️ वापस",

    yes:
      "हाँ",

    no:
      "नहीं"
  }

};


/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function initDB() {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(30) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      language VARCHAR(5) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      phone VARCHAR(30) PRIMARY KEY,
      state VARCHAR(50) DEFAULT 'START',
      temp_data JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(30) NOT NULL,
      patient_name VARCHAR(150) NOT NULL,
      appointment_date DATE NOT NULL,
      slot VARCHAR(50) NOT NULL,
      token_number INTEGER NOT NULL,
      status VARCHAR(30) DEFAULT 'BOOKED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(appointment_date, slot, token_number)
    );
  `);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS emergency_requests (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(30) NOT NULL,
      patient_name VARCHAR(150),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  console.log("✅ Database schema verified/created successfully.");
}


/* =========================================================
   DATABASE HELPERS
========================================================= */

async function getPatient(phone) {

  const result = await pool.query(
    `SELECT * FROM patients WHERE phone = $1`,
    [phone]
  );

  return result.rows[0] || null;
}


async function savePatient(phone, name, language) {

  await pool.query(
    `
    INSERT INTO patients (phone, name, language)
    VALUES ($1, $2, $3)
    ON CONFLICT (phone)
    DO UPDATE SET
      name = EXCLUDED.name,
      language = EXCLUDED.language,
      updated_at = CURRENT_TIMESTAMP
    `,
    [phone, name, language]
  );
}


async function getSession(phone) {

  const result = await pool.query(
    `SELECT * FROM sessions WHERE phone = $1`,
    [phone]
  );

  return result.rows[0] || {
    phone,
    state: "START",
    temp_data: {}
  };
}


async function setSession(phone, state, tempData = {}) {

  await pool.query(
    `
    INSERT INTO sessions (phone, state, temp_data)
    VALUES ($1, $2, $3)
    ON CONFLICT (phone)
    DO UPDATE SET
      state = EXCLUDED.state,
      temp_data = EXCLUDED.temp_data,
      updated_at = CURRENT_TIMESTAMP
    `,
    [phone, state, JSON.stringify(tempData)]
  );
}


async function clearSession(phone) {

  await pool.query(
    `
    INSERT INTO sessions (phone, state, temp_data)
    VALUES ($1, 'MAIN_MENU', '{}'::jsonb)
    ON CONFLICT (phone)
    DO UPDATE SET
      state = 'MAIN_MENU',
      temp_data = '{}'::jsonb,
      updated_at = CURRENT_TIMESTAMP
    `,
    [phone]
  );
}


/* =========================================================
   WHATSAPP SEND HELPERS
========================================================= */
async function sendWhatsApp(payload) {

  if (!PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    throw new Error(
      "PHONE_NUMBER_ID or WHATSAPP_TOKEN is missing in .env"
    );
  }

  try {

    await axios.post(
      WHATSAPP_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

  } catch (error) {

    console.error(
      "❌ WhatsApp API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


/* =========================================================
   TEXT MESSAGE
========================================================= */

async function sendText(to, body) {

  await sendWhatsApp({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",

    text: {
      preview_url: false,
      body
    }
  });
}


/* =========================================================
   BUTTON MESSAGE
========================================================= */

async function sendButtons(to, body, buttons) {

  await sendWhatsApp({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",

    interactive: {
      type: "button",

      body: {
        text: body
      },

      action: {
        buttons: buttons
          .slice(0, 3)
          .map((button) => ({
            type: "reply",

            reply: {
              id: button.id,
              title: button.title.slice(0, 20)
            }
          }))
      }
    }
  });
}


/* =========================================================
   LIST MESSAGE
========================================================= */

 async function sendList(to, body, buttonText, sections) {

  const rows = (sections?.[0]?.rows || [])
    .slice(0, 10)
    .map(row => ({
      id: String(row.id).slice(0, 200),
      title: String(row.title || "").slice(0, 24),
      ...(row.description
        ? { description: String(row.description).slice(0, 72) }
        : {})
    }));

  if (!rows.length) {
    throw new Error("sendList: No rows available");
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: String(to),

    type: "interactive",

    interactive: {
      type: "list",

      body: {
        text: String(body).slice(0, 1024)
      },

      action: {
        button: String(buttonText || "Select").slice(0, 20),

        sections: [
          {
            title: String(
              sections?.[0]?.title || "SmartClinic"
            ).slice(0, 24),

            rows
          }
        ]
      }
    }
  };

  console.log(
    "📤 LIST ROW COUNT:",
    payload.interactive.action.sections[0].rows.length
  );

  console.log(
    "📤 LIST ROWS:",
    payload.interactive.action.sections[0].rows
  );

  await sendWhatsApp(payload);
}

/* =========================================================
   LANGUAGE MENU
========================================================= */

async function sendLanguageMenu(to) {

  await sendButtons(
    to,

    `🌐 Select Language / भाषा चुनें`,

    [
      {
        id: "LANG_EN",
        title: "🇬🇧 English"
      },
      {
        id: "LANG_HI",
        title: "🇮🇳 हिंदी"
      }
    ]
  );
}


/* =========================================================
   MAIN MENU
========================================================= */

async function sendMainMenu(to, patient) {

  const lang = patient.language || "en";
  const t = TEXTS[lang];

  await sendList(
    to,

    t.mainMenuHeader(patient.name),

    t.mainMenuButton,

    [
      {
        title: "SmartClinic",

        rows: [

          {
            id: "BOOK_APPOINTMENT",
            title: t.book
          },

          {
            id: "DOCTOR_TIMING",
            title: t.timing
          },

          {
            id: "EMERGENCY",
            title: t.emergency
          },

          {
            id: "TOKEN_STATUS",
            title: t.token
          },

          {
            id: "CHANGE_LANGUAGE",
            title: t.language
          },

          {
            id: "MY_DETAILS",
            title: t.details
          }
        ]
      }
    ]
  );
}


/* =========================================================
   DATE HELPERS
========================================================= */

function formatDate(date) {

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}


function getDateInputValue(daysFromToday) {

  const date = new Date();

  date.setHours(12, 0, 0, 0);

  date.setDate(
    date.getDate() + daysFromToday
  );

  return date.toISOString().split("T")[0];
}


/* =========================================================
   APPOINTMENT DATE MENU
========================================================= */

async function sendDateMenu(to, lang) {

  const t = TEXTS[lang];

  const rows = [];

  for (let i = 0; i < 7; i++) {

    const value = getDateInputValue(i);

    const label =
      i === 0
        ? (lang === "hi" ? "आज" : "Today")
        : i === 1
          ? (lang === "hi" ? "कल" : "Tomorrow")
          : formatDate(value);

    rows.push({
      id: `DATE_${value}`,
      title: label,
      description: value
    });
  }


  await sendList(
    to,
    t.chooseDate,
    t.chooseDateButton,
    [
      {
        title: lang === "hi" ? "उपलब्ध तारीखें" : "Available Dates",
        rows
      }
    ]
  );
}


/* =========================================================
   TIME SLOTS
========================================================= */

const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  
];


async function getAvailableSlots(date) {

  const result = await pool.query(
    `
    SELECT slot, COUNT(*)::int AS total
    FROM appointments
    WHERE appointment_date = $1
      AND status = 'BOOKED'
    GROUP BY slot
    `,
    [date]
  );

  const bookedMap = {};

  for (const row of result.rows) {
    bookedMap[row.slot] = row.total;
  }

  // Maximum 5 patients per slot.
  return TIME_SLOTS.filter(
    slot => (bookedMap[slot] || 0) < 5
  );
}


async function sendSlotMenu(to, date, lang) {

  const t = TEXTS[lang];

  const slots = await getAvailableSlots(date);

  if (!slots.length) {

    await sendText(
      to,
      t.noSlots
    );

    return;
  }


  const rows = slots.map((slot, index) => ({
    id: `SLOT_${index}_${Buffer.from(slot).toString("base64").replace(/=/g, "")}`,
    title: slot
  }));


  await sendList(
    to,

    `${t.chooseSlot}\n\n📅 ${formatDate(date)}`,

    "Select Slot",

    [
      {
        title: "Available Slots",
        rows
      }
    ]
  );
}


/* =========================================================
   TOKEN GENERATION
========================================================= */

async function generateToken(date, slot) {

  const result = await pool.query(
    `
    SELECT COALESCE(MAX(token_number), 0) + 1 AS next_token
    FROM appointments
    WHERE appointment_date = $1
      AND slot = $2
    `,
    [date, slot]
  );

  return Number(result.rows[0].next_token);
}


/* =========================================================
   START SERVER
========================================================= */

app.get("/", (req, res) => {

  res.json({
    status: "ok",
    service: "SmartClinic AI WhatsApp Bot",
    port: PORT
  });

});


/* =========================================================
   WEBHOOK VERIFICATION
========================================================= */

app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];


  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {

    console.log("✅ WhatsApp webhook verified.");

    return res.status(200).send(challenge);
  }


  return res.sendStatus(403);
});


/*
=========================================================
PART 1 END
=========================================================
*/
/* =========================================================
   PART 2A — INCOMING MESSAGE HELPERS
========================================================= */

function getIncomingMessage(messageBody) {

  try {

    const value =
      messageBody?.entry?.[0]?.changes?.[0]?.value;

    const message =
      value?.messages?.[0];

    if (!message) {
      return null;
    }

    const from =
      message.from;

    let type =
      message.type;

    let id = null;
    let text = "";

    if (type === "text") {

      text =
        message.text?.body?.trim() || "";

    } else if (type === "interactive") {

      const interactive =
        message.interactive;

      if (
        interactive?.type ===
        "button_reply"
      ) {

        id =
          interactive.button_reply?.id;

        text =
          interactive.button_reply?.title || "";

      } else if (
        interactive?.type ===
        "list_reply"
      ) {

        id =
          interactive.list_reply?.id;

        text =
          interactive.list_reply?.title || "";
      }
    }

    return {
      from,
      type,
      id,
      text
    };

  } catch (error) {

    console.error(
      "Incoming message parse error:",
      error.message
    );

    return null;
  }
}


/* =========================================================
   NAME VALIDATION
========================================================= */

function isValidName(name) {

  if (!name) {
    return false;
  }

  const cleaned =
    name.trim().replace(/\s+/g, " ");

  return (
    cleaned.length >= 2 &&
    /^[A-Za-zÀ-ÿ\u0900-\u097F\s.'-]+$/.test(cleaned)
  );
}


/* =========================================================
   PHONE VALIDATION
========================================================= */

function isValidPhone(phone) {

  const cleaned =
    String(phone || "")
      .replace(/\D/g, "");

  return /^[6-9]\d{9}$/.test(cleaned);
}


/* =========================================================
   GET PATIENT LANGUAGE
========================================================= */

async function getPatientLanguage(phone) {

  const patient =
    await getPatient(phone);

  if (!patient) {
    return "en";
  }

  return patient.language || "en";
}


/* =========================================================
   SEND REGISTER FLOW
========================================================= */

async function startRegistration(phone) {

  await setSession(
    phone,
    "WAIT_LANGUAGE",
    {}
  );

  await sendLanguageMenu(phone);
}


/* =========================================================
   LANGUAGE SELECTION
========================================================= */

async function handleLanguageSelection(
  phone,
  selectedLanguage
) {

  const patient =
    await getPatient(phone);


  /* Existing patient */

  if (patient) {

    await savePatient(
      phone,
      patient.name,
      selectedLanguage
    );

    await setSession(
      phone,
      "MAIN_MENU",
      {}
    );

    const t =
      TEXTS[selectedLanguage];

    await sendText(
      phone,
      t.languageChanged
    );

    await sendMainMenu(
      phone,
      {
        ...patient,
        language: selectedLanguage
      }
    );

    return;
  }


  /* New patient */

  await setSession(
    phone,
    "WAIT_NAME",
    {
      language: selectedLanguage
    }
  );

  await sendText(
    phone,
    TEXTS[selectedLanguage].askName
  );
}


/* =========================================================
   SAVE NEW PATIENT
========================================================= */

async function completeRegistration(
  phone,
  name,
  language
) {

  await savePatient(
    phone,
    name,
    language
  );

  await setSession(
    phone,
    "MAIN_MENU",
    {}
  );

  const t =
    TEXTS[language];

  await sendText(
    phone,
    t.registrationDone(name)
  );

  const patient =
    await getPatient(phone);

  await sendMainMenu(
    phone,
    patient
  );
}


/* =========================================================
   DOCTOR TIMING
========================================================= */

async function handleDoctorTiming(
  phone,
  lang
) {

  const t =
    TEXTS[lang];

  await sendText(
    phone,
    t.doctorTiming
  );

  const patient =
    await getPatient(phone);

  if (patient) {

    await setSession(
      phone,
      "MAIN_MENU",
      {}
    );

    await sendMainMenu(
      phone,
      patient
    );
  }
}


/* =========================================================
   EMERGENCY
========================================================= */

async function handleEmergency(phone, lang) {
  const t = TEXTS[lang] || TEXTS.en;

  await setSession(phone, "EMERGENCY_CONFIRM", {});

  await sendText(
    phone,
    lang === "hi"
      ? "🚨 क्या आप Emergency Booking करना चाहते हैं?"
      : "🚨 Do you want to make an Emergency Booking?"
  );

  await sendList(
    phone,
    lang === "hi" ? "विकल्प चुनें" : "Choose an option",
    [
      {
        title: "SmartClinic",
        rows: [
          {
            id: "EMERGENCY_YES",
            title: lang === "hi" ? "HA" : "YES"
          },
          {
            id: "EMERGENCY_NO",
            title: lang === "hi" ? "NAA" : "NO"
          }
        ]
      }
    ]
  );
}
  


/* =========================================================
   MY DETAILS
========================================================= */

async function handleMyDetails(
  phone,
  lang
) {

  const patient =
    await getPatient(phone);

  if (!patient) {

    await startRegistration(phone);
    return;
  }

  const t =
    TEXTS[lang];

  await sendText(
    phone,
    t.myDetails(
      patient.name,
      patient.phone,
      patient.language
    )
  );

  await setSession(
    phone,
    "MAIN_MENU",
    {}
  );

  await sendMainMenu(
    phone,
    patient
  );
}


/* =========================================================
   TOKEN STATUS
========================================================= */

async function handleTokenStatus(
  phone,
  lang
) {

  const patient =
    await getPatient(phone);

  if (!patient) {

    await startRegistration(phone);
    return;
  }

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const result =
    await pool.query(
      `
      SELECT *
      FROM appointments
      WHERE phone = $1
        AND appointment_date = $2
        AND status = 'BOOKED'
      ORDER BY id DESC
      LIMIT 1
      `,
      [phone, today]
    );

  const t =
    TEXTS[lang];

  if (!result.rows.length) {

    await sendText(
      phone,
      t.noToken
    );

  } else {

    const appointment =
      result.rows[0];

    const positionResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS position
        FROM appointments
        WHERE appointment_date = $1
          AND slot = $2
          AND token_number < $3
          AND status = 'BOOKED'
        `,
        [
          appointment.appointment_date,
          appointment.slot,
          appointment.token_number
        ]
      );

    const position =
      Number(
        positionResult.rows[0].position
      );

    await sendText(
      phone,

      t.tokenStatus(
        appointment.token_number,
        formatDate(
          appointment.appointment_date
        ),
        appointment.slot,
        position
      )
    );
  }

  await setSession(
    phone,
    "MAIN_MENU",
    {}
  );

  await sendMainMenu(
    phone,
    patient
  );
}
/* =========================================================
   PART 2B — APPOINTMENT + TOKEN FLOW
========================================================= */

/* =========================================================
   START APPOINTMENT BOOKING
========================================================= */

async function startBooking(
  phone,
  lang
) {

  await setSession(
    phone,
    "WAIT_DATE",
    {}
  );

  await sendDateMenu(
    phone,
    lang
  );
}


/* =========================================================
   DATE SELECTED
========================================================= */

async function handleDateSelection(
  phone,
  date,
  lang
) {

  if (!date) {
    return;
  }

  await setSession(
    phone,
    "WAIT_SLOT",
    {
      date
    }
  );

  await sendSlotMenu(
    phone,
    date,
    lang
  );
}


/* =========================================================
   SLOT SELECTED
========================================================= */

async function handleSlotSelection(
  phone,
  slot,
  lang
) {

  const session =
    await getSession(phone);

  if (text.toLowerCase() === "main menu") {
  await setSession(phone, "MAIN_MENU", {});
  await sendMainMenu(phone, patient);
  return;
}
  const date =
    session.temp_data?.date;

  if (!date || !slot) {

    await sendText(
      phone,
      TEXTS[lang].invalidInput
    );

    await startBooking(
      phone,
      lang
    );

    return;
  }

  const patient =
    await getPatient(phone);

  if (!patient) {

    await startRegistration(phone);
    return;
  }

  const t =
    TEXTS[lang];

  await setSession(
    phone,
    "WAIT_CONFIRM",
    {
      date,
      slot
    }
  );

  await sendButtons(
    phone,

    t.confirmAppointment(
      formatDate(date),
      slot
    ),

    [
      {
        id: "CONFIRM_YES",
        title: t.confirmYes
      },

      {
        id: "CONFIRM_NO",
        title: t.confirmNo
      }
    ]
  );
}


/* =========================================================
   CONFIRM APPOINTMENT
========================================================= */

async function confirmAppointment(
  phone,
  lang
) {

  const session =
    await getSession(phone);

  const date =
    session.temp_data?.date;

  const slot =
    session.temp_data?.slot;

  if (!date || !slot) {

    await sendText(
      phone,
      TEXTS[lang].invalidInput
    );

    await clearSession(phone);
    return;
  }

  const patient =
    await getPatient(phone);

  if (!patient) {

    await startRegistration(phone);
    return;
  }

  /* Check slot availability again */

  const availableSlots =
    await getAvailableSlots(date);

  if (!availableSlots.includes(slot)) {

    await sendText(
      phone,
      TEXTS[lang].noSlots
    );

    await startBooking(
      phone,
      lang
    );

    return;
  }

  /* Generate token */

  const token =
    await generateToken(
      date,
      slot
    );

  /* Save appointment */

  await pool.query(
    `
    INSERT INTO appointments
      (
        phone,
        patient_name,
        appointment_date,
        slot,
        token_number,
        status
      )
    VALUES
      ($1, $2, $3, $4, $5, 'BOOKED')
    `,
    [
      phone,
      patient.name,
      date,
      slot,
      token
    ]
  );

  await setSession(
    phone,
    "MAIN_MENU",
    {}
  );

  const t =
    TEXTS[lang];

  await sendText(
    phone,

    t.appointmentBooked(
      token,
      formatDate(date),
      slot
    )
  );

  await sendMainMenu(
    phone,
    patient
  );
}


/* =========================================================
   CANCEL APPOINTMENT
========================================================= */

async function cancelAppointment(
  phone,
  lang
) {

  const t =
    TEXTS[lang];

  await clearSession(
    phone
  );

  await sendText(
    phone,
    t.appointmentCancelled
  );

  const patient =
    await getPatient(phone);

  if (patient) {

    await sendMainMenu(
      phone,
      patient
    );
  }
}


/* =========================================================
   CHANGE LANGUAGE
========================================================= */

async function changeLanguage(
  phone
) {

  await setSession(
    phone,
    "WAIT_LANGUAGE_CHANGE",
    {}
  );

  await sendLanguageMenu(
    phone
  );
}


/* =========================================================
   MAIN MENU ACTION HANDLER
========================================================= */

async function handleMenuAction(
  phone,
  action
) {

  const patient =
    await getPatient(phone);

  if (!patient) {

    await startRegistration(phone);
    return;
  }

  const lang =
    patient.language || "en";

  switch (action) {

    case "BOOK_APPOINTMENT":

      await startBooking(
        phone,
        lang
      );

      break;


    case "DOCTOR_TIMING":

      await handleDoctorTiming(
        phone,
        lang
      );

      break;


    case "EMERGENCY":

      await handleEmergency(
        phone,
        lang
      );

      break;
      case "EMERGENCY_YES":

    await setSession(phone, "EMERGENCY_NAME", {});

    await sendText(
        phone,
        lang === "hi"
            ? "बहुत बढ़िया! कृपया मरीज का *पूरा नाम* भेजें।"
            : "Great! Please send the patient's *full name*."
    );

    break;


case "EMERGENCY_NO":

    await setSession(phone, "MAIN_MENU", {});

    const patient = await getPatient(phone);

    await sendMainMenu(phone, patient);

    break;


    case "TOKEN_STATUS":

      await handleTokenStatus(
        phone,
        lang
      );

      break;


    case "CHANGE_LANGUAGE":

      await changeLanguage(
        phone
      );

      break;


    case "MY_DETAILS":

      await handleMyDetails(
        phone,
        lang
      );

      break;


    default:

      await sendText(
        phone,
        TEXTS[lang].invalidInput
      );

      await sendMainMenu(
        phone,
        patient
      );
  }
}
/* =========================================================
   PART 2C — MESSAGE PROCESSING + WEBHOOK + SERVER START
========================================================= */

/* =========================================================
   PROCESS INCOMING MESSAGE
========================================================= */

async function processMessage(message) {

  const phone =
    message.from;

  const id =
    message.id;

  const text =
    message.text || "";

  console.log(
    `📩 Message received from ${phone}:`,
    id || text
  );

  let patient =
    await getPatient(phone);

  let session =
    await getSession(phone);


  /* =====================================================
     NEW PATIENT
  ===================================================== */

  if (!patient) {

    /* Language buttons */

    if (id === "LANG_EN") {

      await handleLanguageSelection(
        phone,
        "en"
      );

      return;
    }


    if (id === "LANG_HI") {

      await handleLanguageSelection(
        phone,
        "hi"
      );

      return;
    }


    /* Waiting for language */

    if (
      session.state ===
      "WAIT_LANGUAGE"
    ) {

      const lower =
        text.toLowerCase();

      if (
        lower === "english" ||
        lower === "en"
      ) {

        await handleLanguageSelection(
          phone,
          "en"
        );

        return;
      }


      if (
        lower === "hindi" ||
        lower === "hi" ||
        lower.includes("हिंदी")
      ) {

        await handleLanguageSelection(
          phone,
          "hi"
        );

        return;
      }


      await sendLanguageMenu(
        phone
      );

      return;
    }


    /* Waiting for name */

    if (
      session.state ===
      "WAIT_NAME"
    ) {

      const language =
        session.temp_data?.language ||
        "en";


      if (!isValidName(text)) {

        await sendText(
          phone,
          TEXTS[language].invalidName
        );

        return;
      }


      const cleanedName =
        text
          .trim()
          .replace(/\s+/g, " ");


      await completeRegistration(
        phone,
        cleanedName,
        language
      );

      return;
    }


    /* First contact */

    await startRegistration(
      phone
    );

    return;
  }


  /* =====================================================
     EXISTING PATIENT
  ===================================================== */

  const lang =
    patient.language || "en";


  /* =====================================================
     CHANGE LANGUAGE
  ===================================================== */

  if (
    session.state ===
    "WAIT_LANGUAGE_CHANGE"
  ) {

    if (id === "LANG_EN") {

      await handleLanguageSelection(
        phone,
        "en"
      );

      return;
    }


    if (id === "LANG_HI") {

      await handleLanguageSelection(
        phone,
        "hi"
      );

      return;
    }


    const lower =
      text.toLowerCase();


    if (
      lower === "english" ||
      lower === "en"
    ) {

      await handleLanguageSelection(
        phone,
        "en"
      );

      return;
    }


    if (
      lower === "hindi" ||
      lower === "hi" ||
      lower.includes("हिंदी")
    ) {

      await handleLanguageSelection(
        phone,
        "hi"
      );

      return;
    }


    await sendLanguageMenu(
      phone
    );

    return;
  }


  /* =====================================================
     DATE SELECTION
  ===================================================== */

  if (
    session.state ===
    "WAIT_DATE"
  ) {

    if (
      id &&
      id.startsWith("DATE_")
    ) {

      const date =
        id.replace(
          "DATE_",
          ""
        );

      await handleDateSelection(
        phone,
        date,
        lang
      );

      return;
    }


    await sendDateMenu(
      phone,
      lang
    );

    return;
  }


  /* =====================================================
     SLOT SELECTION
  ===================================================== */

 if (
  session.state ===
  "WAIT_SLOT"
) {

  if (
    id &&
    id.startsWith("SLOT_")
  ) {

    const parts =
      id.split("_");

    const encoded =
      parts
        .slice(2)
        .join("_");

    let slot = "";

    try {

      slot =
        Buffer.from(
          encoded,
          "base64"
        ).toString("utf8");

    } catch (error) {

      console.error(
        "❌ SLOT DECODE ERROR:",
        error
      );

      slot = "";
    }

    if (!slot) {
      console.error(
        "❌ SLOT VALUE EMPTY:",
        id
      );

      await sendText(
        phone,
        "Sorry, this slot could not be selected. Please choose a slot again."
      );

      await sendSlotMenu(
        phone,
        session.temp_data?.date,
        lang
      );

      return;
    }

    console.log(
      "✅ SELECTED SLOT:",
      slot
    );

    await handleSlotSelection(
      phone,
      slot,
      lang
    );

    return;
  }

  await sendSlotMenu(
    phone,
    session.temp_data?.date,
    lang
  );

  return;
}

  /* =====================================================
     APPOINTMENT CONFIRMATION
  ===================================================== */

  if (
    session.state ===
    "WAIT_CONFIRM"
  ) {

    if (
      id === "CONFIRM_YES"
    ) {

      await confirmAppointment(
        phone,
        lang
      );

      return;
    }


    if (
      id === "CONFIRM_NO"
    ) {

      await cancelAppointment(
        phone,
        lang
      );

      return;
    }


    const lower =
      text.toLowerCase();


    if (
      lower === "yes" ||
      lower === "ha" ||
      lower === "हाँ"
    ) {

      await confirmAppointment(
        phone,
        lang
      );

      return;
    }


    if (
      lower === "no" ||
      lower === "nahi" ||
      lower === "नहीं"
    ) {

      await cancelAppointment(
        phone,
        lang
      );

      return;
    }


    await sendButtons(
      phone,

      TEXTS[lang].confirmAppointment(
        formatDate(
          session.temp_data.date
        ),
        session.temp_data.slot
      ),

      [
        {
          id: "CONFIRM_YES",
          title: TEXTS[lang].confirmYes
        },
        {
          id: "CONFIRM_NO",
          title: TEXTS[lang].confirmNo
        }
      ]
    );

    return;
  }


  /* =====================================================
     MAIN MENU
  ===================================================== */

  if (
    session.state ===
    "MAIN_MENU"
  ) {

    if (id) {

      await handleMenuAction(
        phone,
        id
      );

      return;
    }


    const lower =
      text.toLowerCase();


    if (
      lower === "menu" ||
      lower === "main menu" ||
      lower === "मुख्य मेनू"
    ) {

      await sendMainMenu(
        phone,
        patient
      );

      return;
    }


    await sendMainMenu(
      phone,
      patient
    );

    return;
  }


  /* =====================================================
     FALLBACK
  ===================================================== */

  await setSession(
    phone,
    "MAIN_MENU",
    {}
  );

  await sendMainMenu(
    phone,
    patient
  );
}


/* =========================================================
   WHATSAPP WEBHOOK
========================================================= */

app.post(
  "/webhook",
  async (req, res) => {

    /*
     * Meta needs a quick 200 response.
     */

    res.sendStatus(200);


    try {

      const message =
        getIncomingMessage(
          req.body
        );


      if (!message) {
        return;
      }


      await processMessage(
        message
      );

    } catch (error) {

      console.error(
        "❌ Message processing error:",
        error.response?.data ||
        error.message ||
        error
      );
    }
  }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/health",
  async (req, res) => {

    try {

      await pool.query(
        "SELECT 1"
      );

      res.json({
        status: "healthy",
        database: "connected",
        service: CLINIC_NAME
      });

    } catch (error) {

      res.status(500).json({
        status: "error",
        database: "disconnected",
        message: error.message
      });
    }
  }
);


/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

  try {

    await initDB();

    app.listen(
      PORT,
      () => {

        console.log(
          `🏥 ${CLINIC_NAME} WhatsApp bot running on port ${PORT}`
        );

        console.log(
          `🌐 Webhook: http://localhost:${PORT}/webhook`
        );

        console.log(
          `❤️ Health: http://localhost:${PORT}/health`
        );
      }
    );

  } catch (error) {
console.error("❌ FAILED TO START SERVER");
console.error(error);
console.error(error?.stack);

    process.exit(1);
  }
}


startServer();


/* =========================================================
   END OF SMARTCLINIC AI SERVER
========================================================= */