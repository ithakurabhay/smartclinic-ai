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

/* =========================================================
   TEXT DICTIONARY
========================================================= */

const TEXTS = {

  /* =====================================================
     ENGLISH
  ===================================================== */

  en: {

    welcome:
      `Welcome to *${CLINIC_NAME}* 🏥\n\nPlease select your preferred language:`,

    langEnglish:
      "🇬🇧 English",

    langHindi:
      "🇮🇳 हिंदी",

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

    mainMenuButton:
      "📋 Open Menu",

    /* =================================================
       MAIN SERVICES
    ================================================= */

    book:
      "📅 Book Appointment",

    bookToken:
      "🎟️ Book Token",

    tokenStatus: (token, date, slot, position) =>
  `📊 *Token Status*\n\n🎟️ Token: *${token}*\n📅 Date: *${date}*\n🕐 Slot: *${slot}*\n👥 Your Position: *${position}*`,

    timing:
      "👨‍⚕️ Doctor Timings",

    emergency:
      "🚨 Emergency",

    language:
      "🌐 Change Language",

    details:
      "👤 My Details",

    mainMenu:
      "🏠 Main Menu",

    /* =================================================
       APPOINTMENT
    ================================================= */

    chooseDoctor:
      "👨‍⚕️ Please select a doctor:",

    chooseDate:
      "📅 Please choose a date for your appointment:",

    chooseDateButton:
      "Select Date",

    chooseSlot:
      "🕐 Choose an available time slot:",

    noSlots:
      "Sorry, no slots are available for this date.",

    confirmAppointment: (doctor, date, slot, charge) =>
      `Please confirm your appointment:\n\n` +
      `👨‍⚕️ Doctor: *${doctor}*\n` +
      `📅 Date: *${date}*\n` +
      `🕐 Slot: *${slot}*\n` +
      `💰 Appointment Fee: *₹${charge}*`,

    confirmYes:
      "✅ Confirm",

    confirmNo:
      "❌ Cancel",

    appointmentBooked: (token, doctor, date, slot, charge) =>
      `🎉 *Appointment booked successfully!*\n\n` +
      `👨‍⚕️ Doctor: *${doctor}*\n` +
      `🎟️ Token Number: *${token}*\n` +
      `📅 Date: *${date}*\n` +
      `🕐 Slot: *${slot}*\n` +
      `💰 Appointment Fee: *₹${charge}*\n\n` +
      `Please arrive a few minutes before your appointment. 🙏`,

    appointmentCancelled:
      "❌ Your appointment request was cancelled.\n\nYou can start again anytime from the Main Menu.",

    /* =================================================
       TOKEN
    ================================================= */

    chooseTokenDoctor:
      "👨‍⚕️ Please select a doctor for your token:",

    tokenBooked: (token, doctor, charge) =>
      `🎟️ *Token booked successfully!*\n\n` +
      `👨‍⚕️ Doctor: *${doctor}*\n` +
      `🎟️ Your Token: *${token}*\n` +
      `💰 Token Fee: *₹${charge}*\n\n` +
      `You can check your queue status anytime.`,

    tokenStatusTitle:
      "🎟️ *Token Status*",

    tokenStatusMessage: (
      token,
      activeToken,
      patientsAhead,
      waitMinutes,
      estimatedTime
    ) =>
      `🎟️ *Token Status*\n\n` +
      `🎫 Your Token: *${token}*\n` +
      `🔵 Active Token: *${activeToken}*\n` +
      `👥 Patients Ahead: *${patientsAhead}*\n` +
      `⏱️ Estimated Waiting Time: *${waitMinutes} minutes*\n` +
      `🕐 Estimated Turn: *${estimatedTime}*`,

    noActiveToken:
      "🎟️ You do not have any active token for today.",

    tokenCompleted:
      "✅ Your token has already been completed.",

    /* =================================================
       DOCTOR
    ================================================= */

    doctorTiming:
      `👨‍⚕️ *Doctor Timings*`,

    doctorNotAvailable:
      "Sorry, this doctor is currently unavailable.",

    /* =================================================
       EMERGENCY
    ================================================= */

    emergency:
      "🚨 *Emergency Assistance*\n\nIf this is a life-threatening medical emergency, please contact your nearest hospital/emergency service immediately.\n\nDo not wait for a WhatsApp response.",

    emergencyRecorded:
      "🚨 Your emergency request has been recorded.\n\nPlease contact the nearest emergency medical service immediately. Our staff will review your request as soon as possible.",

    emergencyBooking:
      "🚨 Do you want to make an Emergency Booking?",

    emergencyYes:
      "✅ YES",

    emergencyNo:
      "❌ NO",

    /* =================================================
       MY DETAILS
    ================================================= */

    myDetails: (name, phone, lang) =>
      `👤 *Your Details*\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Language: ${lang === "hi" ? "Hindi" : "English"}`,

    /* =================================================
       GENERAL
    ================================================= */

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


  /* =====================================================
     HINDI
  ===================================================== */

  hi: {

    welcome:
      `*${CLINIC_NAME}* में आपका स्वागत है 🏥\n\nकृपया अपनी पसंदीदा भाषा चुनें:`,

    langEnglish:
      "🇬🇧 English",

    langHindi:
      "🇮🇳 हिंदी",

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

    mainMenuHeader: (name) =>
      `नमस्ते *${name}* 👋\n\nआज हम आपकी कैसे मदद कर सकते हैं?`,

    mainMenuButton:
      "📋 मुख्य मेनू",

    /* =================================================
       MAIN SERVICES
    ================================================= */

    book:
      "📅 अपॉइंटमेंट बुक करें",

    bookToken:
      "🎟️ टोकन बुक करें",

   tokenStatus: (token, date, slot, position) =>
  `📊 *टोकन स्थिति*\n\n🎟️ टोकन: *${token}*\n📅 तारीख: *${date}*\n🕐 स्लॉट: *${slot}*\n👥 आपकी स्थिति: *${position}*`,

    timing:
      "👨‍⚕️ डॉक्टर का समय",

    emergency:
      "🚨 इमरजेंसी",

    language:
      "🌐 भाषा बदलें",

    details:
      "👤 मेरी जानकारी",

    mainMenu:
      "🏠 मुख्य मेनू",

    /* =================================================
       APPOINTMENT
    ================================================= */

    chooseDoctor:
      "👨‍⚕️ कृपया डॉक्टर चुनें:",

    chooseDate:
      "📅 कृपया अपॉइंटमेंट के लिए तारीख चुनें:",

    chooseDateButton:
      "तारीख चुनें",

    chooseSlot:
      "🕐 कृपया उपलब्ध समय चुनें:",

    noSlots:
      "क्षमा करें, इस तारीख के लिए कोई स्लॉट उपलब्ध नहीं है।",

    confirmAppointment: (doctor, date, slot, charge) =>
      `कृपया अपना अपॉइंटमेंट कन्फर्म करें:\n\n` +
      `👨‍⚕️ डॉक्टर: *${doctor}*\n` +
      `📅 तारीख: *${date}*\n` +
      `🕐 समय: *${slot}*\n` +
      `💰 अपॉइंटमेंट फीस: *₹${charge}*`,

    confirmYes:
      "✅ कन्फर्म",

    confirmNo:
      "❌ कैंसल",

    appointmentBooked: (token, doctor, date, slot, charge) =>
      `🎉 *अपॉइंटमेंट सफलतापूर्वक बुक हो गया!*\n\n` +
      `👨‍⚕️ डॉक्टर: *${doctor}*\n` +
      `🎟️ टोकन नंबर: *${token}*\n` +
      `📅 तारीख: *${date}*\n` +
      `🕐 समय: *${slot}*\n` +
      `💰 अपॉइंटमेंट फीस: *₹${charge}*\n\n` +
      `कृपया अपॉइंटमेंट से कुछ मिनट पहले पहुंचें। 🙏`,

    appointmentCancelled:
      "❌ आपका अपॉइंटमेंट कैंसल कर दिया गया है।\n\nआप मुख्य मेनू से दोबारा शुरू कर सकते हैं।",

    /* =================================================
       TOKEN
    ================================================= */

    chooseTokenDoctor:
      "👨‍⚕️ कृपया टोकन के लिए डॉक्टर चुनें:",

    tokenBooked: (token, doctor, charge) =>
      `🎟️ *टोकन सफलतापूर्वक बुक हो गया!*\n\n` +
      `👨‍⚕️ डॉक्टर: *${doctor}*\n` +
      `🎟️ आपका टोकन: *${token}*\n` +
      `💰 टोकन फीस: *₹${charge}*\n\n` +
      `आप कभी भी अपना टोकन स्टेटस देख सकते हैं।`,

    tokenStatusTitle:
      "🎟️ *टोकन स्टेटस*",

    tokenStatusMessage: (
      token,
      activeToken,
      patientsAhead,
      waitMinutes,
      estimatedTime
    ) =>
      `🎟️ *टोकन स्टेटस*\n\n` +
      `🎫 आपका टोकन: *${token}*\n` +
      `🔵 एक्टिव टोकन: *${activeToken}*\n` +
      `👥 आपसे आगे मरीज: *${patientsAhead}*\n` +
      `⏱️ अनुमानित प्रतीक्षा समय: *${waitMinutes} मिनट*\n` +
      `🕐 अनुमानित टर्न: *${estimatedTime}*`,

    noActiveToken:
      "🎟️ आज के लिए आपका कोई एक्टिव टोकन नहीं है।",

    tokenCompleted:
      "✅ आपका टोकन पूरा हो चुका है।",

    /* =================================================
       DOCTOR
    ================================================= */

    doctorTiming:
      `👨‍⚕️ *डॉक्टर का समय*`,

    doctorNotAvailable:
      "क्षमा करें, यह डॉक्टर अभी उपलब्ध नहीं है।",

    /* =================================================
       EMERGENCY
    ================================================= */

    emergency:
      "🚨 *इमरजेंसी सहायता*\n\nअगर यह जानलेवा मेडिकल इमरजेंसी है, तो तुरंत नजदीकी अस्पताल या इमरजेंसी सेवा से संपर्क करें।\n\nWhatsApp जवाब का इंतजार न करें।",

    emergencyRecorded:
      "🚨 आपकी इमरजेंसी रिक्वेस्ट रिकॉर्ड कर ली गई है।\n\nकृपया तुरंत नजदीकी इमरजेंसी मेडिकल सेवा से संपर्क करें। हमारी टीम आपकी रिक्वेस्ट जल्द से जल्द देखेगी।",

    emergencyBooking:
      "🚨 क्या आप Emergency Booking करना चाहते हैं?",

    emergencyYes:
      "✅ हाँ",

    emergencyNo:
      "❌ नहीं",

    /* =================================================
       MY DETAILS
    ================================================= */

    myDetails: (name, phone, lang) =>
      `👤 *आपकी जानकारी*\n\n` +
      `नाम: ${name}\n` +
      `फोन: ${phone}\n` +
      `भाषा: ${lang === "hi" ? "हिंदी" : "English"}`,

    /* =================================================
       GENERAL
    ================================================= */

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


/* =======================================================

   DATABASE INITIALIZATION
   SMARTCLINIC AI — MULTI-HOSPITAL FOUNDATION
========================================================= */

async function initDB() {

  /* =====================================================
     1. PATIENTS
     Existing patient data preserved
  ===================================================== */

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


  /* =====================================================
     2. SESSIONS
     Existing WhatsApp sessions preserved
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      phone VARCHAR(30) PRIMARY KEY,

      state VARCHAR(50) DEFAULT 'START',

      temp_data JSONB DEFAULT '{}'::jsonb,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     3. HOSPITALS
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id SERIAL PRIMARY KEY,

      hospital_name VARCHAR(200) NOT NULL,

      hospital_code VARCHAR(100) UNIQUE NOT NULL,

      phone VARCHAR(30),

      email VARCHAR(150),

      address TEXT,

      city VARCHAR(100),

      state VARCHAR(100),

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     4. HOSPITAL SERVICES
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hospital_services (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER UNIQUE NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      appointment_enabled BOOLEAN DEFAULT TRUE,

      token_enabled BOOLEAN DEFAULT TRUE,

      emergency_enabled BOOLEAN DEFAULT TRUE,

      cash_payment_enabled BOOLEAN DEFAULT TRUE,

      online_payment_enabled BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     5. HOSPITAL ADMINS
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hospital_admins (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      name VARCHAR(150) NOT NULL,

      email VARCHAR(150) UNIQUE NOT NULL,

      password_hash TEXT NOT NULL,

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     6. SUPER ADMINS
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS super_admins (
      id SERIAL PRIMARY KEY,

      name VARCHAR(150) NOT NULL,

      email VARCHAR(150) UNIQUE NOT NULL,

      password_hash TEXT NOT NULL,

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     7. DOCTORS
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_name VARCHAR(200) NOT NULL,

      specialization VARCHAR(150),

      appointment_charge NUMERIC(10,2) DEFAULT 0,

      token_charge NUMERIC(10,2) DEFAULT 0,

      emergency_charge NUMERIC(10,2) DEFAULT 0,

      appointment_enabled BOOLEAN DEFAULT TRUE,

      token_enabled BOOLEAN DEFAULT TRUE,

      emergency_enabled BOOLEAN DEFAULT TRUE,

      average_consultation_minutes INTEGER DEFAULT 5,

      is_on_duty BOOLEAN DEFAULT FALSE,

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT doctors_consultation_time_check
        CHECK (average_consultation_minutes > 0)
    );
  `);


  /* =====================================================
     8. EXISTING DOCTORS — SAFE MIGRATION
  ===================================================== */

  await pool.query(`
    ALTER TABLE doctors
      ADD COLUMN IF NOT EXISTS is_on_duty BOOLEAN DEFAULT FALSE;

    ALTER TABLE doctors
      ADD COLUMN IF NOT EXISTS average_consultation_minutes INTEGER DEFAULT 5;
  `);


  /* =====================================================
     9. DOCTOR PAYMENT SETTINGS
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctor_payment_settings (
      id SERIAL PRIMARY KEY,

      doctor_id INTEGER UNIQUE NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      appointment_cash_enabled BOOLEAN DEFAULT TRUE,

      appointment_online_enabled BOOLEAN DEFAULT TRUE,

      token_cash_enabled BOOLEAN DEFAULT TRUE,

      token_online_enabled BOOLEAN DEFAULT TRUE,

      emergency_cash_enabled BOOLEAN DEFAULT TRUE,

      emergency_online_enabled BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     10. DOCTOR WEEKLY SCHEDULE
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctor_schedules (
      id SERIAL PRIMARY KEY,

      doctor_id INTEGER NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      day_of_week INTEGER NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

      is_working BOOLEAN DEFAULT TRUE,

      start_time TIME,

      end_time TIME,

      break_start_time TIME,

      break_end_time TIME,

      online_token_start_time TIME,

      online_token_end_time TIME,

      appointment_enabled BOOLEAN DEFAULT TRUE,

      token_enabled BOOLEAN DEFAULT TRUE,

      emergency_enabled BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(doctor_id, day_of_week)
    );
  `);


  /* =====================================================
     11. EXISTING APPOINTMENTS — PRESERVE
  ===================================================== */

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


  /* =====================================================
     12. APPOINTMENT MIGRATION COLUMNS
  ===================================================== */

  await pool.query(`
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS hospital_id INTEGER,
      ADD COLUMN IF NOT EXISTS doctor_id INTEGER,
      ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'PENDING';
  `);


  /* =====================================================
     13. MASTER TOKEN QUEUE
     
     ONLINE + OFFLINE USE THE SAME QUEUE
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS token_queue (
      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_id INTEGER NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE SET NULL,

      patient_phone VARCHAR(30),

      patient_name VARCHAR(150),

      token_date DATE NOT NULL,

      token_number INTEGER NOT NULL,

      source VARCHAR(20) NOT NULL,

      status VARCHAR(30) DEFAULT 'WAITING',

      payment_mode VARCHAR(20),

      payment_status VARCHAR(30) DEFAULT 'PENDING',

      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      called_at TIMESTAMP,

      completed_at TIMESTAMP,

      cancelled_at TIMESTAMP,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT token_queue_source_check
        CHECK (source IN ('ONLINE', 'OFFLINE')),

      CONSTRAINT token_queue_status_check
        CHECK (
          status IN (
            'WAITING',
            'CALLED',
            'COMPLETED',
            'CANCELLED'
          )
        ),

      CONSTRAINT token_queue_unique_number
        UNIQUE(
          hospital_id,
          doctor_id,
          token_date,
          token_number
        )
    );
  `);


  /* =====================================================
     14. TOKEN QUEUE INDEXES
  ===================================================== */

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_token_queue_doctor_date
    ON token_queue (
      hospital_id,
      doctor_id,
      token_date
    );
  `);


  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_token_queue_patient
    ON token_queue (
      patient_phone,
      token_date
    );
  `);


  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_token_queue_status
    ON token_queue (
      hospital_id,
      doctor_id,
      token_date,
      status
    );
  `);


  /* =====================================================
     15. EXISTING TOKENS TABLE
     
     DO NOT DELETE.
     Existing system data remains safe.
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_id INTEGER NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      phone VARCHAR(30) NOT NULL,

      patient_name VARCHAR(150) NOT NULL,

      token_number INTEGER NOT NULL,

      token_date DATE NOT NULL,

      status VARCHAR(30) DEFAULT 'WAITING',

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(
        hospital_id,
        doctor_id,
        token_date,
        token_number
      )
    );
  `);


  /* =====================================================
     16. EXISTING PAYMENTS TABLE
     
     DO NOT DELETE.
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE SET NULL,

      phone VARCHAR(30) NOT NULL,

      service_type VARCHAR(30) NOT NULL,

      amount NUMERIC(10,2) NOT NULL DEFAULT 0,

      payment_method VARCHAR(30) NOT NULL,

      payment_status VARCHAR(30) DEFAULT 'PENDING',

      transaction_id VARCHAR(200),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     17. EMERGENCY REQUESTS
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS emergency_requests (
      id SERIAL PRIMARY KEY,

      phone VARCHAR(30) NOT NULL,

      patient_name VARCHAR(150),

      message TEXT,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     18. EMERGENCY MIGRATION COLUMNS
  ===================================================== */

  await pool.query(`
    ALTER TABLE emergency_requests
      ADD COLUMN IF NOT EXISTS hospital_id INTEGER,
      ADD COLUMN IF NOT EXISTS doctor_id INTEGER,
      ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'OPEN';
  `);


  /* =====================================================
     19. WHATSAPP CONNECTIONS
     
     One WhatsApp connection per hospital.
  ===================================================== */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_connections (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER UNIQUE NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      waba_id VARCHAR(150),

      phone_number_id VARCHAR(150) UNIQUE,

      business_phone_number VARCHAR(30),

      display_name VARCHAR(200),

      profile_photo_url TEXT,

      about TEXT,

      access_token_encrypted TEXT,

      verify_token_encrypted TEXT,

      graph_version VARCHAR(30) DEFAULT 'v23.0',

      is_connected BOOLEAN DEFAULT FALSE,

      is_active BOOLEAN DEFAULT TRUE,

      last_verified_at TIMESTAMP,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  /* =====================================================
     20. ANALYTICS INDEXES
  ===================================================== */

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_appointments_hospital_date
    ON appointments (
      hospital_id,
      appointment_date
    );
  `);


  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_emergency_hospital_created
    ON emergency_requests (
      hospital_id,
      created_at
    );
  `);


  /* =====================================================
     21. SAFE DEFAULTS
  ===================================================== */

  await pool.query(`
    UPDATE doctors
    SET average_consultation_minutes = 5
    WHERE average_consultation_minutes IS NULL
       OR average_consultation_minutes <= 0;
  `);


  await pool.query(`
    UPDATE doctors
    SET is_on_duty = FALSE
    WHERE is_on_duty IS NULL;
  `);


  /* =====================================================
     DATABASE READY
  ===================================================== */

  console.log("==============================================");
  console.log("✅ SmartClinic database initialized");
  console.log("🏥 Hospitals: READY");
  console.log("👑 Super Admin: READY");
  console.log("👤 Hospital Admin: READY");
  console.log("👨‍⚕️ Doctors: READY");
  console.log("📅 Doctor schedules: READY");
  console.log("💰 Doctor charges: READY");
  console.log("💳 Payment settings: READY");
  console.log("🎟️ Master online/offline queue: READY");
  console.log("🚨 Emergency system: READY");
  console.log("📱 WhatsApp connections: READY");
  console.log("📊 Analytics foundation: READY");
  console.log("==============================================");
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
      const response = await axios.post(
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
    console.log(
  "✅ WhatsApp API Response:",
  response.data
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

  console.log("🚨 SENDLIST RECEIVED:", JSON.stringify({
  to,
  body,
  buttonText,
  sections
}, null, 2));

 const sourceRows = sections?.[0]?.rows || [];

const rows = sourceRows
  .slice(0, 10)
  .map((row, index) => {

    const id = String(
      row?.id || ""
    ).trim();

    const title = String(
      row?.title || `Option ${index + 1}`
    ).trim();

    return {
      id: id.slice(0, 200),
      title: title.slice(0, 24),

      ...(row?.description
        ? {
            description: String(
              row.description
            ).slice(0, 72)
          }
        : {})
    };

  })
  .filter(row => row.id && row.title);
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
             title: t.token || "🎟️ Token / Queue Status"
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

  await sendText(
    phone,
    lang === "hi"
      ? "🚨 क्या आप Emergency Booking करना चाहते हैं?"
      : "🚨 Do you want to make an Emergency Booking?"
  );
console.log("🚨 EMERGENCY SENDLIST DATA:", JSON.stringify([
  {
    title: "SmartClinic",
    rows: [
      {
        id: "EMERGENCY_YES",
        title: lang === "hi" ? "हाँ" : "YES"
      },
      {
        id: "EMERGENCY_NO",
        title: lang === "hi" ? "नहीं" : "NO"
      }
    ]
  }
], null, 2));

  await sendList(
    phone,
    lang === "hi" ? "विकल्प चुनें" : "Choose an option",
    lang === "hi" ? "चुनें" : "Select",
    [
      {
        title: "SmartClinic",
        rows: [
          {
            id: "EMERGENCY_YES",
            title: lang === "hi" ? "हाँ" : "YES"
          },
          {
            id: "EMERGENCY_NO",
            title: lang === "hi" ? "नहीं" : "NO"
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

  /* =========================
     CHECK SLOT
  ========================= */

  const availableSlots =
    await getAvailableSlots(date);

  if (
    !availableSlots ||
    !availableSlots.includes(slot)
  ) {

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

  /* =========================
     GENERATE TOKEN
  ========================= */

  const token =
    await generateToken(
      date,
      slot
    );

  /* =========================
     SAVE APPOINTMENT
  ========================= */

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

  /* =========================
     CLEAR / RESET SESSION
  ========================= */

  await setSession(
    phone,
    "MAIN_MENU",
    {}
  );

  /* =========================
     BOOKING CONFIRMATION
  ========================= */

  const t =
    TEXTS[lang];

  const confirmationMessage =
    t.appointmentBooked(
      token,
      formatDate(date),
      slot
    );

  await sendText(
    phone,
    confirmationMessage
  );

  /* =========================
     MAIN MENU
  ========================= */

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
            ? " कृपया मरीज का *पूरा नाम* भेजें।"
            : " Please send the patient's *full name*."
    );

    break;


case "EMERGENCY_NO":

    await setSession(
      phone,
      "MAIN_MENU",
      {}
    );

    await sendMainMenu(
      phone,
      patient
    );

    break;


    case "TOKEN_STATUS":

      await handleTokenStatus(
        phone,
        lang
      );

      break;
      case "CONFIRM_YES":

  await confirmAppointment(
    phone,
    lang
  );

  break;

      case "CONFIRM_NO":

  await cancelAppointment(
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
async function processMessage(message) {

  const phone = message.from;

  const id = message.id;

  const text = message.text || "";

  console.log(
    `📩 Message received from ${phone}:`,
    id || text
  );

  let patient =
    await getPatient(phone);

  let session =
    await getSession(phone);
  /* ================================
   EMERGENCY PATIENT NAME
================================ */

if (session.state === "EMERGENCY_NAME") {

  const patientName = text.trim();

  if (!/^[A-Za-z\s]+$/.test(patientName)) {

    await sendText(
      phone,
      session?.temp_data?.language === "hi"
        ? "⚠️ कृपया मरीज का सही पूरा नाम भेजें।"
        : "⚠️ Please enter the patient's full name."
    );

    return;
  }

  await setSession(
    phone,
    "EMERGENCY_PHONE",
    {
      ...session.temp_data,
      patient_name: patientName
    }
  );

  await sendText(
    phone,
    session?.temp_data?.language === "hi"
      ? "📱 कृपया मरीज का *10-digit phone number* भेजें।"
      : "📱 Please send the patient's *10-digit phone number*."
  );

  return;
}  
// ============================================
// EMERGENCY PATIENT PHONE
// ============================================

if (session.state === "EMERGENCY_PHONE") {
  const patientPhone = text.replace(/\D/g, "");

  if (!/^\d{10}$/.test(patientPhone)) {
    await sendText(
      phone,
      session?.temp_data?.language === "hi"
        ? "⚠️ कृपया मरीज का सही *10 अंकों का मोबाइल नंबर* भेजें।"
        : "⚠️ Please send a valid *10-digit phone number*."
    );

    return;
  }

  await setSession(
    phone,
    "EMERGENCY_DETAILS",
    {
      ...session.temp_data,
      patient_phone: patientPhone
    }
  );

  await sendText(
    phone,
    session?.temp_data?.language === "hi"
      ? "🚨 कृपया Emergency की जानकारी भेजें।\n\nयह जानकारी *वैकल्पिक* है।\n\nअगर जानकारी नहीं देना चाहते हैं तो *skip* लिखें।"
      : "🚨 Please provide the emergency details.\n\nThis information is *optional*.\n\nIf you don't want to provide details, type *skip*."
  );

  return;
}
// ============================================
// EMERGENCY DETAILS + FINAL CONFIRMATION
// ============================================

if (session.state === "EMERGENCY_DETAILS") {
  const emergencyDetails =
    text.trim().toLowerCase() === "skip"
      ? ""
      : text.trim();

  const patientName = session?.temp_data?.patient_name || "";
  const patientPhone = session?.temp_data?.patient_phone || "";

  await sendText(
    phone,
    session?.temp_data?.language === "hi"
      ? `✅ *आपकी Emergency Booking सफलतापूर्वक पूरी हो गई है।*\n\n👤 मरीज का नाम: ${patientName}\n📞 मोबाइल नंबर: ${patientPhone}\n🚨 Emergency Details: ${emergencyDetails || "प्रदान नहीं की गई"}\n\n🏥 आपका Emergency अनुरोध दर्ज हो गया है।`
      : `✅ *Your Emergency Booking has been completed successfully.*\n\n👤 Patient Name: ${patientName}\n📞 Phone Number: ${patientPhone}\n🚨 Emergency Details: ${emergencyDetails || "Not provided"}\n\n🏥 Your emergency request has been recorded.`
  );

  await setSession(phone, "MAIN_MENU", {});

  return;
}
  // ===============================
  // GLOBAL MAIN MENU COMMAND
  // ===============================

  const userText =
    String(text || "").trim().toLowerCase();

  if (
    userText === "hi" ||
    userText === "hii" ||
    userText === "hello" ||
    userText === "hey" ||
    userText === "main menu" ||
    userText === "menu"
  ) {
    await setSession(
      phone,
      "MAIN_MENU",
      {}
    );

    await sendMainMenu(
      phone,
      patient
    );

    return;
  }

  // YAHAN SE BAaki processing
  // DATE SELECTION
  // SLOT SELECTION
  // etc.
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

