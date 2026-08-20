/* =========================================================
   🏥 SMARTCLINIC AI
   MULTI-HOSPITAL HEALTHCARE PLATFORM
   =========================================================
   PART 1 — CORE SERVER + CONFIGURATION
   =========================================================

   ARCHITECTURE

   👑 SUPER ADMIN
          ↓
   🏥 HOSPITAL
          ↓
   🏥 HOSPITAL ADMIN
          ↓
   👨‍⚕️ DOCTORS
          ↓
   👤 PATIENTS

   SERVICES

   🎟️ TOKEN
   📅 APPOINTMENT
   🚨 EMERGENCY
   💊 CARE
   💳 PAYMENT
   🔔 NOTIFICATION
   📢 ANNOUNCEMENT
   📊 REPORTS
   📜 LOGS

   IMPORTANT RULE

   Every major record belongs to a hospital.

   hospital
      ↓
   admins
   doctors
   patients
   tokens
   appointments
   emergencies
   services
   payments
   care
   reminders
   announcements
   logs

========================================================= */


/* =========================================================
   CORE MODULES
========================================================= */

const express =
  require("express");

const axios =
  require("axios");

const { Pool } =
  require("pg");


/* =========================================================
   EXPRESS APP
========================================================= */

const app =
  express();

app.use(
  express.json({
    limit: "2mb"
  })
);


/* =========================================================
   BASIC CONFIGURATION
   ---------------------------------------------------------
   NO .env REQUIRED
========================================================= */

const PORT =
  Number(
    process.env.PORT ||
    3000
  );


/* =========================================================
   SMARTCLINIC PLATFORM CONFIG
========================================================= */

const PLATFORM_NAME =
  "SmartClinic AI";

const PLATFORM_VERSION =
  "2.0.0";

const DEFAULT_LANGUAGE =
  "en";


/* =========================================================
   WHATSAPP CONFIGURATION
   ---------------------------------------------------------
   Values can be changed directly here.
========================================================= */

const PHONE_NUMBER_ID =
  process.env.PHONE_NUMBER_ID ||
  "";

const WHATSAPP_TOKEN =
  process.env.WHATSAPP_TOKEN ||
  "";

const VERIFY_TOKEN =
  process.env.VERIFY_TOKEN ||
  "smartclinic_verify_2026";

const GRAPH_VERSION =
  process.env.GRAPH_VERSION ||
  "v23.0";


const WHATSAPP_URL =
  `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;


/* =========================================================
   DEFAULT HOSPITAL CONFIGURATION
========================================================= */

const DEFAULT_HOSPITAL_CONFIG = {

  token_enabled:
    true,

  appointment_enabled:
    true,

  emergency_enabled:
    true,

  payment_enabled:
    true,

  care_enabled:
    true,

  whatsapp_enabled:
    true,

  reminder_enabled:
    true,

  announcement_enabled:
    true

};


/* =========================================================
   DEFAULT WORKING HOURS
========================================================= */

const DEFAULT_WORKING_HOURS = {

  monday: {
    enabled: true,
    start: "10:00",
    end: "18:00"
  },

  tuesday: {
    enabled: true,
    start: "10:00",
    end: "18:00"
  },

  wednesday: {
    enabled: true,
    start: "10:00",
    end: "18:00"
  },

  thursday: {
    enabled: true,
    start: "10:00",
    end: "18:00"
  },

  friday: {
    enabled: true,
    start: "10:00",
    end: "18:00"
  },

  saturday: {
    enabled: true,
    start: "10:00",
    end: "18:00"
  },

  sunday: {
    enabled: false,
    start: null,
    end: null
  }

};


/* =========================================================
   POSTGRESQL
========================================================= */

const pool =
  new Pool({

    host:
      process.env.PGHOST ||
      "localhost",

    port:
      Number(
        process.env.PGPORT ||
        5432
      ),

    user:
      process.env.PGUSER ||
      "postgres",

    password:
      process.env.PGPASSWORD ||
      "",

    database:
      process.env.PGDATABASE ||
      "smartclinic",

    max: 20,

    idleTimeoutMillis:
      30000,

    connectionTimeoutMillis:
      10000

  });


/* =========================================================
   DATABASE CONNECTION ERROR
========================================================= */

pool.on(
  "error",
  (error) => {

    console.error(
      "❌ PostgreSQL pool error:",
      error
    );

  }
);


/* =========================================================
   UTILITY — SAFE STRING
========================================================= */

function safeString(
  value,
  fallback = ""
) {

  if (
    value === null ||
    value === undefined
  ) {

    return fallback;

  }

  return String(value)
    .trim();

}


/* =========================================================
   UTILITY — SAFE INTEGER
========================================================= */

function safeInteger(
  value,
  fallback = null
) {

  const number =
    Number(value);

  if (
    !Number.isInteger(number)
  ) {

    return fallback;

  }

  return number;

}


/* =========================================================
   UTILITY — NORMALIZE PHONE
========================================================= */

function normalizePhone(
  phone
) {

  return safeString(phone)
    .replace(/\D/g, "");

}


/* =========================================================
   UTILITY — VALID PHONE
========================================================= */

function isValidPhone(
  phone
) {

  const normalized =
    normalizePhone(phone);

  return /^\d{10,15}$/
    .test(normalized);

}


/* =========================================================
   UTILITY — NORMALIZE LANGUAGE
========================================================= */

function normalizeLanguage(
  language
) {

  const value =
    safeString(
      language,
      DEFAULT_LANGUAGE
    ).toLowerCase();

  if (
    value === "hi" ||
    value === "hindi" ||
    value.includes("हिंदी")
  ) {

    return "hi";

  }

  return "en";

}


/* =========================================================
   UTILITY — VALID NAME
========================================================= */

function isValidName(
  name
) {

  const value =
    safeString(name);

  return (
    value.length >= 2 &&
    /^[A-Za-zÀ-ÿ\s.'-]+$/
      .test(value)
  );

}


/* =========================================================
   UTILITY — DATE
========================================================= */

function getTodayDate() {

  return new Date()
    .toISOString()
    .split("T")[0];

}


/* =========================================================
   UTILITY — FORMAT DATE
========================================================= */

function formatDate(
  date
) {

  if (!date) {

    return "";

  }

  const value =
    new Date(date);

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {

    return String(date);

  }

  return value
    .toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

}


/* =========================================================
   UTILITY — JSON
========================================================= */

function safeJson(
  value,
  fallback = {}
) {

  try {

    if (
      value === null ||
      value === undefined
    ) {

      return fallback;

    }

    if (
      typeof value === "object"
    ) {

      return value;

    }

    return JSON.parse(value);

  } catch {

    return fallback;

  }

}


/* =========================================================
   PLATFORM TEXTS
========================================================= */

const TEXTS = {

  en: {

    welcome:
      `Welcome to *${PLATFORM_NAME}* 🏥\n\nPlease select your preferred language:`,

    langEnglish:
      "🇬🇧 English",

    langHindi:
      "🇮🇳 हिंदी",

    askName:
      "Great! Please send your *full name*.",

    invalidName:
      "⚠️ Please enter a valid full name.",

    registrationDone:
      (name) =>
        `Thank you, *${name}*!\n\nYour registration is complete ✅`,

    mainMenuHeader:
      (name) =>
        `Hi *${name}* 👋\n\nHow can we help you today?`,

    mainMenuButton:
      "📋 Open Menu",

    bookToken:
      "🎟️ Book Token",

    bookAppointment:
      "📅 Book Appointment",

    emergency:
      "🚨 Emergency",

    clinicStatus:
      "🏥 Clinic Status",

    myStatus:
      "👤 My Status",

    myProfile:
      "👤 My Profile",

    myCare:
      "💊 My Care",

    payments:
      "💳 Payments",

    changeLanguage:
      "🌐 Change Language",

    help:
      "ℹ️ Help & Support",

    invalidInput:
      "⚠️ Sorry, I didn't understand that.\n\nPlease choose one of the available options.",

    confirmYes:
      "✅ Confirm",

    confirmNo:
      "❌ Cancel",

    appointmentCancelled:
      "❌ Appointment cancelled.",

    noSlots:
      "Sorry, no slots are available for this date.",

    noToken:
      "🎟️ You do not have an active token.",

    emergencyRecorded:
      "🚨 Your emergency request has been recorded."

  },


  hi: {

    welcome:
      `*${PLATFORM_NAME}* में आपका स्वागत है 🏥\n\nकृपया अपनी पसंदीदा भाषा चुनें:`,

    langEnglish:
      "🇬🇧 English",

    langHindi:
      "🇮🇳 हिंदी",

    askName:
      "बहुत बढ़िया! कृपया अपना *पूरा नाम* भेजें।",

    invalidName:
      "⚠️ कृपया सही पूरा नाम दर्ज करें।",

    registrationDone:
      (name) =>
        `धन्यवाद, *${name}*!\n\nआपका रजिस्ट्रेशन पूरा हो गया है ✅`,

    mainMenuHeader:
      (name) =>
        `नमस्ते *${name}* 👋\n\nआज हम आपकी कैसे मदद कर सकते हैं?`,

    mainMenuButton:
      "📋 मुख्य मेनू",

    bookToken:
      "🎟️ टोकन बुक करें",

    bookAppointment:
      "📅 अपॉइंटमेंट बुक करें",

    emergency:
      "🚨 इमरजेंसी",

    clinicStatus:
      "🏥 क्लिनिक स्थिति",

    myStatus:
      "👤 मेरी स्थिति",

    myProfile:
      "👤 मेरी प्रोफाइल",

    myCare:
      "💊 मेरी देखभाल",

    payments:
      "💳 भुगतान",

    changeLanguage:
      "🌐 भाषा बदलें",

    help:
      "ℹ️ सहायता",

    invalidInput:
      "⚠️ माफ कीजिए, मैं इसे समझ नहीं पाया।\n\nकृपया उपलब्ध विकल्पों में से चुनें।",

    confirmYes:
      "✅ कन्फर्म",

    confirmNo:
      "❌ कैंसल",

    appointmentCancelled:
      "❌ अपॉइंटमेंट कैंसल कर दिया गया है।",

    noSlots:
      "क्षमा करें, इस तारीख के लिए कोई स्लॉट उपलब्ध नहीं है।",

    noToken:
      "🎟️ आपका कोई एक्टिव टोकन नहीं है।",

    emergencyRecorded:
      "🚨 आपकी इमरजेंसी रिक्वेस्ट रिकॉर्ड कर ली गई है।"

  }

};


/* =========================================================
   ROLE DEFINITIONS
========================================================= */

const USER_ROLES = {

  SUPER_ADMIN:
    "SUPER_ADMIN",

  HOSPITAL_ADMIN:
    "HOSPITAL_ADMIN",

  DOCTOR:
    "DOCTOR",

  PATIENT:
    "PATIENT"

};


/* =========================================================
   PERMISSION DEFINITIONS
========================================================= */

const PERMISSIONS = [

  "DOCTORS",

  "PATIENTS",

  "TOKENS",

  "APPOINTMENTS",

  "EMERGENCY",

  "PAYMENTS",

  "CARE",

  "ANNOUNCEMENTS",

  "NOTIFICATIONS",

  "REPORTS",

  "SETTINGS"

];


/* =========================================================
   TOKEN STATUS
========================================================= */

const TOKEN_STATUS = {

  WAITING:
    "WAITING",

  CALLED:
    "CALLED",

  HOLD:
    "HOLD",

  SKIPPED:
    "SKIPPED",

  COMPLETED:
    "COMPLETED",

  CANCELLED:
    "CANCELLED"

};


/* =========================================================
   APPOINTMENT STATUS
========================================================= */

const APPOINTMENT_STATUS = {

  BOOKED:
    "BOOKED",

  CONFIRMED:
    "CONFIRMED",

  COMPLETED:
    "COMPLETED",

  CANCELLED:
    "CANCELLED",

  RESCHEDULED:
    "RESCHEDULED",

  NO_SHOW:
    "NO_SHOW"

};


/* =========================================================
   EMERGENCY STATUS
========================================================= */

const EMERGENCY_STATUS = {

  PENDING:
    "PENDING",

  ACCEPTED:
    "ACCEPTED",

  IN_PROGRESS:
    "IN_PROGRESS",

  RESOLVED:
    "RESOLVED",

  REJECTED:
    "REJECTED",

  CANCELLED:
    "CANCELLED"

};


/* =========================================================
   PAYMENT STATUS
========================================================= */

const PAYMENT_STATUS = {

  PENDING:
    "PENDING",

  PAID:
    "PAID",

  PARTIAL:
    "PARTIAL",

  FAILED:
    "FAILED",

  REFUNDED:
    "REFUNDED",

  CANCELLED:
    "CANCELLED"

};


/* =========================================================
   SYSTEM LOGGER
========================================================= */

async function createSystemLog({

  hospitalId = null,

  actorType = "SYSTEM",

  actorId = null,

  action = "UNKNOWN",

  entityType = null,

  entityId = null,

  details = {}

} = {}) {

  try {

    await pool.query(
      `
      INSERT INTO system_logs
      (
        hospital_id,
        actor_type,
        actor_id,
        action,
        entity_type,
        entity_id,
        details
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      `,
      [

        hospitalId,

        actorType,

        actorId,

        action,

        entityType,

        entityId,

        JSON.stringify(details)

      ]
    );

  } catch (error) {

    console.error(
      "❌ SYSTEM LOG ERROR:",
      error.message
    );

  }

}


/* =========================================================
   DATABASE QUERY HELPER
========================================================= */

async function dbQuery(
  text,
  params = []
) {

  const result =
    await pool.query(
      text,
      params
    );

  return result;

}


/* =========================================================
   DATABASE TRANSACTION HELPER
========================================================= */

async function withTransaction(
  callback
) {

  const client =
    await pool.connect();

  try {

    await client.query(
      "BEGIN"
    );

    const result =
      await callback(client);

    await client.query(
      "COMMIT"
    );

    return result;

  } catch (error) {

    await client.query(
      "ROLLBACK"
    );

    throw error;

  } finally {

    client.release();

  }

}


/* =========================================================
   DATABASE HEALTH
========================================================= */

async function checkDatabase() {

  try {

    await pool.query(
      "SELECT 1"
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Database unavailable:",
      error.message
    );

    return false;

  }

}


/* =========================================================
   STARTUP BANNER
========================================================= */

console.log(`
=========================================================
🏥 SMARTCLINIC AI
=========================================================
Platform : ${PLATFORM_NAME}
Version  : ${PLATFORM_VERSION}
Port     : ${PORT}

Roles:
👑 SUPER ADMIN
🏥 HOSPITAL ADMIN
👨‍⚕️ DOCTOR
👤 PATIENT

Modules:
🏥 Hospitals
👨‍⚕️ Doctors
👤 Patients
🎟️ Tokens
📅 Appointments
🚨 Emergency
💊 Care
💳 Payments
🔔 Notifications
📢 Announcements
📊 Reports
📜 Logs

=========================================================
`);


/* =========================================================
   PART 1 END
   ---------------------------------------------------------
   PART 2 WILL CONTINUE WITH:

   🏥 MULTI-HOSPITAL DATABASE
   👑 SUPER ADMIN FOUNDATION
   🏥 HOSPITAL ADMIN FOUNDATION
   👨‍⚕️ DOCTOR FOUNDATION
   👤 PATIENT FOUNDATION
   🎟️ TOKEN TABLE
   📅 APPOINTMENT TABLE
   🚨 EMERGENCY TABLE
   💳 PAYMENT TABLE
   💊 CARE TABLE
   🔔 NOTIFICATION TABLE
   📢 ANNOUNCEMENT TABLE
   📜 SYSTEM LOG TABLE

========================================================= */
/* =========================================================
   PART 2 — MULTI-HOSPITAL DATABASE FOUNDATION
   SMARTCLINIC AI
========================================================= */

/*
   IMPORTANT ARCHITECTURE

   SUPER ADMIN
        |
        +---- Hospital 1
        |       |
        |       +---- Admin
        |       +---- Doctors
        |       +---- Patients
        |       +---- Tokens
        |       +---- Appointments
        |       +---- Emergencies
        |       +---- Services
        |       +---- Payments
        |       +---- Care
        |       +---- Announcements
        |       +---- Notifications
        |       +---- Logs
        |
        +---- Hospital 2
                |
                +---- Same structure

   IMPORTANT RULE:

   Every hospital-owned record MUST contain hospital_id.

   This prevents:

   Hospital A
      ❌ seeing Hospital B patients
      ❌ using Hospital B doctors
      ❌ entering Hospital B token queue
      ❌ accessing Hospital B appointments
      ❌ accessing Hospital B emergencies
========================================================= */


/* =========================================================
   DATABASE HELPER
========================================================= */

async function safeQuery(
  text,
  params = []
) {

  try {

    return await pool.query(
      text,
      params
    );

  } catch (error) {

    console.error(
      "❌ DATABASE QUERY ERROR:",
      error.message
    );

    throw error;
  }
}


/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function initSmartClinicSchema() {

  console.log(
    "🏥 Initializing SmartClinic AI database..."
  );


  /* =======================================================
     EXTENSIONS
  ======================================================= */

  await safeQuery(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);


  /* =======================================================
     HOSPITALS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS hospitals (

      id SERIAL PRIMARY KEY,

      hospital_id VARCHAR(100)
        UNIQUE NOT NULL,

      name VARCHAR(255)
        NOT NULL,

      address TEXT,

      phone VARCHAR(30),

      email VARCHAR(255),

      logo TEXT,

      working_hours JSONB
        DEFAULT '{}'::jsonb,

      status VARCHAR(30)
        NOT NULL DEFAULT 'ACTIVE'
        CHECK (
          status IN (
            'ACTIVE',
            'INACTIVE'
          )
        ),

      token_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      appointment_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      emergency_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      payment_enabled BOOLEAN
        NOT NULL DEFAULT FALSE,

      care_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      whatsapp_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     HOSPITAL CONFIGURATION
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS hospital_settings (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL UNIQUE
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      token_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      appointment_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      emergency_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      payment_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      notification_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      whatsapp_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      security_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);

/* =======================================================
     USERS / ADMIN ACCOUNTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS users (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      name VARCHAR(255)
        NOT NULL,

      email VARCHAR(255),

      phone VARCHAR(30),

      password_hash TEXT,

      role VARCHAR(40)
        NOT NULL,

      permissions JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      status VARCHAR(30)
        NOT NULL DEFAULT 'ACTIVE',

      last_login_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     DOCTORS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS doctors (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      name VARCHAR(255)
        NOT NULL,

      photo TEXT,

      specialization VARCHAR(255),

      department VARCHAR(255),

      qualification VARCHAR(255),

      experience VARCHAR(100),

      phone VARCHAR(30),

      email VARCHAR(255),

      availability_status VARCHAR(30)
        NOT NULL DEFAULT 'AVAILABLE',

      active BOOLEAN
        NOT NULL DEFAULT TRUE,

      appointment_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      token_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      emergency_enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

      appointment_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      token_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      emergency_settings JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     DOCTOR WORKING SCHEDULE
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS doctor_schedules (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      day_of_week INTEGER
        NOT NULL
        CHECK (
          day_of_week BETWEEN 0 AND 6
        ),

      start_time TIME,

      end_time TIME,

      break_start TIME,

      break_end TIME,

      is_working BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      UNIQUE (
        doctor_id,
        day_of_week
      )
    );
  `);


  /* =======================================================
     PATIENTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS patients (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      phone VARCHAR(30)
        NOT NULL,

      name VARCHAR(255)
        NOT NULL,

      language VARCHAR(10)
        NOT NULL DEFAULT 'en',

      date_of_birth DATE,

      gender VARCHAR(30),

      address TEXT,

      email VARCHAR(255),

      emergency_contact_name VARCHAR(255),

      emergency_contact_phone VARCHAR(30),

      active BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      UNIQUE (
        hospital_id,
        phone
      )
    );
  `);


  /* =======================================================
     SERVICES
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS services (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      name VARCHAR(255)
        NOT NULL,

      description TEXT,

      category VARCHAR(100),

      price NUMERIC(12,2)
        NOT NULL DEFAULT 0,

      active BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     TOKENS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS tokens (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE SET NULL,

      service_id INTEGER
        REFERENCES services(id)
        ON DELETE SET NULL,

      phone VARCHAR(30),

      patient_name VARCHAR(255),

      token_date DATE
        NOT NULL DEFAULT CURRENT_DATE,

      token_number INTEGER
        NOT NULL,

      status VARCHAR(30)
        NOT NULL DEFAULT 'WAITING',

      priority VARCHAR(30)
        NOT NULL DEFAULT 'NORMAL',

      source VARCHAR(30)
        NOT NULL DEFAULT 'WHATSAPP',

      called_at TIMESTAMPTZ,

      completed_at TIMESTAMPTZ,

      cancelled_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      UNIQUE (
        hospital_id,
        doctor_id,
        token_date,
        token_number
      )
    );
  `);


  /* =======================================================
     TOKEN QUEUE CONTROL
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS token_counters (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      token_date DATE
        NOT NULL,

      last_token INTEGER
        NOT NULL DEFAULT 0,

      current_token INTEGER
        NOT NULL DEFAULT 0,

      UNIQUE (
        hospital_id,
        doctor_id,
        token_date
      )
    );
  `);
  /* =======================================================
     APPOINTMENTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS appointments (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE SET NULL,

      doctor_id INTEGER
        NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      service_id INTEGER
        REFERENCES services(id)
        ON DELETE SET NULL,

      phone VARCHAR(30),

      patient_name VARCHAR(255),

      appointment_type VARCHAR(50)
        NOT NULL DEFAULT 'APPOINTMENT',

      appointment_date DATE
        NOT NULL,

      slot VARCHAR(100)
        NOT NULL,

      token_number INTEGER,

      status VARCHAR(30)
        NOT NULL DEFAULT 'BOOKED',

      payment_status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

      notes TEXT,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     EMERGENCY REQUESTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS emergencies (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE SET NULL,

      requested_doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE SET NULL,

      assigned_doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE SET NULL,

      phone VARCHAR(30),

      patient_name VARCHAR(255)
        NOT NULL,

      patient_phone VARCHAR(30),

      details TEXT,

      status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

      emergency_token INTEGER,

      requested_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      accepted_at TIMESTAMPTZ,

      resolved_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     MEDICINES
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS medicines (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE SET NULL,

      medicine_name VARCHAR(255)
        NOT NULL,

      dosage VARCHAR(100),

      frequency VARCHAR(100),

      duration VARCHAR(100),

      instructions TEXT,

      start_date DATE,

      end_date DATE,

      active BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     CARE / FOLLOW-UP / TESTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS care_records (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE SET NULL,

      care_type VARCHAR(50)
        NOT NULL,

      title VARCHAR(255),

      description TEXT,

      due_date DATE,

      status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     REMINDERS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS reminders (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE SET NULL,

      reminder_type VARCHAR(50),

      title VARCHAR(255),

      message TEXT,

      scheduled_at TIMESTAMPTZ,

      status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

      sent_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     PAYMENTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS payments (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE SET NULL,

      service_id INTEGER
        REFERENCES services(id)
        ON DELETE SET NULL,

      appointment_id BIGINT
        REFERENCES appointments(id)
        ON DELETE SET NULL,

      token_id BIGINT
        REFERENCES tokens(id)
        ON DELETE SET NULL,

      amount NUMERIC(12,2)
        NOT NULL DEFAULT 0,

      currency VARCHAR(10)
        NOT NULL DEFAULT 'INR',

      payment_method VARCHAR(50),

      transaction_id VARCHAR(255),

      status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

      refund_amount NUMERIC(12,2)
        NOT NULL DEFAULT 0,

      receipt_number VARCHAR(255),

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);
  /* =======================================================
     ANNOUNCEMENTS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS announcements (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      title VARCHAR(255)
        NOT NULL,

      message TEXT
        NOT NULL,

      type VARCHAR(30)
        NOT NULL DEFAULT 'GENERAL',

      start_time TIMESTAMPTZ,

      end_time TIMESTAMPTZ,

      active BOOLEAN
        NOT NULL DEFAULT TRUE,

      created_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS notifications (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE CASCADE,

      doctor_id INTEGER
        REFERENCES doctors(id)
        ON DELETE CASCADE,

      user_id INTEGER
        REFERENCES users(id)
        ON DELETE CASCADE,

      type VARCHAR(50)
        NOT NULL,

      title VARCHAR(255),

      message TEXT
        NOT NULL,

      channel VARCHAR(30)
        NOT NULL DEFAULT 'WHATSAPP',

      status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

      sent_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     SYSTEM LOGS
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS system_logs (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        REFERENCES hospitals(id)
        ON DELETE SET NULL,

      user_id INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

      actor_type VARCHAR(50),

      action VARCHAR(100)
        NOT NULL,

      entity_type VARCHAR(100),

      entity_id VARCHAR(100),

      description TEXT,

      metadata JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      ip_address VARCHAR(100),

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     PATIENT ACTIVITY
  ======================================================= */

  await safeQuery(`
    CREATE TABLE IF NOT EXISTS patient_activity (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
        NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      patient_id INTEGER
        REFERENCES patients(id)
        ON DELETE CASCADE,

      activity_type VARCHAR(100)
        NOT NULL,

      description TEXT,

      metadata JSONB
        NOT NULL DEFAULT '{}'::jsonb,

      created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    );
  `);


  /* =======================================================
     INDEXES — HOSPITAL ISOLATION
  ======================================================= */

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_users_hospital
    ON users(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_doctors_hospital
    ON doctors(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_patients_hospital
    ON patients(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_tokens_hospital
    ON tokens(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_tokens_doctor_date
    ON tokens(
      hospital_id,
      doctor_id,
      token_date
    );
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_appointments_hospital
    ON appointments(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
    ON appointments(
      hospital_id,
      doctor_id,
      appointment_date
    );
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_emergencies_hospital
    ON emergencies(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_emergencies_status
    ON emergencies(
      hospital_id,
      status
    );
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_payments_hospital
    ON payments(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_care_patient
    ON care_records(
      hospital_id,
      patient_id
    );
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_reminders_patient
    ON reminders(
      hospital_id,
      patient_id
    );
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_notifications_hospital
    ON notifications(hospital_id);
  `);

  await safeQuery(`
    CREATE INDEX IF NOT EXISTS idx_system_logs_hospital
    ON system_logs(hospital_id);
  `);


  /* =======================================================
     DEFAULT SUPER ADMIN
  ======================================================= */

  const superAdmin =
    await safeQuery(`
      SELECT id
      FROM users
      WHERE role = 'SUPER_ADMIN'
      LIMIT 1;
    `);


  if (
    superAdmin.rows.length === 0
  ) {

    await safeQuery(`
      INSERT INTO users
      (
        hospital_id,
        name,
        email,
        role,
        permissions,
        status
      )
      VALUES
      (
        NULL,
        'SmartClinic Super Admin',
        'admin@smartclinic.ai',
        'SUPER_ADMIN',
        '{
          "hospitals": true,
          "admins": true,
          "doctors": true,
          "patients": true,
          "tokens": true,
          "appointments": true,
          "emergency": true,
          "payments": true,
          "settings": true,
          "logs": true
        }'::jsonb,
        'ACTIVE'
      );
    `);

    console.log(
      "👑 Default Super Admin created"
    );
  }


  console.log(
    "✅ SmartClinic AI database schema ready"
  );
}


/* =========================================================
   HOSPITAL HELPER
========================================================= */

async function getHospitalByHospitalId(
  hospitalId
) {

  if (!hospitalId) {
    return null;
  }

  const result =
    await safeQuery(
      `
      SELECT *
      FROM hospitals
      WHERE hospital_id = $1
      LIMIT 1
      `,
      [hospitalId]
    );

  return result.rows[0] || null;
}


/* =========================================================
   HOSPITAL BY INTERNAL ID
========================================================= */

async function getHospitalById(
  hospitalId
) {

  if (!hospitalId) {
    return null;
  }

  const result =
    await safeQuery(
      `
      SELECT *
      FROM hospitals
      WHERE id = $1
      LIMIT 1
      `,
      [hospitalId]
    );

  return result.rows[0] || null;
}


/* =========================================================
   ACTIVE HOSPITAL CHECK
========================================================= */

async function isHospitalActive(
  hospitalId
) {

  const hospital =
    await getHospitalById(
      hospitalId
    );

  return !!(
    hospital &&
    hospital.status === "ACTIVE"
  );
}


/* =========================================================
   CREATE HOSPITAL
========================================================= */

async function createHospital(
  data
) {

  const {

    hospital_id,

    name,

    address = null,

    phone = null,

    email = null,

    logo = null,

    working_hours = {}

  } = data;


  if (
    !hospital_id ||
    !name
  ) {

    throw new Error(
      "hospital_id and hospital name are required"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO hospitals
      (
        hospital_id,
        name,
        address,
        phone,
        email,
        logo,
        working_hours
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING *
      `,
      [
        hospital_id,
        name,
        address,
        phone,
        email,
        logo,
        JSON.stringify(
          working_hours
        )
      ]
    );


  const hospital =
    result.rows[0];
    /* =======================================================
     DEFAULT HOSPITAL SETTINGS
  ======================================================= */

  await safeQuery(
    `
    INSERT INTO hospital_settings
    (
      hospital_id,
      token_settings,
      appointment_settings,
      emergency_settings,
      payment_settings,
      notification_settings,
      whatsapp_settings,
      security_settings
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    )
    ON CONFLICT (hospital_id)
    DO NOTHING
    `,
    [
      hospital.id,

      JSON.stringify({
        enabled: true,
        startToken: 1,
        maxTokens: 100,
        defaultDuration: 10
      }),

      JSON.stringify({
        enabled: true,
        advanceDays: 7,
        slotDuration: 15
      }),

      JSON.stringify({
        enabled: true,
        available24x7: true
      }),

      JSON.stringify({
        enabled: false,
        currency: "INR"
      }),

      JSON.stringify({
        whatsapp: true,
        tokenAlerts: true,
        appointmentAlerts: true,
        emergencyAlerts: true,
        reminders: true
      }),

      JSON.stringify({
        enabled: true
      }),

      JSON.stringify({
        sessionTimeout: 30
      })
    ]
  );


  return hospital;
}


/* =========================================================
   GET HOSPITAL SETTINGS
========================================================= */

async function getHospitalSettings(
  hospitalId
) {

  const result =
    await safeQuery(
      `
      SELECT *
      FROM hospital_settings
      WHERE hospital_id = $1
      LIMIT 1
      `,
      [hospitalId]
    );

  return result.rows[0] || null;
}


/* =========================================================
   UPDATE HOSPITAL STATUS
========================================================= */

async function updateHospitalStatus(
  hospitalId,
  status
) {

  if (
    ![
      "ACTIVE",
      "INACTIVE"
    ].includes(status)
  ) {

    throw new Error(
      "Invalid hospital status"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE hospitals
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [
        status,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   HOSPITAL-SAFE DOCTOR LOOKUP
========================================================= */

async function getDoctorById(
  hospitalId,
  doctorId
) {

  if (
    !hospitalId ||
    !doctorId
  ) {

    return null;
  }


  const result =
    await safeQuery(
      `
      SELECT *
      FROM doctors
      WHERE
        id = $1
        AND hospital_id = $2
        AND active = TRUE
      LIMIT 1
      `,
      [
        doctorId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   HOSPITAL-SAFE PATIENT LOOKUP
========================================================= */

async function getPatientByHospital(
  hospitalId,
  phone
) {

  if (
    !hospitalId ||
    !phone
  ) {

    return null;
  }


  const result =
    await safeQuery(
      `
      SELECT *
      FROM patients
      WHERE
        hospital_id = $1
        AND phone = $2
        AND active = TRUE
      LIMIT 1
      `,
      [
        hospitalId,
        phone
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   HOSPITAL-SAFE SERVICE LOOKUP
========================================================= */

async function getServiceById(
  hospitalId,
  serviceId
) {

  if (
    !hospitalId ||
    !serviceId
  ) {

    return null;
  }


  const result =
    await safeQuery(
      `
      SELECT *
      FROM services
      WHERE
        id = $1
        AND hospital_id = $2
        AND active = TRUE
      LIMIT 1
      `,
      [
        serviceId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   SYSTEM LOG HELPER
========================================================= */

async function createSystemLog(
  data
) {

  const {

    hospital_id = null,

    user_id = null,

    actor_type = "SYSTEM",

    action,

    entity_type = null,

    entity_id = null,

    description = null,

    metadata = {},

    ip_address = null

  } = data;


  if (!action) {
    return null;
  }


  const result =
    await safeQuery(
      `
      INSERT INTO system_logs
      (
        hospital_id,
        user_id,
        actor_type,
        action,
        entity_type,
        entity_id,
        description,
        metadata,
        ip_address
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING *
      `,
      [
        hospital_id,
        user_id,
        actor_type,
        action,
        entity_type,
        entity_id,
        description,
        JSON.stringify(
          metadata
        ),
        ip_address
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   HOSPITAL ISOLATION VALIDATOR
========================================================= */

async function validateHospitalOwnership(
  hospitalId,
  entityHospitalId
) {

  if (
    !hospitalId ||
    !entityHospitalId
  ) {

    return false;
  }


  return Number(hospitalId) ===
    Number(entityHospitalId);
}


/* =========================================================
   DOCTOR → HOSPITAL VALIDATION
========================================================= */

async function validateDoctorHospital(
  hospitalId,
  doctorId
) {

  const doctor =
    await getDoctorById(
      hospitalId,
      doctorId
    );


  if (!doctor) {
    return null;
  }


  return doctor;
}


/* =========================================================
   PATIENT → HOSPITAL VALIDATION
========================================================= */

async function validatePatientHospital(
  hospitalId,
  patientId
) {

  const result =
    await safeQuery(
      `
      SELECT *
      FROM patients
      WHERE
        id = $1
        AND hospital_id = $2
        AND active = TRUE
      LIMIT 1
      `,
      [
        patientId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}
/* =========================================================
   TOKEN COUNTER — DOCTOR SPECIFIC
========================================================= */

async function getOrCreateTokenCounter(
  hospitalId,
  doctorId,
  tokenDate
) {

  const result =
    await safeQuery(
      `
      INSERT INTO token_counters
      (
        hospital_id,
        doctor_id,
        token_date,
        last_token,
        current_token
      )
      VALUES
      (
        $1,
        $2,
        $3,
        0,
        0
      )
      ON CONFLICT
      (
        hospital_id,
        doctor_id,
        token_date
      )
      DO UPDATE SET
        updated_at = NOW()
      RETURNING *
      `,
      [
        hospitalId,
        doctorId,
        tokenDate
      ]
    );


  return result.rows[0];
}


/* =========================================================
   NEXT TOKEN — HOSPITAL + DOCTOR + DATE
========================================================= */

async function getNextHospitalDoctorToken(
  hospitalId,
  doctorId,
  tokenDate
) {

  const client =
    await pool.connect();


  try {

    await client.query(
      "BEGIN"
    );


    await client.query(
      `
      INSERT INTO token_counters
      (
        hospital_id,
        doctor_id,
        token_date,
        last_token,
        current_token
      )
      VALUES
      (
        $1,
        $2,
        $3,
        0,
        0
      )
      ON CONFLICT
      (
        hospital_id,
        doctor_id,
        token_date
      )
      DO NOTHING
      `,
      [
        hospitalId,
        doctorId,
        tokenDate
      ]
    );


    const result =
      await client.query(
        `
        UPDATE token_counters
        SET
          last_token = last_token + 1,
          updated_at = NOW()
        WHERE
          hospital_id = $1
          AND doctor_id = $2
          AND token_date = $3
        RETURNING last_token
        `,
        [
          hospitalId,
          doctorId,
          tokenDate
        ]
      );


    await client.query(
      "COMMIT"
    );


    return result.rows[0]
      ?.last_token || null;

  } catch (error) {

    await client.query(
      "ROLLBACK"
    );

    console.error(
      "❌ TOKEN COUNTER ERROR:",
      error.message
    );

    throw error;

  } finally {

    client.release();
  }
}


/* =========================================================
   DATABASE FOUNDATION COMPLETE
========================================================= */
/* =========================================================
   PART 3 — SMARTCLINIC AI
   HOSPITAL CONTEXT + ACCESS CONTROL + SAFE DATA HELPERS

   PURPOSE:

   1. WhatsApp user ko correct hospital se identify karna
   2. Hospital-wise data isolation
   3. Super Admin → all hospitals
   4. Hospital Admin → own hospital only
   5. Doctor → own hospital only
   6. Patient → own hospital only
   7. Token → hospital + doctor specific
   8. Appointment → hospital + doctor specific
   9. Emergency → same hospital
  10. Existing appointment/token flow ko preserve karna

   IMPORTANT:

   PART 2 ke database schema ke according hai.
========================================================= */


/* =========================================================
   DEFAULT HOSPITAL CONTEXT
========================================================= */

const DEFAULT_HOSPITAL_ID =
  Number(
    typeof HOSPITAL_ID !== "undefined"
      ? HOSPITAL_ID
      : 1
  );


/* =========================================================
   NORMALIZE HOSPITAL ID
========================================================= */

function normalizeHospitalId(
  hospitalId
) {

  const id =
    Number(hospitalId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return null;
  }

  return id;
}


/* =========================================================
   NORMALIZE PHONE
========================================================= */

function normalizePhone(
  phone
) {

  if (!phone) {
    return "";
  }

  return String(phone)
    .replace(/\D/g, "");
}


/* =========================================================
   HOSPITAL CONTEXT OBJECT
========================================================= */

function createHospitalContext(
  hospital
) {

  if (!hospital) {
    return null;
  }

  return {

    id:
      Number(hospital.id),

    hospital_id:
      hospital.hospital_id,

    name:
      hospital.name,

    status:
      hospital.status,

    token_enabled:
      hospital.token_enabled,

    appointment_enabled:
      hospital.appointment_enabled,

    emergency_enabled:
      hospital.emergency_enabled,

    payment_enabled:
      hospital.payment_enabled,

    care_enabled:
      hospital.care_enabled,

    whatsapp_enabled:
      hospital.whatsapp_enabled
  };
}


/* =========================================================
   GET DEFAULT HOSPITAL
========================================================= */

async function getDefaultHospital() {

  const result =
    await safeQuery(
      `
      SELECT *
      FROM hospitals
      WHERE
        id = $1
      LIMIT 1
      `,
      [
        DEFAULT_HOSPITAL_ID
      ]
    );

  return result.rows[0] || null;
}


/* =========================================================
   RESOLVE HOSPITAL
========================================================= */

async function resolveHospital(
  hospitalIdentifier = null
) {

  let hospital = null;


  /* =======================================================
     INTERNAL NUMERIC ID
  ======================================================= */

  if (
    hospitalIdentifier !== null &&
    hospitalIdentifier !== undefined &&
    /^\d+$/.test(
      String(hospitalIdentifier)
    )
  ) {

    hospital =
      await getHospitalById(
        Number(hospitalIdentifier)
      );
  }


  /* =======================================================
     PUBLIC HOSPITAL ID
  ======================================================= */

  if (
    !hospital &&
    hospitalIdentifier
  ) {

    hospital =
      await getHospitalByHospitalId(
        String(hospitalIdentifier)
      );
  }


  /* =======================================================
     DEFAULT HOSPITAL
  ======================================================= */

  if (!hospital) {

    hospital =
      await getDefaultHospital();
  }


  if (!hospital) {
    return null;
  }


  return createHospitalContext(
    hospital
  );
}


/* =========================================================
   CHECK HOSPITAL ACTIVE
========================================================= */

async function requireActiveHospital(
  hospitalId
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );

  if (!id) {

    throw new Error(
      "Invalid hospital ID"
    );
  }


  const hospital =
    await getHospitalById(
      id
    );


  if (!hospital) {

    throw new Error(
      "Hospital not found"
    );
  }


  if (
    hospital.status !==
    "ACTIVE"
  ) {

    throw new Error(
      "Hospital is inactive"
    );
  }


  return createHospitalContext(
    hospital
  );
}


/* =========================================================
   HOSPITAL FEATURE CHECK
========================================================= */

async function isHospitalFeatureEnabled(
  hospitalId,
  feature
) {

  const hospital =
    await getHospitalById(
      hospitalId
    );


  if (!hospital) {
    return false;
  }


  if (
    hospital.status !==
    "ACTIVE"
  ) {

    return false;
  }


  const featureMap = {

    TOKEN:
      hospital.token_enabled,

    APPOINTMENT:
      hospital.appointment_enabled,

    EMERGENCY:
      hospital.emergency_enabled,

    PAYMENT:
      hospital.payment_enabled,

    CARE:
      hospital.care_enabled,

    WHATSAPP:
      hospital.whatsapp_enabled
  };


  return !!featureMap[
    String(feature)
      .toUpperCase()
  ];
}


/* =========================================================
   REQUIRE HOSPITAL FEATURE
========================================================= */

async function requireHospitalFeature(
  hospitalId,
  feature
) {

  const enabled =
    await isHospitalFeatureEnabled(
      hospitalId,
      feature
    );


  if (!enabled) {

    throw new Error(
      `${feature} feature is disabled for this hospital`
    );
  }


  return true;
}


/* =========================================================
   GET HOSPITAL BY WHATSAPP PHONE
=========================================================

   IMPORTANT:

   Existing single-clinic deployments can continue using
   DEFAULT_HOSPITAL_ID.

   Multi-hospital deployments can later map a WhatsApp
   number / WhatsApp Business account to a hospital.

========================================================= */

async function getHospitalFromWhatsApp(
  phone,
  whatsappBusinessId = null
) {

  /*
   * If WhatsApp Business ID is available,
   * use hospital configuration.
   */

  if (whatsappBusinessId) {

    const result =
      await safeQuery(
        `
        SELECT h.*
        FROM hospitals h
        WHERE
          h.status = 'ACTIVE'
          AND h.whatsapp_enabled = TRUE
          AND (
            h.hospital_id = $1
            OR
            EXISTS (
              SELECT 1
              FROM hospital_settings hs
              WHERE
                hs.hospital_id = h.id
                AND hs.whatsapp_settings
                    ->> 'business_account_id' = $1
            )
          )
        LIMIT 1
        `,
        [
          String(
            whatsappBusinessId
          )
        ]
      );


    if (
      result.rows.length > 0
    ) {

      return createHospitalContext(
        result.rows[0]
      );
    }
  }


  /*
   * Current WhatsApp bot deployment:
   * use default hospital.
   */

  const hospital =
    await getDefaultHospital();


  if (!hospital) {
    return null;
  }


  return createHospitalContext(
    hospital
  );
}


/* =========================================================
   PATIENT HOSPITAL RESOLUTION
========================================================= */

async function resolvePatientHospital(
  phone,
  hospitalId = null
) {

  const normalizedPhone =
    normalizePhone(
      phone
    );


  if (!normalizedPhone) {
    return null;
  }


  /* =======================================================
     EXPLICIT HOSPITAL
  ======================================================= */

  if (hospitalId) {

    const hospital =
      await requireActiveHospital(
        hospitalId
      );


    const patient =
      await getPatientByHospital(
        hospital.id,
        normalizedPhone
      );


    return {

      hospital,

      patient
    };
  }


  /* =======================================================
     SEARCH EXISTING PATIENT
  ======================================================= */

  const result =
    await safeQuery(
      `
      SELECT
        p.*,
        h.name AS hospital_name,
        h.hospital_id AS public_hospital_id,
        h.status AS hospital_status
      FROM patients p

      INNER JOIN hospitals h
        ON h.id = p.hospital_id

      WHERE
        p.phone = $1
        AND p.active = TRUE

      ORDER BY
        p.created_at ASC

      LIMIT 1
      `,
      [
        normalizedPhone
      ]
    );


  if (
    result.rows.length === 0
  ) {

    return null;
  }


  const row =
    result.rows[0];


  const hospital =
    await requireActiveHospital(
      row.hospital_id
    );


  return {

    hospital,

    patient: row
  };
}


/* =========================================================
   GET PATIENT WITH HOSPITAL CONTEXT
========================================================= */

async function getPatientWithHospital(
  phone,
  hospitalId = null
) {

  return await resolvePatientHospital(
    phone,
    hospitalId
  );
}


/* =========================================================
   CREATE PATIENT IN HOSPITAL
========================================================= */

async function createHospitalPatient(
  hospitalId,
  data
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  if (!id) {

    throw new Error(
      "Invalid hospital ID"
    );
  }


  await requireActiveHospital(
    id
  );


  const {

    phone,

    name,

    language = "en",

    date_of_birth = null,

    gender = null,

    address = null,

    email = null,

    emergency_contact_name = null,

    emergency_contact_phone = null

  } = data;


  const normalizedPhone =
    normalizePhone(
      phone
    );


  if (
    !normalizedPhone ||
    !name
  ) {

    throw new Error(
      "Patient phone and name are required"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO patients
      (
        hospital_id,
        phone,
        name,
        language,
        date_of_birth,
        gender,
        address,
        email,
        emergency_contact_name,
        emergency_contact_phone
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )

      ON CONFLICT
      (
        hospital_id,
        phone
      )

      DO UPDATE SET

        name =
          EXCLUDED.name,

        language =
          EXCLUDED.language,

        updated_at =
          NOW()

      RETURNING *
      `,
      [
        id,
        normalizedPhone,
        name,
        language,
        date_of_birth,
        gender,
        address,
        email,
        emergency_contact_name,
        emergency_contact_phone
      ]
    );


  return result.rows[0];
}


/* =========================================================
   UPDATE PATIENT LANGUAGE
========================================================= */

async function updatePatientLanguage(
  hospitalId,
  phone,
  language
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  const normalizedPhone =
    normalizePhone(
      phone
    );


  if (
    !id ||
    !normalizedPhone
  ) {

    return null;
  }


  const result =
    await safeQuery(
      `
      UPDATE patients
      SET
        language = $1,
        updated_at = NOW()

      WHERE
        hospital_id = $2
        AND phone = $3

      RETURNING *
      `,
      [
        language,
        id,
        normalizedPhone
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   GET DOCTORS FOR HOSPITAL
========================================================= */

async function getHospitalDoctors(
  hospitalId,
  options = {}
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  if (!id) {
    return [];
  }


  const {

    includeInactive = false,

    tokenOnly = false,

    appointmentOnly = false,

    emergencyOnly = false

  } = options;


  const conditions = [
    `hospital_id = $1`
  ];


  const params = [
    id
  ];


  if (!includeInactive) {

    conditions.push(
      `active = TRUE`
    );
  }


  if (tokenOnly) {

    conditions.push(
      `token_enabled = TRUE`
    );
  }


  if (appointmentOnly) {

    conditions.push(
      `appointment_enabled = TRUE`
    );
  }


  if (emergencyOnly) {

    conditions.push(
      `emergency_enabled = TRUE`
    );
  }


  const result =
    await safeQuery(
      `
      SELECT *
      FROM doctors

      WHERE
        ${conditions.join(
          " AND "
        )}

      ORDER BY
        name ASC
      `,
      params
    );


  return result.rows;
}


/* =========================================================
   VALIDATE DOCTOR FOR SERVICE
========================================================= */

async function validateDoctorForHospitalService(
  hospitalId,
  doctorId,
  serviceType
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  const doctor =
    await getDoctorById(
      id,
      doctorId
    );


  if (!doctor) {
    return null;
  }


  const type =
    String(
      serviceType || ""
    )
      .toUpperCase();


  if (
    type === "TOKEN" &&
    !doctor.token_enabled
  ) {

    return null;
  }


  if (
    type === "APPOINTMENT" &&
    !doctor.appointment_enabled
  ) {

    return null;
  }


  if (
    type === "EMERGENCY" &&
    !doctor.emergency_enabled
  ) {

    return null;
  }


  if (
    doctor.availability_status ===
    "OFFLINE"
  ) {

    return null;
  }


  return doctor;
}


/* =========================================================
   GET DOCTOR DETAILS — HOSPITAL SAFE
========================================================= */

async function getHospitalDoctorDetails(
  hospitalId,
  doctorId
) {

  const doctor =
    await getDoctorById(
      hospitalId,
      doctorId
    );


  if (!doctor) {
    return null;
  }


  const schedule =
    await safeQuery(
      `
      SELECT *
      FROM doctor_schedules

      WHERE
        hospital_id = $1
        AND doctor_id = $2

      ORDER BY
        day_of_week ASC
      `,
      [
        hospitalId,
        doctorId
      ]
    );


  return {

    ...doctor,

    schedule:
      schedule.rows
  };
}


/* =========================================================
   TOKEN VALIDATION
========================================================= */

async function validateTokenOwnership(
  hospitalId,
  tokenId
) {

  const result =
    await safeQuery(
      `
      SELECT
        t.*,
        d.name AS doctor_name,
        p.name AS patient_real_name

      FROM tokens t

      INNER JOIN doctors d
        ON d.id = t.doctor_id
        AND d.hospital_id = t.hospital_id

      LEFT JOIN patients p
        ON p.id = t.patient_id
        AND p.hospital_id = t.hospital_id

      WHERE
        t.id = $1
        AND t.hospital_id = $2

      LIMIT 1
      `,
      [
        tokenId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   GET DOCTOR TOKEN BOARD
========================================================= */

async function getDoctorTokenBoard(
  hospitalId,
  doctorId,
  tokenDate
) {

  const doctor =
    await validateDoctorForHospitalService(
      hospitalId,
      doctorId,
      "TOKEN"
    );


  if (!doctor) {
    return null;
  }


  const result =
    await safeQuery(
      `
      SELECT

        t.id,

        t.token_number,

        t.status,

        t.priority,

        t.patient_name,

        t.phone,

        t.created_at,

        t.called_at,

        t.completed_at

      FROM tokens t

      WHERE
        t.hospital_id = $1
        AND t.doctor_id = $2
        AND t.token_date = $3

      ORDER BY
        t.token_number ASC
      `,
      [
        hospitalId,
        doctorId,
        tokenDate
      ]
    );


  return {

    hospital_id:
      hospitalId,

    doctor_id:
      doctorId,

    doctor,

    tokens:
      result.rows
  };
}


/* =========================================================
   GET CURRENT TOKEN
========================================================= */

async function getCurrentDoctorToken(
  hospitalId,
  doctorId,
  tokenDate
) {

  const result =
    await safeQuery(
      `
      SELECT *
      FROM tokens

      WHERE
        hospital_id = $1
        AND doctor_id = $2
        AND token_date = $3
        AND status = 'SERVING'

      ORDER BY
        called_at DESC

      LIMIT 1
      `,
      [
        hospitalId,
        doctorId,
        tokenDate
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   GET NEXT WAITING TOKEN
========================================================= */

async function getNextWaitingToken(
  hospitalId,
  doctorId,
  tokenDate
) {

  const result =
    await safeQuery(
      `
      SELECT *
      FROM tokens

      WHERE
        hospital_id = $1
        AND doctor_id = $2
        AND token_date = $3
        AND status = 'WAITING'

      ORDER BY

        CASE
          WHEN priority = 'EMERGENCY'
          THEN 0

          WHEN priority = 'HIGH'
          THEN 1

          ELSE 2
        END,

        token_number ASC

      LIMIT 1
      `,
      [
        hospitalId,
        doctorId,
        tokenDate
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   WAITING COUNT
========================================================= */

async function getDoctorWaitingCount(
  hospitalId,
  doctorId,
  tokenDate
) {

  const result =
    await safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS count

      FROM tokens

      WHERE
        hospital_id = $1
        AND doctor_id = $2
        AND token_date = $3
        AND status = 'WAITING'
      `,
      [
        hospitalId,
        doctorId,
        tokenDate
      ]
    );


  return Number(
    result.rows[0]?.count || 0
  );
}


/* =========================================================
   QUEUE POSITION
========================================================= */

async function getTokenQueuePosition(
  hospitalId,
  doctorId,
  tokenDate,
  tokenNumber
) {

  const result =
    await safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS position

      FROM tokens

      WHERE
        hospital_id = $1
        AND doctor_id = $2
        AND token_date = $3
        AND status = 'WAITING'
        AND token_number <= $4
      `,
      [
        hospitalId,
        doctorId,
        tokenDate,
        tokenNumber
      ]
    );


  return Number(
    result.rows[0]?.position || 0
  );
}


/* =========================================================
   APPOINTMENT OWNERSHIP VALIDATION
========================================================= */

async function validateAppointmentOwnership(
  hospitalId,
  appointmentId
) {

  const result =
    await safeQuery(
      `
      SELECT

        a.*,

        d.name AS doctor_name,

        d.specialization,

        p.name AS patient_real_name

      FROM appointments a

      INNER JOIN doctors d
        ON d.id = a.doctor_id
        AND d.hospital_id = a.hospital_id

      LEFT JOIN patients p
        ON p.id = a.patient_id
        AND p.hospital_id = a.hospital_id

      WHERE
        a.id = $1
        AND a.hospital_id = $2

      LIMIT 1
      `,
      [
        appointmentId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   GET PATIENT APPOINTMENTS
========================================================= */

async function getPatientAppointments(
  hospitalId,
  patientId,
  status = null
) {

  const conditions = [

    `a.hospital_id = $1`,

    `a.patient_id = $2`
  ];


  const params = [

    hospitalId,

    patientId
  ];


  if (status) {

    conditions.push(
      `a.status = $3`
    );

    params.push(
      status
    );
  }


  const result =
    await safeQuery(
      `
      SELECT

        a.*,

        d.name AS doctor_name,

        d.specialization,

        s.name AS service_name

      FROM appointments a

      INNER JOIN doctors d
        ON d.id = a.doctor_id
        AND d.hospital_id = a.hospital_id

      LEFT JOIN services s
        ON s.id = a.service_id
        AND s.hospital_id = a.hospital_id

      WHERE
        ${conditions.join(
          " AND "
        )}

      ORDER BY
        a.appointment_date ASC,
        a.slot ASC
      `,
      params
    );


  return result.rows;
}


/* =========================================================
   EMERGENCY HOSPITAL VALIDATION
========================================================= */

async function validateEmergencyOwnership(
  hospitalId,
  emergencyId
) {

  const result =
    await safeQuery(
      `
      SELECT

        e.*,

        d1.name AS requested_doctor_name,

        d2.name AS assigned_doctor_name

      FROM emergencies e

      LEFT JOIN doctors d1
        ON d1.id = e.requested_doctor_id
        AND d1.hospital_id = e.hospital_id

      LEFT JOIN doctors d2
        ON d2.id = e.assigned_doctor_id
        AND d2.hospital_id = e.hospital_id

      WHERE
        e.id = $1
        AND e.hospital_id = $2

      LIMIT 1
      `,
      [
        emergencyId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   GET HOSPITAL EMERGENCIES
========================================================= */

async function getHospitalEmergencies(
  hospitalId,
  status = null
) {

  const conditions = [

    `e.hospital_id = $1`
  ];


  const params = [

    hospitalId
  ];


  if (status) {

    conditions.push(
      `e.status = $2`
    );

    params.push(
      status
    );
  }


  const result =
    await safeQuery(
      `
      SELECT

        e.*,

        d1.name AS requested_doctor_name,

        d2.name AS assigned_doctor_name

      FROM emergencies e

      LEFT JOIN doctors d1
        ON d1.id = e.requested_doctor_id
        AND d1.hospital_id = e.hospital_id

      LEFT JOIN doctors d2
        ON d2.id = e.assigned_doctor_id
        AND d2.hospital_id = e.hospital_id

      WHERE
        ${conditions.join(
          " AND "
        )}

      ORDER BY
        e.requested_at DESC
      `,
      params
    );


  return result.rows;
}


/* =========================================================
   CREATE EMERGENCY
========================================================= */

async function createEmergencyRequest(
  hospitalId,
  data
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  await requireHospitalFeature(
    id,
    "EMERGENCY"
  );


  const {

    patient_id = null,

    requested_doctor_id = null,

    phone = null,

    patient_name,

    patient_phone = null,

    details = null

  } = data;


  if (!patient_name) {

    throw new Error(
      "Emergency patient name is required"
    );
  }


  /*
   * Validate requested doctor belongs
   * to same hospital.
   */

  if (
    requested_doctor_id
  ) {

    const doctor =
      await validateDoctorForHospitalService(
        id,
        requested_doctor_id,
        "EMERGENCY"
      );


    if (!doctor) {

      throw new Error(
        "Invalid emergency doctor"
      );
    }
  }


  /*
   * Validate patient belongs to
   * same hospital.
   */

  if (patient_id) {

    const patient =
      await validatePatientHospital(
        id,
        patient_id
      );


    if (!patient) {

      throw new Error(
        "Invalid patient for hospital"
      );
    }
  }


  const result =
    await safeQuery(
      `
      INSERT INTO emergencies
      (
        hospital_id,
        patient_id,
        requested_doctor_id,
        phone,
        patient_name,
        patient_phone,
        details,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'PENDING'
      )
      RETURNING *
      `,
      [
        id,
        patient_id,
        requested_doctor_id,
        normalizePhone(phone),
        patient_name,
        normalizePhone(
          patient_phone
        ),
        details
      ]
    );


  const emergency =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      id,

    actor_type:
      "PATIENT",

    action:
      "EMERGENCY_CREATED",

    entity_type:
      "EMERGENCY",

    entity_id:
      emergency.id,

    description:
      "New emergency request created",

    metadata: {

      patient_id,

      requested_doctor_id
    }
  });


  return emergency;
}
/* =========================================================
   ASSIGN EMERGENCY DOCTOR
========================================================= */

async function assignEmergencyDoctor(
  hospitalId,
  emergencyId,
  doctorId,
  userId = null
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  const doctor =
    await validateDoctorForHospitalService(
      id,
      doctorId,
      "EMERGENCY"
    );


  if (!doctor) {

    throw new Error(
      "Doctor does not belong to this hospital"
    );
  }


  const emergency =
    await validateEmergencyOwnership(
      id,
      emergencyId
    );


  if (!emergency) {

    throw new Error(
      "Emergency does not belong to this hospital"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE emergencies

      SET

        assigned_doctor_id = $1,

        status = 'ACCEPTED',

        accepted_at = NOW(),

        updated_at = NOW()

      WHERE
        id = $2
        AND hospital_id = $3

      RETURNING *
      `,
      [
        doctorId,
        emergencyId,
        id
      ]
    );


  const updated =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      id,

    user_id:
      userId,

    actor_type:
      "HOSPITAL_ADMIN",

    action:
      "EMERGENCY_DOCTOR_ASSIGNED",

    entity_type:
      "EMERGENCY",

    entity_id:
      emergencyId,

    description:
      "Emergency doctor assigned",

    metadata: {

      doctor_id:
        doctorId
    }
  });


  return updated;
}


/* =========================================================
   CREATE PATIENT ACTIVITY
========================================================= */

async function createPatientActivity(
  hospitalId,
  patientId,
  activityType,
  description = null,
  metadata = {}
) {

  if (
    !hospitalId ||
    !patientId ||
    !activityType
  ) {

    return null;
  }


  const patient =
    await validatePatientHospital(
      hospitalId,
      patientId
    );


  if (!patient) {

    throw new Error(
      "Patient does not belong to hospital"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO patient_activity
      (
        hospital_id,
        patient_id,
        activity_type,
        description,
        metadata
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING *
      `,
      [
        hospitalId,
        patientId,
        activityType,
        description,
        JSON.stringify(
          metadata
        )
      ]
    );


  return result.rows[0];
}


/* =========================================================
   CREATE NOTIFICATION
========================================================= */

async function createNotification(
  data
) {

  const {

    hospital_id,

    patient_id = null,

    doctor_id = null,

    user_id = null,

    type,

    title = null,

    message,

    channel = "WHATSAPP"

  } = data;


  if (
    !hospital_id ||
    !type ||
    !message
  ) {

    return null;
  }


  /*
   * Hospital must exist and be active
   * before notification creation.
   */

  await requireActiveHospital(
    hospital_id
  );


  /*
   * Patient isolation.
   */

  if (patient_id) {

    const patient =
      await validatePatientHospital(
        hospital_id,
        patient_id
      );


    if (!patient) {

      throw new Error(
        "Notification patient belongs to another hospital"
      );
    }
  }


  /*
   * Doctor isolation.
   */

  if (doctor_id) {

    const doctor =
      await getDoctorById(
        hospital_id,
        doctor_id
      );


    if (!doctor) {

      throw new Error(
        "Notification doctor belongs to another hospital"
      );
    }
  }


  const result =
    await safeQuery(
      `
      INSERT INTO notifications
      (
        hospital_id,
        patient_id,
        doctor_id,
        user_id,
        type,
        title,
        message,
        channel,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        'PENDING'
      )
      RETURNING *
      `,
      [
        hospital_id,
        patient_id,
        doctor_id,
        user_id,
        type,
        title,
        message,
        channel
      ]
    );


  return result.rows[0];
}


/* =========================================================
   ADMIN PERMISSION CHECK
========================================================= */

async function hasPermission(
  userId,
  permission
) {

  if (
    !userId ||
    !permission
  ) {

    return false;
  }


  const result =
    await safeQuery(
      `
      SELECT
        role,
        permissions,
        status

      FROM users

      WHERE
        id = $1

      LIMIT 1
      `,
      [
        userId
      ]
    );


  if (
    result.rows.length === 0
  ) {

    return false;
  }


  const user =
    result.rows[0];


  if (
    user.status !==
    "ACTIVE"
  ) {

    return false;
  }


  /*
   * Super Admin has global access.
   */

  if (
    user.role ===
    "SUPER_ADMIN"
  ) {

    return true;
  }


  const permissions =
    user.permissions || {};


  return (
    permissions[permission] ===
    true
  );
}


/* =========================================================
   USER HOSPITAL ACCESS
========================================================= */

async function canAccessHospital(
  userId,
  hospitalId
) {

  const result =
    await safeQuery(
      `
      SELECT
        role,
        hospital_id,
        status

      FROM users

      WHERE
        id = $1

      LIMIT 1
      `,
      [
        userId
      ]
    );


  if (
    result.rows.length === 0
  ) {

    return false;
  }


  const user =
    result.rows[0];


  if (
    user.status !==
    "ACTIVE"
  ) {

    return false;
  }


  /*
   * Super Admin:
   * all hospitals allowed.
   */

  if (
    user.role ===
    "SUPER_ADMIN"
  ) {

    return true;
  }


  /*
   * Hospital Admin / Doctor:
   * only assigned hospital.
   */

  return (
    Number(user.hospital_id) ===
    Number(hospitalId)
  );
}
/* =========================================================
   REQUIRE USER HOSPITAL ACCESS
========================================================= */

async function requireUserHospitalAccess(
  userId,
  hospitalId
) {

  const allowed =
    await canAccessHospital(
      userId,
      hospitalId
    );


  if (!allowed) {

    throw new Error(
      "Unauthorized hospital access"
    );
  }


  return true;
}


/* =========================================================
   SAFE ADMIN HOSPITAL QUERY
========================================================= */

async function getHospitalDashboardCounts(
  hospitalId
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  if (!id) {

    throw new Error(
      "Invalid hospital ID"
    );
  }


  const [

    patients,

    doctors,

    tokens,

    appointments,

    emergencies,

    revenue

  ] = await Promise.all([

    safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM patients
      WHERE
        hospital_id = $1
        AND active = TRUE
      `,
      [id]
    ),

    safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM doctors
      WHERE
        hospital_id = $1
        AND active = TRUE
      `,
      [id]
    ),

    safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM tokens
      WHERE
        hospital_id = $1
        AND token_date = CURRENT_DATE
      `,
      [id]
    ),

    safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM appointments
      WHERE
        hospital_id = $1
        AND appointment_date = CURRENT_DATE
      `,
      [id]
    ),

    safeQuery(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM emergencies
      WHERE
        hospital_id = $1
        AND requested_at::DATE = CURRENT_DATE
      `,
      [id]
    ),

    safeQuery(
      `
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS revenue

      FROM payments

      WHERE
        hospital_id = $1
        AND status = 'PAID'
        AND created_at::DATE = CURRENT_DATE
      `,
      [id]
    )

  ]);


  return {

    patients:
      Number(
        patients.rows[0]?.count || 0
      ),

    doctors:
      Number(
        doctors.rows[0]?.count || 0
      ),

    todayTokens:
      Number(
        tokens.rows[0]?.count || 0
      ),

    todayAppointments:
      Number(
        appointments.rows[0]?.count || 0
      ),

    todayEmergencies:
      Number(
        emergencies.rows[0]?.count || 0
      ),

    todayRevenue:
      Number(
        revenue.rows[0]?.revenue || 0
      )
  };
}


/* =========================================================
   GLOBAL SUPER ADMIN COUNTS
========================================================= */

async function getGlobalDashboardCounts() {

  const [

    hospitals,

    activeHospitals,

    admins,

    doctors,

    patients,

    tokens,

    appointments,

    emergencies,

    revenue

  ] = await Promise.all([

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM hospitals
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM hospitals
      WHERE status = 'ACTIVE'
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM users
      WHERE
        role IN (
          'SUPER_ADMIN',
          'HOSPITAL_ADMIN'
        )
        AND status = 'ACTIVE'
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM doctors
      WHERE active = TRUE
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM patients
      WHERE active = TRUE
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM tokens
      WHERE token_date = CURRENT_DATE
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM appointments
      WHERE appointment_date = CURRENT_DATE
    `),

    safeQuery(`
      SELECT COUNT(*)::INTEGER AS count
      FROM emergencies
      WHERE requested_at::DATE = CURRENT_DATE
    `),

    safeQuery(`
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS revenue
      FROM payments
      WHERE
        status = 'PAID'
        AND created_at::DATE = CURRENT_DATE
    `)

  ]);


  return {

    totalHospitals:
      Number(
        hospitals.rows[0]?.count || 0
      ),

    activeHospitals:
      Number(
        activeHospitals.rows[0]?.count || 0
      ),

    inactiveHospitals:
      Number(
        hospitals.rows[0]?.count || 0
      ) -
      Number(
        activeHospitals.rows[0]?.count || 0
      ),

    totalAdmins:
      Number(
        admins.rows[0]?.count || 0
      ),

    totalDoctors:
      Number(
        doctors.rows[0]?.count || 0
      ),

    totalPatients:
      Number(
        patients.rows[0]?.count || 0
      ),

    todayTokens:
      Number(
        tokens.rows[0]?.count || 0
      ),

    todayAppointments:
      Number(
        appointments.rows[0]?.count || 0
      ),

    todayEmergencies:
      Number(
        emergencies.rows[0]?.count || 0
      ),

    todayRevenue:
      Number(
        revenue.rows[0]?.revenue || 0
      )
  };
}


/* =========================================================
   HOSPITAL ADMIN CREATION
========================================================= */

async function createHospitalAdmin(
  hospitalId,
  data,
  createdBy = null
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  await requireActiveHospital(
    id
  );


  const {

    name,

    email = null,

    phone = null,

    password_hash = null,

    permissions = {}

  } = data;


  if (!name) {

    throw new Error(
      "Admin name is required"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO users
      (
        hospital_id,
        name,
        email,
        phone,
        password_hash,
        role,
        permissions,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        'HOSPITAL_ADMIN',
        $6,
        'ACTIVE'
      )
      RETURNING *
      `,
      [
        id,
        name,
        email,
        phone,
        password_hash,
        JSON.stringify(
          permissions
        )
      ]
    );


  const admin =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      id,

    user_id:
      createdBy,

    actor_type:
      "SUPER_ADMIN",

    action:
      "HOSPITAL_ADMIN_CREATED",

    entity_type:
      "USER",

    entity_id:
      admin.id,

    description:
      "Hospital admin created",

    metadata: {

      admin_id:
        admin.id
    }
  });


  return admin;
}
/* =========================================================
   CREATE DOCTOR
========================================================= */

async function createHospitalDoctor(
  hospitalId,
  data,
  createdBy = null
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  await requireActiveHospital(
    id
  );


  const {

    name,

    photo = null,

    specialization = null,

    department = null,

    qualification = null,

    experience = null,

    phone = null,

    email = null

  } = data;


  if (!name) {

    throw new Error(
      "Doctor name is required"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO doctors
      (
        hospital_id,
        name,
        photo,
        specialization,
        department,
        qualification,
        experience,
        phone,
        email
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING *
      `,
      [
        id,
        name,
        photo,
        specialization,
        department,
        qualification,
        experience,
        phone,
        email
      ]
    );


  const doctor =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      id,

    user_id:
      createdBy,

    actor_type:
      "HOSPITAL_ADMIN",

    action:
      "DOCTOR_CREATED",

    entity_type:
      "DOCTOR",

    entity_id:
      doctor.id,

    description:
      "Doctor created",

    metadata: {

      doctor_id:
        doctor.id
    }
  });


  return doctor;
}


/* =========================================================
   ADD DOCTOR SCHEDULE
========================================================= */

async function saveDoctorSchedule(
  hospitalId,
  doctorId,
  schedule
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  const doctor =
    await getDoctorById(
      id,
      doctorId
    );


  if (!doctor) {

    throw new Error(
      "Doctor does not belong to hospital"
    );
  }


  if (
    !Array.isArray(schedule)
  ) {

    throw new Error(
      "Schedule must be an array"
    );
  }


  for (
    const item of schedule
  ) {

    const {

      day_of_week,

      start_time = null,

      end_time = null,

      break_start = null,

      break_end = null,

      is_working = true

    } = item;


    await safeQuery(
      `
      INSERT INTO doctor_schedules
      (
        hospital_id,
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        break_start,
        break_end,
        is_working
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )

      ON CONFLICT
      (
        doctor_id,
        day_of_week
      )

      DO UPDATE SET

        start_time =
          EXCLUDED.start_time,

        end_time =
          EXCLUDED.end_time,

        break_start =
          EXCLUDED.break_start,

        break_end =
          EXCLUDED.break_end,

        is_working =
          EXCLUDED.is_working,

        updated_at =
          NOW()
      `,
      [
        id,
        doctorId,
        day_of_week,
        start_time,
        end_time,
        break_start,
        break_end,
        is_working
      ]
    );
  }


  return true;
}


/* =========================================================
   CREATE SERVICE
========================================================= */

async function createHospitalService(
  hospitalId,
  data,
  createdBy = null
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  await requireActiveHospital(
    id
  );


  const {

    name,

    description = null,

    category = null,

    price = 0

  } = data;


  if (!name) {

    throw new Error(
      "Service name is required"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO services
      (
        hospital_id,
        name,
        description,
        category,
        price
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING *
      `,
      [
        id,
        name,
        description,
        category,
        price
      ]
    );


  const service =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      id,

    user_id:
      createdBy,

    actor_type:
      "HOSPITAL_ADMIN",

    action:
      "SERVICE_CREATED",

    entity_type:
      "SERVICE",

    entity_id:
      service.id,

    description:
      "Hospital service created",

    metadata: {

      price
    }
  });


  return service;
}


/* =========================================================
   UPDATE TOKEN STATUS
========================================================= */

async function updateTokenStatus(
  hospitalId,
  tokenId,
  status,
  userId = null
) {

  const allowedStatuses = [

    "WAITING",

    "SERVING",

    "HOLD",

    "SKIPPED",

    "COMPLETED",

    "CANCELLED"
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "Invalid token status"
    );
  }


  const token =
    await validateTokenOwnership(
      hospitalId,
      tokenId
    );


  if (!token) {

    throw new Error(
      "Token does not belong to hospital"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE tokens

      SET

        status = $1,

        called_at =
          CASE
            WHEN $1 = 'SERVING'
            THEN COALESCE(
              called_at,
              NOW()
            )
            ELSE called_at
          END,

        completed_at =
          CASE
            WHEN $1 = 'COMPLETED'
            THEN NOW()
            ELSE completed_at
          END,

        cancelled_at =
          CASE
            WHEN $1 = 'CANCELLED'
            THEN NOW()
            ELSE cancelled_at
          END,

        updated_at = NOW()

      WHERE
        id = $2
        AND hospital_id = $3

      RETURNING *
      `,
      [
        status,
        tokenId,
        hospitalId
      ]
    );


  const updated =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      hospitalId,

    user_id:
      userId,

    actor_type:
      "STAFF",

    action:
      "TOKEN_STATUS_UPDATED",

    entity_type:
      "TOKEN",

    entity_id:
      tokenId,

    description:
      `Token status changed to ${status}`,

    metadata: {

      previous_status:
        token.status,

      new_status:
        status
    }
  });


  return updated;
}/* =========================================================
   UPDATE EMERGENCY STATUS
========================================================= */

async function updateEmergencyStatus(
  hospitalId,
  emergencyId,
  status,
  userId = null
) {

  const allowedStatuses = [

    "PENDING",

    "ACCEPTED",

    "IN_PROGRESS",

    "RESOLVED",

    "REJECTED"
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "Invalid emergency status"
    );
  }


  const emergency =
    await validateEmergencyOwnership(
      hospitalId,
      emergencyId
    );


  if (!emergency) {

    throw new Error(
      "Emergency does not belong to hospital"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE emergencies

      SET

        status = $1,

        accepted_at =
          CASE
            WHEN $1 = 'ACCEPTED'
            THEN COALESCE(
              accepted_at,
              NOW()
            )
            ELSE accepted_at
          END,

        resolved_at =
          CASE
            WHEN $1 = 'RESOLVED'
            THEN NOW()
            ELSE resolved_at
          END,

        updated_at = NOW()

      WHERE
        id = $2
        AND hospital_id = $3

      RETURNING *
      `,
      [
        status,
        emergencyId,
        hospitalId
      ]
    );


  const updated =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      hospitalId,

    user_id:
      userId,

    actor_type:
      "STAFF",

    action:
      "EMERGENCY_STATUS_UPDATED",

    entity_type:
      "EMERGENCY",

    entity_id:
      emergencyId,

    description:
      `Emergency status changed to ${status}`,

    metadata: {

      previous_status:
        emergency.status,

      new_status:
        status
    }
  });


  return updated;
}


/* =========================================================
   APPOINTMENT STATUS UPDATE
========================================================= */

async function updateAppointmentStatus(
  hospitalId,
  appointmentId,
  status,
  userId = null
) {

  const allowedStatuses = [

    "BOOKED",

    "CONFIRMED",

    "COMPLETED",

    "CANCELLED",

    "RESCHEDULED",

    "NO_SHOW"
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "Invalid appointment status"
    );
  }


  const appointment =
    await validateAppointmentOwnership(
      hospitalId,
      appointmentId
    );


  if (!appointment) {

    throw new Error(
      "Appointment does not belong to hospital"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE appointments

      SET

        status = $1,

        updated_at = NOW()

      WHERE
        id = $2
        AND hospital_id = $3

      RETURNING *
      `,
      [
        status,
        appointmentId,
        hospitalId
      ]
    );


  const updated =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      hospitalId,

    user_id:
      userId,

    actor_type:
      "STAFF",

    action:
      "APPOINTMENT_STATUS_UPDATED",

    entity_type:
      "APPOINTMENT",

    entity_id:
      appointmentId,

    description:
      `Appointment status changed to ${status}`,

    metadata: {

      previous_status:
        appointment.status,

      new_status:
        status
    }
  });


  return updated;
}/* =========================================================
   UPDATE EMERGENCY STATUS
========================================================= */

async function updateEmergencyStatus(
  hospitalId,
  emergencyId,
  status,
  userId = null
) {

  const allowedStatuses = [

    "PENDING",

    "ACCEPTED",

    "IN_PROGRESS",

    "RESOLVED",

    "REJECTED"
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "Invalid emergency status"
    );
  }


  const emergency =
    await validateEmergencyOwnership(
      hospitalId,
      emergencyId
    );


  if (!emergency) {

    throw new Error(
      "Emergency does not belong to hospital"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE emergencies

      SET

        status = $1,

        accepted_at =
          CASE
            WHEN $1 = 'ACCEPTED'
            THEN COALESCE(
              accepted_at,
              NOW()
            )
            ELSE accepted_at
          END,

        resolved_at =
          CASE
            WHEN $1 = 'RESOLVED'
            THEN NOW()
            ELSE resolved_at
          END,

        updated_at = NOW()

      WHERE
        id = $2
        AND hospital_id = $3

      RETURNING *
      `,
      [
        status,
        emergencyId,
        hospitalId
      ]
    );


  const updated =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      hospitalId,

    user_id:
      userId,

    actor_type:
      "STAFF",

    action:
      "EMERGENCY_STATUS_UPDATED",

    entity_type:
      "EMERGENCY",

    entity_id:
      emergencyId,

    description:
      `Emergency status changed to ${status}`,

    metadata: {

      previous_status:
        emergency.status,

      new_status:
        status
    }
  });


  return updated;
}


/* =========================================================
   APPOINTMENT STATUS UPDATE
========================================================= */

async function updateAppointmentStatus(
  hospitalId,
  appointmentId,
  status,
  userId = null
) {

  const allowedStatuses = [

    "BOOKED",

    "CONFIRMED",

    "COMPLETED",

    "CANCELLED",

    "RESCHEDULED",

    "NO_SHOW"
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "Invalid appointment status"
    );
  }


  const appointment =
    await validateAppointmentOwnership(
      hospitalId,
      appointmentId
    );


  if (!appointment) {

    throw new Error(
      "Appointment does not belong to hospital"
    );
  }


  const result =
    await safeQuery(
      `
      UPDATE appointments

      SET

        status = $1,

        updated_at = NOW()

      WHERE
        id = $2
        AND hospital_id = $3

      RETURNING *
      `,
      [
        status,
        appointmentId,
        hospitalId
      ]
    );


  const updated =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      hospitalId,

    user_id:
      userId,

    actor_type:
      "STAFF",

    action:
      "APPOINTMENT_STATUS_UPDATED",

    entity_type:
      "APPOINTMENT",

    entity_id:
      appointmentId,

    description:
      `Appointment status changed to ${status}`,

    metadata: {

      previous_status:
        appointment.status,

      new_status:
        status
    }
  });


  return updated;
}
/* =========================================================
   PAYMENT HOSPITAL VALIDATION
========================================================= */

async function validatePaymentOwnership(
  hospitalId,
  paymentId
) {

  const result =
    await safeQuery(
      `
      SELECT
        p.*,

        pt.name AS patient_name,

        s.name AS service_name

      FROM payments p

      LEFT JOIN patients pt
        ON pt.id = p.patient_id
        AND pt.hospital_id = p.hospital_id

      LEFT JOIN services s
        ON s.id = p.service_id
        AND s.hospital_id = p.hospital_id

      WHERE
        p.id = $1
        AND p.hospital_id = $2

      LIMIT 1
      `,
      [
        paymentId,
        hospitalId
      ]
    );


  return result.rows[0] || null;
}


/* =========================================================
   CREATE PAYMENT
========================================================= */

async function createHospitalPayment(
  hospitalId,
  data,
  userId = null
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  await requireActiveHospital(
    id
  );


  const {

    patient_id = null,

    service_id = null,

    appointment_id = null,

    token_id = null,

    amount = 0,

    currency = "INR",

    payment_method = null,

    transaction_id = null,

    status = "PENDING",

    receipt_number = null

  } = data;


  /*
   * Patient must belong to same hospital.
   */

  if (patient_id) {

    const patient =
      await validatePatientHospital(
        id,
        patient_id
      );


    if (!patient) {

      throw new Error(
        "Invalid payment patient"
      );
    }
  }


  /*
   * Service must belong to same hospital.
   */

  if (service_id) {

    const service =
      await getServiceById(
        id,
        service_id
      );


    if (!service) {

      throw new Error(
        "Invalid payment service"
      );
    }
  }


  /*
   * Appointment must belong
   * to same hospital.
   */

  if (appointment_id) {

    const appointment =
      await validateAppointmentOwnership(
        id,
        appointment_id
      );


    if (!appointment) {

      throw new Error(
        "Invalid payment appointment"
      );
    }
  }


  /*
   * Token must belong
   * to same hospital.
   */

  if (token_id) {

    const token =
      await validateTokenOwnership(
        id,
        token_id
      );


    if (!token) {

      throw new Error(
        "Invalid payment token"
      );
    }
  }


  const result =
    await safeQuery(
      `
      INSERT INTO payments
      (
        hospital_id,
        patient_id,
        service_id,
        appointment_id,
        token_id,
        amount,
        currency,
        payment_method,
        transaction_id,
        status,
        receipt_number
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING *
      `,
      [
        id,
        patient_id,
        service_id,
        appointment_id,
        token_id,
        amount,
        currency,
        payment_method,
        transaction_id,
        status,
        receipt_number
      ]
    );


  const payment =
    result.rows[0];


  await createSystemLog({

    hospital_id:
      id,

    user_id:
      userId,

    actor_type:
      "STAFF",

    action:
      "PAYMENT_CREATED",

    entity_type:
      "PAYMENT",

    entity_id:
      payment.id,

    description:
      "Payment record created",

    metadata: {

      amount,

      status
    }
  });


  return payment;
}


/* =========================================================
   HOSPITAL ANNOUNCEMENT
========================================================= */

async function createHospitalAnnouncement(
  hospitalId,
  data,
  userId = null
) {

  const id =
    normalizeHospitalId(
      hospitalId
    );


  await requireActiveHospital(
    id
  );


  const {

    title,

    message,

    type = "GENERAL",

    start_time = null,

    end_time = null,

    active = true

  } = data;


  if (
    !title ||
    !message
  ) {

    throw new Error(
      "Announcement title and message are required"
    );
  }


  const result =
    await safeQuery(
      `
      INSERT INTO announcements
      (
        hospital_id,
        title,
        message,
        type,
        start_time,
        end_time,
        active,
        created_by
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
      `,
      [
        id,
        title,
        message,
        type,
        start_time,
        end_time,
        active,
        userId
      ]
    );


  return result.rows[0];
}


/* =========================================================
   ACTIVE HOSPITAL ANNOUNCEMENTS
========================================================= */

async function getActiveHospitalAnnouncements(
  hospitalId
) {

  const result =
    await safeQuery(
      `
      SELECT *

      FROM announcements

      WHERE
        hospital_id = $1
        AND active = TRUE

        AND (
          start_time IS NULL
          OR start_time <= NOW()
        )

        AND (
          end_time IS NULL
          OR end_time >= NOW()
        )

      ORDER BY
        CASE
          WHEN type = 'EMERGENCY'
          THEN 0

          WHEN type = 'IMPORTANT'
          THEN 1

          ELSE 2
        END,

        created_at DESC
      `,
      [
        hospitalId
      ]
    );


  return result.rows;
}


/* =========================================================
   PATIENT HOME DATA
========================================================= */

async function getPatientHomeData(
  hospitalId,
  patientId
) {

  const patient =
    await validatePatientHospital(
      hospitalId,
      patientId
    );


  if (!patient) {

    throw new Error(
      "Patient does not belong to hospital"
    );
  }


  const [

    activeTokens,

    appointments,

    emergencies,

    care,

    announcements

  ] = await Promise.all([

    safeQuery(
      `
      SELECT

        t.*,

        d.name AS doctor_name,

        d.specialization

      FROM tokens t

      INNER JOIN doctors d
        ON d.id = t.doctor_id
        AND d.hospital_id = t.hospital_id

      WHERE

        t.hospital_id = $1

        AND t.patient_id = $2

        AND t.token_date = CURRENT_DATE

        AND t.status IN (
          'WAITING',
          'SERVING',
          'HOLD'
        )

      ORDER BY
        t.token_number ASC
      `,
      [
        hospitalId,
        patientId
      ]
    ),

    safeQuery(
      `
      SELECT

        a.*,

        d.name AS doctor_name,

        d.specialization

      FROM appointments a

      INNER JOIN doctors d
        ON d.id = a.doctor_id
        AND d.hospital_id = a.hospital_id

      WHERE

        a.hospital_id = $1

        AND a.patient_id = $2

        AND a.status IN (
          'BOOKED',
          'CONFIRMED',
          'RESCHEDULED'
        )

      ORDER BY

        a.appointment_date ASC,

        a.slot ASC

      LIMIT 5
      `,
      [
        hospitalId,
        patientId
      ]
    ),

    safeQuery(
      `
      SELECT *

      FROM emergencies

      WHERE

        hospital_id = $1

        AND patient_id = $2

        AND status NOT IN (
          'RESOLVED',
          'REJECTED'
        )

      ORDER BY
        requested_at DESC

      LIMIT 5
      `,
      [
        hospitalId,
        patientId
      ]
    ),

    safeQuery(
      `
      SELECT *

      FROM care_records

      WHERE

        hospital_id = $1

        AND patient_id = $2

        AND status = 'PENDING'

      ORDER BY
        due_date ASC NULLS LAST

      LIMIT 10
      `,
      [
        hospitalId,
        patientId
      ]
    ),

    safeQuery(
      `
      SELECT *

      FROM announcements

      WHERE

        hospital_id = $1

        AND active = TRUE

        AND (
          start_time IS NULL
          OR start_time <= NOW()
        )

        AND (
          end_time IS NULL
          OR end_time >= NOW()
        )

      ORDER BY
        created_at DESC

      LIMIT 10
      `,
      [
        hospitalId
      ]
    )

  ]);


  return {

    patient,

    activeTokens:
      activeTokens.rows,

    appointments:
      appointments.rows,

    emergencies:
      emergencies.rows,

    care:
      care.rows,

    announcements:
      announcements.rows
  };
}
/* =========================================================
   HOSPITAL CONTEXT FOR EXISTING WHATSAPP FLOW
========================================================= */

async function getWhatsAppHospitalContext(
  phone,
  whatsappBusinessId = null
) {

  const normalizedPhone =
    normalizePhone(
      phone
    );


  /*
   * First try existing patient mapping.
   */

  if (normalizedPhone) {

    const existing =
      await resolvePatientHospital(
        normalizedPhone
      );


    if (existing) {

      return {

        hospital:
          existing.hospital,

        patient:
          existing.patient
      };
    }
  }


  /*
   * New patient:
   * resolve through WhatsApp business
   * or default hospital.
   */

  const hospital =
    await getHospitalFromWhatsApp(
      normalizedPhone,
      whatsappBusinessId
    );


  if (!hospital) {

    return null;
  }


  return {

    hospital,

    patient:
      null
  };
}


/* =========================================================
   SAVE SELECTED DOCTOR — HOSPITAL SAFE
========================================================= */

async function saveHospitalSelectedDoctor(
  phone,
  hospitalId,
  doctorId,
  serviceType
) {

  const normalizedPhone =
    normalizePhone(
      phone
    );


  const doctor =
    await validateDoctorForHospitalService(
      hospitalId,
      doctorId,
      serviceType
    );


  if (!doctor) {

    throw new Error(
      "Selected doctor is not available in this hospital"
    );
  }


  /*
   * Existing session system will store
   * the hospital context in temp_data.
   *
   * This is intentionally compatible with
   * the existing setSession() function.
   */

  const session =
    await getSession(
      normalizedPhone
    );


  await setSession(
    normalizedPhone,

    session?.state ||
      "MAIN_MENU",

    {

      ...(session?.temp_data || {}),

      hospital_id:
        Number(hospitalId),

      doctor_id:
        Number(doctor.id),

      service_type:
        serviceType
    }
  );


  return doctor;
}


/* =========================================================
   VALIDATE SESSION HOSPITAL
========================================================= */

async function validateSessionHospital(
  phone
) {

  const session =
    await getSession(
      phone
    );


  const hospitalId =
    session?.temp_data?.hospital_id;


  if (!hospitalId) {

    const context =
      await getWhatsAppHospitalContext(
        phone
      );


    if (!context?.hospital) {

      return null;
    }


    return context.hospital;
  }


  const hospital =
    await getHospitalById(
      hospitalId
    );


  if (
    !hospital ||
    hospital.status !== "ACTIVE"
  ) {

    return null;
  }


  return createHospitalContext(
    hospital
  );
}


/* =========================================================
   SAVE HOSPITAL CONTEXT TO SESSION
========================================================= */

async function saveHospitalContextToSession(
  phone,
  hospital,
  extraData = {}
) {

  if (!hospital) {

    throw new Error(
      "Hospital context is required"
    );
  }


  const session =
    await getSession(
      phone
    );


  await setSession(

    phone,

    session?.state ||
      "MAIN_MENU",

    {

      ...(session?.temp_data || {}),

      hospital_id:
        Number(hospital.id),

      hospital_public_id:
        hospital.hospital_id,

      hospital_name:
        hospital.name,

      ...extraData
    }
  );


  return true;
}


/* =========================================================
   VERIFY SESSION DOCTOR BELONGS TO HOSPITAL
========================================================= */

async function validateSessionDoctor(
  phone,
  doctorId,
  serviceType
) {

  const hospital =
    await validateSessionHospital(
      phone
    );


  if (!hospital) {

    return null;
  }


  return await validateDoctorForHospitalService(

    hospital.id,

    doctorId,

    serviceType
  );
}


/* =========================================================
   VERIFY SESSION PATIENT
========================================================= */

async function validateSessionPatient(
  phone
) {

  const hospital =
    await validateSessionHospital(
      phone
    );


  if (!hospital) {

    return null;
  }


  return await getPatientByHospital(

    hospital.id,

    normalizePhone(
      phone
    )
  );
}


/* =========================================================
   FINAL ACCESS GUARD
========================================================= */

async function hospitalAccessGuard(
  phone,
  requiredFeature = null
) {

  const context =
    await getWhatsAppHospitalContext(
      phone
    );


  if (!context?.hospital) {

    throw new Error(
      "Hospital could not be resolved"
    );
  }


  const hospital =
    context.hospital;


  if (
    hospital.status !==
    "ACTIVE"
  ) {

    throw new Error(
      "Hospital is currently inactive"
    );
  }


  if (requiredFeature) {

    await requireHospitalFeature(

      hospital.id,

      requiredFeature
    );
  }


  return context;
}


/* =========================================================
   FINAL PART 3 CHECK
========================================================= */

async function verifySmartClinicDatabaseFoundation() {

  const result =
    await safeQuery(`
      SELECT
        (
          SELECT COUNT(*)
          FROM hospitals
        ) AS hospitals,

        (
          SELECT COUNT(*)
          FROM doctors
        ) AS doctors,

        (
          SELECT COUNT(*)
          FROM patients
        ) AS patients,

        (
          SELECT COUNT(*)
          FROM tokens
        ) AS tokens,

        (
          SELECT COUNT(*)
          FROM appointments
        ) AS appointments,

        (
          SELECT COUNT(*)
          FROM emergencies
        ) AS emergencies
    `);


  const data =
    result.rows[0] || {};


  console.log(
    "🏥 SMARTCLINIC DATABASE STATUS:",
    {
      hospitals:
        Number(
          data.hospitals || 0
        ),

      doctors:
        Number(
          data.doctors || 0
        ),

      patients:
        Number(
          data.patients || 0
        ),

      tokens:
        Number(
          data.tokens || 0
        ),

      appointments:
        Number(
          data.appointments || 0
        ),

      emergencies:
        Number(
          data.emergencies || 0
        )
    }
  );


  return data;
}
/* =========================================================
   END OF PART 3
========================================================= */
/* =========================================================
   SMARTCLINIC AI V2 — MULTI-ROLE PLATFORM + ADMIN API
   PART 4
   ========================================================= */

const crypto = require("crypto");

const BOOTSTRAP_SUPER_ADMIN_EMAIL =
  "admin@smartclinic.ai";

const BOOTSTRAP_SUPER_ADMIN_PASSWORD =
  "ChangeMe_2026!";


function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString("hex")
) {

  const hash =
    crypto.scryptSync(
      String(password),
      salt,
      64
    ).toString("hex");

  return `${salt}:${hash}`;
}


function verifyPassword(
  password,
  stored
) {

  try {

    const [salt, expected] =
      String(stored || "").split(":");

    if (
      !salt ||
      !expected
    ) {
      return false;
    }

    const actual =
      crypto.scryptSync(
        String(password),
        salt,
        64
      ).toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(actual, "hex"),
      Buffer.from(expected, "hex")
    );

  } catch (_) {

    return false;
  }
}


function makeSessionToken() {

  return crypto
    .randomBytes(48)
    .toString("hex");
}


function parseBearer(req) {

  const header =
    req.headers.authorization || "";

  if (
    !header.startsWith("Bearer ")
  ) {
    return null;
  }

  return header
    .slice(7)
    .trim() || null;
}


function toBool(
  value,
  fallback = false
) {

  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(
    String(value).toLowerCase()
  );
}


function safeLimit(
  value,
  fallback = 100,
  max = 500
) {

  const n =
    Number(value);

  if (
    !Number.isFinite(n)
  ) {
    return fallback;
  }

  return Math.min(
    Math.max(
      Math.trunc(n),
      1
    ),
    max
  );
}


/* =========================================================
   DATABASE FOUNDATION
========================================================= */

async function initSmartClinicV2() {

  await pool.query(`
    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS logo_url TEXT;

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS working_start TIME
    DEFAULT '10:00';

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS working_end TIME
    DEFAULT '18:00';

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS token_system_enabled BOOLEAN
    DEFAULT TRUE;

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS appointment_enabled BOOLEAN
    DEFAULT TRUE;

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS emergency_enabled BOOLEAN
    DEFAULT TRUE;

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN
    DEFAULT FALSE;

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS care_enabled BOOLEAN
    DEFAULT TRUE;

    ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN
    DEFAULT TRUE;


    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS photo_url TEXT;

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS department VARCHAR(150);

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS qualification VARCHAR(250);

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS experience_years INTEGER
    DEFAULT 0;

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS availability_status VARCHAR(30)
    DEFAULT 'AVAILABLE';

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS appointment_enabled BOOLEAN
    DEFAULT TRUE;

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS token_enabled BOOLEAN
    DEFAULT TRUE;

    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS emergency_enabled BOOLEAN
    DEFAULT TRUE;


    ALTER TABLE emergency_requests
    ADD COLUMN IF NOT EXISTS requested_doctor_id INTEGER
    REFERENCES doctors(id)
    ON DELETE SET NULL;

    ALTER TABLE emergency_requests
    ADD COLUMN IF NOT EXISTS assigned_doctor_id INTEGER
    REFERENCES doctors(id)
    ON DELETE SET NULL;

    ALTER TABLE emergency_requests
    ADD COLUMN IF NOT EXISTS emergency_token INTEGER;

    ALTER TABLE emergency_requests
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;

    ALTER TABLE emergency_requests
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

    ALTER TABLE emergency_requests
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP;
  `);


  await pool.query(`

    CREATE TABLE IF NOT EXISTS hospital_configs (

      hospital_id INTEGER PRIMARY KEY
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      token_system_enabled BOOLEAN DEFAULT TRUE,
      appointment_enabled BOOLEAN DEFAULT TRUE,
      emergency_enabled BOOLEAN DEFAULT TRUE,
      payment_enabled BOOLEAN DEFAULT FALSE,
      care_enabled BOOLEAN DEFAULT TRUE,
      whatsapp_enabled BOOLEAN DEFAULT TRUE,

      token_start TIME DEFAULT '10:00',
      token_end TIME DEFAULT '18:00',

      appointment_start TIME DEFAULT '10:00',
      appointment_end TIME DEFAULT '18:00',

      slot_minutes INTEGER DEFAULT 15,

      notifications_enabled BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS hospital_admins (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      full_name VARCHAR(150) NOT NULL,

      email VARCHAR(200)
      UNIQUE NOT NULL,

      phone VARCHAR(30),

      password_hash TEXT NOT NULL,

      role VARCHAR(30)
      NOT NULL
      DEFAULT 'HOSPITAL_ADMIN',

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS admin_permissions (

      admin_id INTEGER PRIMARY KEY
      REFERENCES hospital_admins(id)
      ON DELETE CASCADE,

      doctors BOOLEAN DEFAULT TRUE,
      patients BOOLEAN DEFAULT TRUE,
      tokens BOOLEAN DEFAULT TRUE,
      appointments BOOLEAN DEFAULT TRUE,
      emergency BOOLEAN DEFAULT TRUE,
      payments BOOLEAN DEFAULT FALSE,
      settings BOOLEAN DEFAULT FALSE,
      care BOOLEAN DEFAULT TRUE,
      reports BOOLEAN DEFAULT TRUE
    );


    CREATE TABLE IF NOT EXISTS admin_sessions (

      id BIGSERIAL PRIMARY KEY,

      admin_id INTEGER NOT NULL
      REFERENCES hospital_admins(id)
      ON DELETE CASCADE,

      token_hash VARCHAR(128)
      UNIQUE NOT NULL,

      expires_at TIMESTAMP NOT NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      last_used_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS patient_hospital_links (

      id BIGSERIAL PRIMARY KEY,

      patient_id INTEGER NOT NULL
      REFERENCES patients(id)
      ON DELETE CASCADE,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      first_seen_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      last_seen_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      is_active BOOLEAN DEFAULT TRUE,

      UNIQUE(
        patient_id,
        hospital_id
      )
    );


    CREATE TABLE IF NOT EXISTS doctor_sessions (

      id BIGSERIAL PRIMARY KEY,

      doctor_id INTEGER NOT NULL
      REFERENCES doctors(id)
      ON DELETE CASCADE,

      token_hash VARCHAR(128)
      UNIQUE NOT NULL,

      expires_at TIMESTAMP NOT NULL,

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      last_used_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS doctor_accounts (

      id SERIAL PRIMARY KEY,

      doctor_id INTEGER UNIQUE NOT NULL
      REFERENCES doctors(id)
      ON DELETE CASCADE,

      email VARCHAR(200)
      UNIQUE NOT NULL,

      password_hash TEXT NOT NULL,

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS hospital_services (

      id SERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      service_name VARCHAR(200)
      NOT NULL,

      description TEXT,

      price NUMERIC(12,2)
      DEFAULT 0,

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS payments (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      patient_id INTEGER
      REFERENCES patients(id)
      ON DELETE SET NULL,

      phone VARCHAR(30),

      service_id INTEGER
      REFERENCES hospital_services(id)
      ON DELETE SET NULL,

      appointment_id INTEGER
      REFERENCES appointments(id)
      ON DELETE SET NULL,

      token_id BIGINT
      REFERENCES token_queue(id)
      ON DELETE SET NULL,

      amount NUMERIC(12,2)
      NOT NULL DEFAULT 0,

      paid_amount NUMERIC(12,2)
      NOT NULL DEFAULT 0,

      status VARCHAR(30)
      DEFAULT 'PENDING',

      transaction_reference VARCHAR(200),

      receipt_number VARCHAR(100),

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS care_records (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      patient_id INTEGER
      REFERENCES patients(id)
      ON DELETE SET NULL,

      doctor_id INTEGER
      REFERENCES doctors(id)
      ON DELETE SET NULL,

      medicine_name VARCHAR(250),

      medicine_schedule VARCHAR(250),

      follow_up_date DATE,

      tests TEXT,

      instructions TEXT,

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS patient_reminders (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      patient_id INTEGER
      REFERENCES patients(id)
      ON DELETE SET NULL,

      patient_phone VARCHAR(30)
      NOT NULL,

      reminder_type VARCHAR(50)
      NOT NULL,

      title VARCHAR(200)
      NOT NULL,

      message TEXT,

      remind_at TIMESTAMP
      NOT NULL,

      status VARCHAR(30)
      DEFAULT 'PENDING',

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS announcements (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      title VARCHAR(200)
      NOT NULL,

      message TEXT
      NOT NULL,

      category VARCHAR(30)
      DEFAULT 'GENERAL',

      start_at TIMESTAMP,

      end_at TIMESTAMP,

      is_active BOOLEAN
      DEFAULT TRUE,

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS notifications (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER NOT NULL
      REFERENCES hospitals(id)
      ON DELETE CASCADE,

      recipient_type VARCHAR(30)
      NOT NULL,

      recipient_id VARCHAR(100),

      recipient_phone VARCHAR(30),

      type VARCHAR(50)
      NOT NULL,

      title VARCHAR(200),

      message TEXT
      NOT NULL,

      status VARCHAR(30)
      DEFAULT 'PENDING',

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP,

      sent_at TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS system_logs (

      id BIGSERIAL PRIMARY KEY,

      hospital_id INTEGER
      REFERENCES hospitals(id)
      ON DELETE SET NULL,

      actor_type VARCHAR(30),

      actor_id VARCHAR(100),

      action VARCHAR(100)
      NOT NULL,

      entity_type VARCHAR(50),

      entity_id VARCHAR(100),

      details JSONB
      DEFAULT '{}'::jsonb,

      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
    );


    CREATE INDEX IF NOT EXISTS
    idx_admin_sessions_token
    ON admin_sessions(token_hash);


    CREATE INDEX IF NOT EXISTS
    idx_patient_hospital
    ON patient_hospital_links(
      hospital_id,
      patient_id
    );


    CREATE INDEX IF NOT EXISTS
    idx_payments_hospital
    ON payments(
      hospital_id,
      created_at
    );


    CREATE INDEX IF NOT EXISTS
    idx_care_hospital_patient
    ON care_records(
      hospital_id,
      patient_id
    );


    CREATE INDEX IF NOT EXISTS
    idx_reminders_due
    ON patient_reminders(
      hospital_id,
      remind_at,
      status
    );


    CREATE INDEX IF NOT EXISTS
    idx_announcements_active
    ON announcements(
      hospital_id,
      is_active,
      start_at,
      end_at
    );


    CREATE INDEX IF NOT EXISTS
    idx_logs_hospital
    ON system_logs(
      hospital_id,
      created_at
    );

  `);


  const superAdmin =
    await pool.query(
      `
      SELECT id
      FROM hospital_admins
      WHERE role = 'SUPER_ADMIN'
        AND email = $1
      LIMIT 1
      `,
      [
        BOOTSTRAP_SUPER_ADMIN_EMAIL
      ]
    );


  await pool.query(`
    INSERT INTO patient_hospital_links
    (
      patient_id,
      hospital_id
    )

    SELECT DISTINCT
      tq.patient_id,
      tq.hospital_id

    FROM token_queue tq

    WHERE tq.patient_id IS NOT NULL

    ON CONFLICT
    (
      patient_id,
      hospital_id
    )
    DO NOTHING;


    INSERT INTO patient_hospital_links
    (
      patient_id,
      hospital_id
    )

    SELECT DISTINCT
      p.id,
      a.hospital_id

    FROM patients p

    JOIN appointments a
      ON a.phone = p.phone

    ON CONFLICT
    (
      patient_id,
      hospital_id
    )
    DO NOTHING;
  `);


  if (!superAdmin.rows.length) {

    const created =
      await pool.query(
        `
        INSERT INTO hospital_admins
        (
          hospital_id,
          full_name,
          email,
          password_hash,
          role,
          is_active
        )
        VALUES
        (
          NULL,
          'SmartClinic Super Admin',
          $1,
          $2,
          'SUPER_ADMIN',
          TRUE
        )
        RETURNING id
        `,
        [
          BOOTSTRAP_SUPER_ADMIN_EMAIL,
          hashPassword(
            BOOTSTRAP_SUPER_ADMIN_PASSWORD
          )
        ]
      );


    await pool.query(
      `
      INSERT INTO admin_permissions
      (
        admin_id,
        doctors,
        patients,
        tokens,
        appointments,
        emergency,
        payments,
        settings,
        care,
        reports
      )
      VALUES
      (
        $1,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        TRUE
      )
      `,
      [
        created.rows[0].id
      ]
    );


    console.warn(
      "⚠️ Bootstrap Super Admin created:",
      BOOTSTRAP_SUPER_ADMIN_EMAIL
    );

    console.warn(
      "⚠️ Change the bootstrap password immediately in production."
    );
  }
}


/* =========================================================
   SYSTEM LOG
========================================================= */

async function writeSystemLog({
  hospitalId = null,
  actorType = "SYSTEM",
  actorId = null,
  action,
  entityType = null,
  entityId = null,
  details = {}
}) {

  try {

    await pool.query(
      `
      INSERT INTO system_logs
      (
        hospital_id,
        actor_type,
        actor_id,
        action,
        entity_type,
        entity_id,
        details
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      `,
      [
        hospitalId,
        actorType,
        actorId,
        action,
        entityType,
        entityId,
        JSON.stringify(details)
      ]
    );

  } catch (error) {

    console.error(
      "System log error:",
      error.message
    );
  }
}


/* =========================================================
   HOSPITAL CONFIG
========================================================= */

async function ensureHospitalConfig(
  hospitalId
) {

  await pool.query(
    `
    INSERT INTO hospital_configs
    (
      hospital_id
    )
    VALUES
    ($1)

    ON CONFLICT
    (hospital_id)
    DO NOTHING
    `,
    [
      hospitalId
    ]
  );
}


/* =========================================================
   ADMIN SESSION
========================================================= */

async function createAdminSession(
  adminId
) {

  const raw =
    makeSessionToken();

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(raw)
      .digest("hex");


  await pool.query(
    `
    INSERT INTO admin_sessions
    (
      admin_id,
      token_hash,
      expires_at
    )
    VALUES
    (
      $1,
      $2,
      NOW() + INTERVAL '7 days'
    )
    `,
    [
      adminId,
      tokenHash
    ]
  );


  return raw;
}


/* =========================================================
   AUTH ADMIN
========================================================= */

async function getAuthAdmin(
  req
) {

  const raw =
    parseBearer(req);

  if (!raw) {
    return null;
  }


  const tokenHash =
    crypto
      .createHash("sha256")
      .update(raw)
      .digest("hex");


  const result =
    await pool.query(
      `
      SELECT
        a.*,
        p.*

      FROM admin_sessions s

      JOIN hospital_admins a
        ON a.id = s.admin_id

      LEFT JOIN admin_permissions p
        ON p.admin_id = a.id

      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND a.is_active = TRUE

      LIMIT 1
      `,
      [
        tokenHash
      ]
    );


  if (!result.rows.length) {
    return null;
  }


  await pool.query(
    `
    UPDATE admin_sessions
    SET last_used_at = NOW()
    WHERE token_hash = $1
    `,
    [
      tokenHash
    ]
  );


  return result.rows[0];
}


async function requireAuth(
  req,
  res,
  next
) {

  const admin =
    await getAuthAdmin(req);

  if (!admin) {

    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized"
      });
  }


  req.auth =
    admin;

  next();
}


function requireRole(
  ...roles
) {

  return (
    req,
    res,
    next
  ) => {

    if (
      !req.auth ||
      !roles.includes(
        req.auth.role
      )
    ) {

      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden"
        });
    }

    next();
  };
}


function scopedHospitalId(
  req
) {

  if (
    req.auth.role ===
    "SUPER_ADMIN"
  ) {

    return (
      req.params.hospitalId ||
      req.body.hospital_id ||
      req.query.hospital_id ||
      null
    );
  }


  return req.auth.hospital_id;
}


async function ensureScopedHospital(
  req,
  res,
  next
) {

  const hospitalId =
    scopedHospitalId(req);


  if (!hospitalId) {

    return res
      .status(400)
      .json({
        success: false,
        message:
          "hospital_id is required"
      });
  }


  if (
    req.auth.role !==
      "SUPER_ADMIN" &&
    Number(hospitalId) !==
      Number(req.auth.hospital_id)
  ) {

    return res
      .status(403)
      .json({
        success: false,
        message:
          "Hospital access denied"
      });
  }


  const h =
    await pool.query(
      `
      SELECT *
      FROM hospitals
      WHERE id = $1
      LIMIT 1
      `,
      [
        hospitalId
      ]
    );


  if (!h.rows.length) {

    return res
      .status(404)
      .json({
        success: false,
        message:
          "Hospital not found"
      });
  }


  req.hospital =
    h.rows[0];

  next();
}


function adminCan(
  req,
  permission
) {

  return (
    req.auth.role ===
      "SUPER_ADMIN" ||
    req.auth[permission] ===
      true
  );
}


function permissionMiddleware(
  permission
) {

  return (
    req,
    res,
    next
  ) => {

    if (
      !adminCan(
        req,
        permission
      )
    ) {

      return res
        .status(403)
        .json({
          success: false,
          message:
            `Permission denied: ${permission}`
        });
    }

    next();
  };
}


/* =========================================================
   AUTH ROUTES
========================================================= */

app.post(
  "/api/auth/login",
  async (
    req,
    res
  ) => {

    try {

      const {
        email,
        password
      } =
        req.body || {};


      if (
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email and password are required"
          });
      }


      const result =
        await pool.query(
          `
          SELECT *
          FROM hospital_admins
          WHERE LOWER(email)
                = LOWER($1)
            AND is_active = TRUE
          LIMIT 1
          `,
          [
            email
          ]
        );


      const admin =
        result.rows[0];


      if (
        !admin ||
        !verifyPassword(
          password,
          admin.password_hash
        )
      ) {

        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid credentials"
          });
      }


      await pool.query(
        `
        DELETE FROM admin_sessions
        WHERE expires_at <= NOW()
        `
      );


      const token =
        await createAdminSession(
          admin.id
        );


      await writeSystemLog({
        hospitalId:
          admin.hospital_id,

        actorType:
          admin.role,

        actorId:
          admin.id,

        action:
          "LOGIN"
      });


      const permissions =
        await pool.query(
          `
          SELECT *
          FROM admin_permissions
          WHERE admin_id = $1
          `,
          [
            admin.id
          ]
        );


      return res.json({
        success: true,

        token,

        user: {
          id:
            admin.id,

          name:
            admin.full_name,

          email:
            admin.email,

          phone:
            admin.phone,

          role:
            admin.role,

          hospital_id:
            admin.hospital_id,

          permissions:
            permissions.rows[0] ||
            null
        }
      });

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      res
        .status(500)
        .json({
          success: false,
          message:
            "Login failed"
        });
    }
  }
);


app.post(
  "/api/auth/logout",
  requireAuth,
  async (
    req,
    res
  ) => {

    const raw =
      parseBearer(req);

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex");


    await pool.query(
      `
      DELETE FROM admin_sessions
      WHERE token_hash = $1
      `,
      [
        tokenHash
      ]
    );


    res.json({
      success: true
    });
  }
);


app.get(
  "/api/auth/me",
  requireAuth,
  async (
    req,
    res
  ) => {

    res.json({
      success: true,

      user: {
        id:
          req.auth.id,

        name:
          req.auth.full_name,

        email:
          req.auth.email,

        role:
          req.auth.role,

        hospital_id:
          req.auth.hospital_id
      }
    });
  }
);


/* =========================================================
   SUPER ADMIN — GLOBAL DASHBOARD
========================================================= */

app.get(
  "/api/super-admin/dashboard",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    try {

      const q =
        async (
          sql,
          params = []
        ) =>
          (
            await pool.query(
              sql,
              params
            )
          )
            .rows[0]
            ?.count || 0;


      const today =
        getTodayDate();


      const [
        hospitals,
        activeHospitals,
        admins,
        doctors,
        patients,
        tokens,
        appointments,
        emergencies,
        revenue
      ] =
        await Promise.all([

          q(
            `
            SELECT COUNT(*)::int count
            FROM hospitals
            `
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM hospitals
            WHERE is_active = TRUE
            `
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM hospital_admins
            WHERE role='HOSPITAL_ADMIN'
            `
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM doctors
            `
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM patients
            `
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM token_queue
            WHERE token_date=$1
            `,
            [
              today
            ]
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM appointments
            WHERE appointment_date=$1
            `,
            [
              today
            ]
          ),

          q(
            `
            SELECT COUNT(*)::int count
            FROM emergency_requests
            WHERE created_at::date=$1
            `,
            [
              today
            ]
          ),

          (
            await pool.query(
              `
              SELECT
                COALESCE(
                  SUM(paid_amount),
                  0
                )::numeric revenue

              FROM payments

              WHERE status
                IN (
                  'PAID',
                  'PARTIAL'
                )
              `
            )
          )
            .rows[0]
            ?.revenue || 0

        ]);


      res.json({

        success: true,

        data: {

          totalHospitals:
            hospitals,

          activeHospitals,

          inactiveHospitals:
            Number(hospitals) -
            Number(activeHospitals),

          totalHospitalAdmins:
            admins,

          totalDoctors:
            doctors,

          totalPatients:
            patients,

          todaysTokens:
            tokens,

          todaysAppointments:
            appointments,

          todaysEmergencies:
            emergencies,

          revenueOverview:
            revenue
        }
      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Dashboard failed"
        });
    }
  }
);


/* =========================================================
   SUPER ADMIN — HOSPITAL MANAGEMENT
========================================================= */

app.get(
  "/api/super-admin/hospitals",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const limit =
      safeLimit(
        req.query.limit
      );


    const result =
      await pool.query(
        `
        SELECT
          h.*,

          COALESCE(
            (
              SELECT COUNT(*)
              FROM doctors d
              WHERE d.hospital_id =
                    h.id
            ),
            0
          )::int doctor_count,

          COALESCE(
            (
              SELECT COUNT(*)
              FROM patient_hospital_links ph
              WHERE ph.hospital_id =
                    h.id
            ),
            0
          )::int patient_count

        FROM hospitals h

        ORDER BY h.id DESC

        LIMIT $1
        `,
        [
          limit
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/super-admin/hospitals",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    try {

      const {
        hospital_name,
        hospital_code,
        address,
        city,
        state,
        phone,
        email,
        logo_url
      } =
        req.body || {};


      if (
        !hospital_name ||
        !hospital_code
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "hospital_name and hospital_code are required"
          });
      }


      const result =
        await pool.query(
          `
          INSERT INTO hospitals
          (
            hospital_name,
            hospital_code,
            address,
            city,
            state,
            phone,
            email,
            logo_url
          )
          VALUES
          (
            $1,$2,$3,$4,$5,$6,$7,$8
          )
          RETURNING *
          `,
          [
            hospital_name,
            hospital_code,
            address || null,
            city || null,
            state || null,
            phone || null,
            email || null,
            logo_url || null
          ]
        );


      await ensureHospitalConfig(
        result.rows[0].id
      );


      await writeSystemLog({
        actorType:
          "SUPER_ADMIN",

        actorId:
          req.auth.id,

        action:
          "HOSPITAL_CREATED",

        entityType:
          "hospital",

        entityId:
          result.rows[0].id,

        details:
          req.body
      });


      res
        .status(201)
        .json({
          success: true,
          data:
            result.rows[0]
        });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,

          message:
            error.code === "23505"
              ? "Hospital code already exists"
              : "Hospital creation failed"
        });
    }
  }
);


app.patch(
  "/api/super-admin/hospitals/:hospitalId",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const allowed = [

      "hospital_name",
      "hospital_code",
      "address",
      "city",
      "state",
      "phone",
      "email",
      "logo_url",
      "working_start",
      "working_end",
      "is_active",

      "token_system_enabled",
      "appointment_enabled",
      "emergency_enabled",
      "payment_enabled",
      "care_enabled",
      "whatsapp_enabled"
    ];


    const entries =
      Object.entries(
        req.body || {}
      )
      .filter(
        ([key]) =>
          allowed.includes(key)
      );


    if (!entries.length) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "No valid fields"
        });
    }


    const sets =
      entries
        .map(
          ([key], index) =>
            `${key}=$${index + 1}`
        )
        .join(", ");


    const values =
      entries.map(
        ([, value]) =>
          value
      );


    values.push(
      req.params.hospitalId
    );


    const result =
      await pool.query(
        `
        UPDATE hospitals

        SET
          ${sets},
          updated_at=NOW()

        WHERE id=$${values.length}

        RETURNING *
        `,
        values
      );


    if (!result.rows.length) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Hospital not found"
        });
    }


    await ensureHospitalConfig(
      req.params.hospitalId
    );


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   GLOBAL DOCTORS
========================================================= */

app.get(
  "/api/super-admin/doctors",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          d.*,
          h.hospital_name

        FROM doctors d

        JOIN hospitals h
          ON h.id=d.hospital_id

        ORDER BY d.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   GLOBAL PATIENTS
========================================================= */

app.get(
  "/api/super-admin/patients",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          p.*,

          COALESCE(
            json_agg(
              json_build_object(
                'hospital_id',
                h.id,
                'hospital_name',
                h.hospital_name
              )
            )
            FILTER (
              WHERE h.id IS NOT NULL
            ),
            '[]'
          ) hospitals

        FROM patients p

        LEFT JOIN patient_hospital_links ph
          ON ph.patient_id=p.id

        LEFT JOIN hospitals h
          ON h.id=ph.hospital_id

        GROUP BY p.id

        ORDER BY p.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   GLOBAL TOKENS
========================================================= */

app.get(
  "/api/super-admin/tokens",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          tq.*,
          h.hospital_name,
          d.doctor_name

        FROM token_queue tq

        JOIN hospitals h
          ON h.id=tq.hospital_id

        JOIN doctors d
          ON d.id=tq.doctor_id

        ORDER BY
          tq.token_date DESC,
          tq.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   GLOBAL APPOINTMENTS
========================================================= */

app.get(
  "/api/super-admin/appointments",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          a.*,
          h.hospital_name,
          d.doctor_name

        FROM appointments a

        JOIN hospitals h
          ON h.id=a.hospital_id

        JOIN doctors d
          ON d.id=a.doctor_id

        ORDER BY
          a.appointment_date DESC,
          a.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   GLOBAL EMERGENCIES
========================================================= */

app.get(
  "/api/super-admin/emergencies",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          e.*,
          h.hospital_name,
          d.doctor_name
          AS assigned_doctor

        FROM emergency_requests e

        LEFT JOIN hospitals h
          ON h.id=e.hospital_id

        LEFT JOIN doctors d
          ON d.id=e.assigned_doctor_id

        ORDER BY e.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   GLOBAL PAYMENTS
========================================================= */

app.get(
  "/api/super-admin/payments",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          p.*,
          h.hospital_name,
          s.service_name

        FROM payments p

        JOIN hospitals h
          ON h.id=p.hospital_id

        LEFT JOIN hospital_services s
          ON s.id=p.service_id

        ORDER BY p.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   GLOBAL SYSTEM LOGS
========================================================= */

app.get(
  "/api/super-admin/logs",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          l.*,
          h.hospital_name

        FROM system_logs l

        LEFT JOIN hospitals h
          ON h.id=l.hospital_id

        ORDER BY l.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   SUPER ADMIN — HOSPITAL ADMINS
========================================================= */

app.get(
  "/api/super-admin/admins",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          a.id,
          a.hospital_id,
          a.full_name,
          a.email,
          a.phone,
          a.role,
          a.is_active,
          a.created_at,

          h.hospital_name,

          p.*

        FROM hospital_admins a

        LEFT JOIN hospitals h
          ON h.id=a.hospital_id

        LEFT JOIN admin_permissions p
          ON p.admin_id=a.id

        ORDER BY a.id DESC

        LIMIT $1
        `,
        [
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/super-admin/admins",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    try {

      const {
        full_name,
        email,
        phone,
        password,
        hospital_id,
        permissions = {}
      } =
        req.body || {};


      if (
        !full_name ||
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "full_name, email and password are required"
          });
      }


      const created =
        await pool.query(
          `
          INSERT INTO hospital_admins
          (
            hospital_id,
            full_name,
            email,
            phone,
            password_hash,
            role
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            'HOSPITAL_ADMIN'
          )
          RETURNING
            id,
            hospital_id,
            full_name,
            email,
            phone,
            role,
            is_active
          `,
          [
            hospital_id || null,
            full_name,
            email,
            phone || null,
            hashPassword(
              password
            )
          ]
        );


      const id =
        created.rows[0].id;


      await pool.query(
        `
        INSERT INTO admin_permissions
        (
          admin_id,
          doctors,
          patients,
          tokens,
          appointments,
          emergency,
          payments,
          settings,
          care,
          reports
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        `,
        [
          id,

          toBool(
            permissions.doctors,
            true
          ),

          toBool(
            permissions.patients,
            true
          ),

          toBool(
            permissions.tokens,
            true
          ),

          toBool(
            permissions.appointments,
            true
          ),

          toBool(
            permissions.emergency,
            true
          ),

          toBool(
            permissions.payments,
            false
          ),

          toBool(
            permissions.settings,
            false
          ),

          toBool(
            permissions.care,
            true
          ),

          toBool(
            permissions.reports,
            true
          )
        ]
      );


      if (hospital_id) {

        await ensureHospitalConfig(
          hospital_id
        );
      }


      res
        .status(201)
        .json({
          success: true,
          data:
            created.rows[0]
        });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Admin creation failed"
        });
    }
  }
);


app.patch(
  "/api/super-admin/admins/:adminId/status",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        UPDATE hospital_admins

        SET
          is_active=$1,
          updated_at=NOW()

        WHERE id=$2

        RETURNING
          id,
          full_name,
          email,
          role,
          is_active
        `,
        [
          toBool(
            req.body?.is_active
          ),
          req.params.adminId
        ]
      );


    if (!result.rows.length) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Admin not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   END PART 4
========================================================= */
/* =========================================================
   PART 5
   HOSPITAL ADMIN + DOCTOR PANEL
========================================================= */


/* =========================================================
   HOSPITAL ADMIN DASHBOARD
========================================================= */

app.get(
  "/api/hospital/dashboard",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  async (
    req,
    res
  ) => {

    const hospital =
      req.hospital;

    const today =
      getTodayDate();


    const q =
      async (
        sql,
        params = []
      ) =>
        Number(
          (
            await pool.query(
              sql,
              params
            )
          )
            .rows[0]
            ?.count || 0
        );


    const [
      patients,
      tokens,
      waiting,
      current,
      appointments,
      emergencies,
      doctors,
      revenue
    ] =
      await Promise.all([

        q(
          `
          SELECT
            COUNT(
              DISTINCT patient_id
            )::int count

          FROM token_queue

          WHERE hospital_id=$1
            AND token_date=$2
          `,
          [
            hospital.id,
            today
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM token_queue

          WHERE hospital_id=$1
            AND token_date=$2

            AND status IN
            (
              'WAITING',
              'CALLED'
            )
          `,
          [
            hospital.id,
            today
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM token_queue

          WHERE hospital_id=$1
            AND token_date=$2
            AND status='WAITING'
          `,
          [
            hospital.id,
            today
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM token_queue

          WHERE hospital_id=$1
            AND token_date=$2
            AND status='CALLED'
          `,
          [
            hospital.id,
            today
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM appointments

          WHERE hospital_id=$1
            AND appointment_date=$2
          `,
          [
            hospital.id,
            today
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM emergency_requests

          WHERE hospital_id=$1

            AND status IN
            (
              'OPEN',
              'PENDING',
              'ACCEPTED',
              'IN_PROGRESS'
            )
          `,
          [
            hospital.id
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM doctors

          WHERE hospital_id=$1
            AND is_active=TRUE
            AND availability_status='AVAILABLE'
          `,
          [
            hospital.id
          ]
        ),

        (
          await pool.query(
            `
            SELECT
              COALESCE(
                SUM(paid_amount),
                0
              )::numeric revenue

            FROM payments

            WHERE hospital_id=$1
            `,
            [
              hospital.id
            ]
          )
        )
          .rows[0]
          ?.revenue || 0

      ]);


    res.json({

      success: true,

      data: {

        hospital,

        todaysPatients:
          patients,

        activeTokens:
          tokens,

        waitingPatients:
          waiting,

        currentToken:
          current,

        todaysAppointments:
          appointments,

        emergencyRequests:
          emergencies,

        doctorsAvailable:
          doctors,

        revenue
      }
    });
  }
);


/* =========================================================
   HOSPITAL CONFIG
========================================================= */

app.get(
  "/api/hospital/config",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  async (
    req,
    res
  ) => {

    await ensureHospitalConfig(
      req.hospital.id
    );


    const result =
      await pool.query(
        `
        SELECT *
        FROM hospital_configs
        WHERE hospital_id=$1
        `,
        [
          req.hospital.id
        ]
      );


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


app.patch(
  "/api/hospital/config",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "settings"
  ),
  async (
    req,
    res
  ) => {

    const allowed = [

      "token_system_enabled",

      "appointment_enabled",

      "emergency_enabled",

      "payment_enabled",

      "care_enabled",

      "whatsapp_enabled",

      "token_start",

      "token_end",

      "appointment_start",

      "appointment_end",

      "slot_minutes",

      "notifications_enabled"
    ];


    await ensureHospitalConfig(
      req.hospital.id
    );


    const entries =
      Object.entries(
        req.body || {}
      )
      .filter(
        ([key]) =>
          allowed.includes(key)
      );


    if (!entries.length) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "No valid settings"
        });
    }


    const sets =
      entries
        .map(
          ([key], index) =>
            `${key}=$${index + 1}`
        )
        .join(", ");


    const values =
      entries.map(
        ([, value]) =>
          value
      );


    values.push(
      req.hospital.id
    );


    const result =
      await pool.query(
        `
        UPDATE hospital_configs

        SET
          ${sets},
          updated_at=NOW()

        WHERE hospital_id=
          $${values.length}

        RETURNING *
        `,
        values
      );


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   DOCTOR MANAGEMENT
========================================================= */

app.get(
  "/api/hospital/doctors",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "doctors"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT *
        FROM doctors

        WHERE hospital_id=$1

        ORDER BY id DESC
        `,
        [
          req.hospital.id
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/hospital/doctors",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "doctors"
  ),
  async (
    req,
    res
  ) => {

    try {

      const b =
        req.body || {};


      if (
        !b.doctor_name
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "doctor_name is required"
          });
      }


      const result =
        await pool.query(
          `
          INSERT INTO doctors
          (
            hospital_id,
            doctor_name,
            specialization,
            department,
            qualification,
            experience_years,
            average_consultation_minutes,
            is_on_duty,
            is_active,
            availability_status,
            appointment_enabled,
            token_enabled,
            emergency_enabled,
            photo_url
          )

          VALUES
          (
            $1,$2,$3,$4,$5,$6,$7,
            $8,$9,$10,$11,$12,$13,$14
          )

          RETURNING *
          `,
          [
            req.hospital.id,

            b.doctor_name,

            b.specialization ||
              null,

            b.department ||
              null,

            b.qualification ||
              null,

            Number(
              b.experience_years ||
              0
            ),

            Number(
              b.average_consultation_minutes ||
              5
            ),

            toBool(
              b.is_on_duty,
              false
            ),

            toBool(
              b.is_active,
              true
            ),

            b.availability_status ||
              "AVAILABLE",

            toBool(
              b.appointment_enabled,
              true
            ),

            toBool(
              b.token_enabled,
              true
            ),

            toBool(
              b.emergency_enabled,
              true
            ),

            b.photo_url ||
              null
          ]
        );


      res
        .status(201)
        .json({
          success: true,
          data:
            result.rows[0]
        });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Doctor creation failed"
        });
    }
  }
);


app.patch(
  "/api/hospital/doctors/:doctorId",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "doctors"
  ),
  async (
    req,
    res
  ) => {

    const allowed = [

      "doctor_name",

      "specialization",

      "department",

      "qualification",

      "experience_years",

      "average_consultation_minutes",

      "is_on_duty",

      "is_active",

      "availability_status",

      "appointment_enabled",

      "token_enabled",

      "emergency_enabled",

      "photo_url"
    ];


    const entries =
      Object.entries(
        req.body || {}
      )
      .filter(
        ([key]) =>
          allowed.includes(key)
      );


    if (!entries.length) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "No valid fields"
        });
    }


    const sets =
      entries
        .map(
          ([key], index) =>
            `${key}=$${index + 1}`
        )
        .join(", ");


    const values =
      entries.map(
        ([, value]) =>
          value
      );


    values.push(
      req.params.doctorId
    );

    values.push(
      req.hospital.id
    );


    const result =
      await pool.query(
        `
        UPDATE doctors

        SET
          ${sets},
          updated_at=NOW()

        WHERE id=$${values.length - 1}

          AND hospital_id=$${values.length}

        RETURNING *
        `,
        values
      );


    if (!result.rows.length) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Doctor not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   TOKEN MANAGEMENT
========================================================= */

app.get(
  "/api/hospital/tokens",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "tokens"
  ),
  async (
    req,
    res
  ) => {

    const date =
      req.query.date ||
      getTodayDate();


    const result =
      await pool.query(
        `
        SELECT
          tq.*,
          d.doctor_name,
          d.specialization

        FROM token_queue tq

        JOIN doctors d
          ON d.id=tq.doctor_id

        WHERE tq.hospital_id=$1
          AND tq.token_date=$2

        ORDER BY
          tq.doctor_id,
          tq.token_number
        `,
        [
          req.hospital.id,
          date
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.get(
  "/api/hospital/tokens/board",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "tokens"
  ),
  async (
    req,
    res
  ) => {

    const date =
      req.query.date ||
      getTodayDate();


    const result =
      await pool.query(
        `
        SELECT

          d.id
          AS doctor_id,

          d.doctor_name,

          COALESCE(
            MAX(
              CASE
                WHEN tq.status='CALLED'
                THEN tq.token_number
              END
            ),
            0
          )
          AS current_token,

          COALESCE(
            MIN(
              CASE
                WHEN tq.status='WAITING'
                THEN tq.token_number
              END
            ),
            0
          )
          AS next_token,

          COUNT(
            CASE
              WHEN tq.status='WAITING'
              THEN 1
            END
          )::int
          AS waiting_count,

          COUNT(
            tq.id
          )::int
          AS total_tokens

        FROM doctors d

        LEFT JOIN token_queue tq

          ON tq.doctor_id=d.id

          AND tq.hospital_id=$1

          AND tq.token_date=$2

        WHERE d.hospital_id=$1

        GROUP BY
          d.id,
          d.doctor_name

        ORDER BY d.id
        `,
        [
          req.hospital.id,
          date
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   TOKEN ACTION
========================================================= */

async function hospitalTokenAction(
  req,
  res,
  action
) {

  const id =
    req.params.tokenId;


  const allowed =
    await pool.query(
      `
      SELECT
        tq.*,
        d.doctor_name

      FROM token_queue tq

      JOIN doctors d
        ON d.id=tq.doctor_id

      WHERE tq.id=$1
        AND tq.hospital_id=$2
      `,
      [
        id,
        req.hospital.id
      ]
    );


  if (!allowed.rows.length) {

    return res
      .status(404)
      .json({
        success: false,
        message:
          "Token not found"
      });
  }


  let status =
    "WAITING";


  if (
    action === "call"
  ) {
    status =
      "CALLED";
  }


  if (
    action === "complete"
  ) {
    status =
      "COMPLETED";
  }


  if (
    action === "cancel"
  ) {
    status =
      "CANCELLED";
  }


  const result =
    await pool.query(
      `
      UPDATE token_queue

      SET

        status=$1,

        called_at=
          CASE
            WHEN $1='CALLED'
            THEN COALESCE(
              called_at,
              NOW()
            )
            ELSE called_at
          END,

        completed_at=
          CASE
            WHEN $1='COMPLETED'
            THEN NOW()
            ELSE completed_at
          END,

        cancelled_at=
          CASE
            WHEN $1='CANCELLED'
            THEN NOW()
            ELSE cancelled_at
          END,

        updated_at=NOW()

      WHERE id=$2

      RETURNING *
      `,
      [
        status,
        id
      ]
    );


  await writeSystemLog({

    hospitalId:
      req.hospital.id,

    actorType:
      req.auth.role,

    actorId:
      req.auth.id,

    action:
      `TOKEN_${action.toUpperCase()}`,

    entityType:
      "token",

    entityId:
      id
  });


  res.json({
    success: true,
    data:
      result.rows[0]
  });
}


app.post(
  "/api/hospital/tokens/:tokenId/call",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "tokens"
  ),
  (
    req,
    res
  ) =>
    hospitalTokenAction(
      req,
      res,
      "call"
    )
);


app.post(
  "/api/hospital/tokens/:tokenId/complete",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "tokens"
  ),
  (
    req,
    res
  ) =>
    hospitalTokenAction(
      req,
      res,
      "complete"
    )
);


app.post(
  "/api/hospital/tokens/:tokenId/cancel",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "tokens"
  ),
  (
    req,
    res
  ) =>
    hospitalTokenAction(
      req,
      res,
      "cancel"
    )
);


/* =========================================================
   NEW TOKEN
========================================================= */

app.post(
  "/api/hospital/tokens",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "tokens"
  ),
  async (
    req,
    res
  ) => {

    try {

      const {
        doctor_id,
        patient_id,
        patient_phone,
        patient_name,
        token_date =
          getTodayDate()
      } =
        req.body || {};


      if (!doctor_id) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "doctor_id is required"
          });
      }


      const doctor =
        await pool.query(
          `
          SELECT *
          FROM doctors

          WHERE id=$1
            AND hospital_id=$2
            AND is_active=TRUE
            AND token_enabled=TRUE
          `,
          [
            doctor_id,
            req.hospital.id
          ]
        );


      if (!doctor.rows.length) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Doctor is not available for tokens"
          });
      }


      let patient = null;


      if (
        patient_id
      ) {

        patient =
          await pool.query(
            `
            SELECT *
            FROM patients

            WHERE id=$1
            `,
            [
              patient_id
            ]
          );
      }


      const name =
        patient_name ||
        patient?.rows[0]?.name ||
        "Patient";


      const phone =
        patient_phone ||
        patient?.rows[0]?.phone ||
        null;


      const next =
        await getNextTokenNumber(
          req.hospital.id,
          Number(doctor_id),
          token_date
        );


      const result =
        await pool.query(
          `
          INSERT INTO token_queue
          (
            hospital_id,
            doctor_id,
            patient_id,
            patient_phone,
            patient_name,
            token_date,
            token_number,
            source,
            status
          )

          VALUES
          (
            $1,$2,$3,$4,$5,
            $6,$7,'OFFLINE','WAITING'
          )

          RETURNING *
          `,
          [
            req.hospital.id,
            doctor_id,
            patient_id ||
              null,
            phone,
            name,
            token_date,
            next
          ]
        );


      res
        .status(201)
        .json({
          success: true,
          data:
            result.rows[0]
        });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Token generation failed"
        });
    }
  }
);


/* =========================================================
   APPOINTMENTS
========================================================= */

app.get(
  "/api/hospital/appointments",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "appointments"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          a.*,
          d.doctor_name

        FROM appointments a

        JOIN doctors d
          ON d.id=a.doctor_id

        WHERE a.hospital_id=$1

        ORDER BY
          a.appointment_date DESC,
          a.id DESC

        LIMIT $2
        `,
        [
          req.hospital.id,
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   EMERGENCY MANAGEMENT
========================================================= */

app.get(
  "/api/hospital/emergencies",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "emergency"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          e.*,
          d.doctor_name
          AS assigned_doctor

        FROM emergency_requests e

        LEFT JOIN doctors d
          ON d.id=e.assigned_doctor_id

        WHERE e.hospital_id=$1

        ORDER BY e.id DESC
        `,
        [
          req.hospital.id
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/hospital/emergencies/:emergencyId/assign",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "emergency"
  ),
  async (
    req,
    res
  ) => {

    const {
      doctor_id
    } =
      req.body || {};


    if (!doctor_id) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "doctor_id is required"
        });
    }


    const doctor =
      await pool.query(
        `
        SELECT *
        FROM doctors

        WHERE id=$1
          AND hospital_id=$2
          AND is_active=TRUE
          AND emergency_enabled=TRUE
        `,
        [
          doctor_id,
          req.hospital.id
        ]
      );


    if (!doctor.rows.length) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "Doctor not available"
        });
    }


    const result =
      await pool.query(
        `
        UPDATE emergency_requests

        SET
          assigned_doctor_id=$1,
          status='ACCEPTED',
          accepted_at=NOW(),
          updated_at=NOW()

        WHERE id=$2
          AND hospital_id=$3

        RETURNING *
        `,
        [
          doctor_id,
          req.params.emergencyId,
          req.hospital.id
        ]
      );


    if (!result.rows.length) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Emergency not found"
        });
    }


    await writeSystemLog({

      hospitalId:
        req.hospital.id,

      actorType:
        req.auth.role,

      actorId:
        req.auth.id,

      action:
        "EMERGENCY_ASSIGNED",

      entityType:
        "emergency",

      entityId:
        req.params.emergencyId,

      details: {
        doctor_id
      }
    });


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


app.patch(
  "/api/hospital/emergencies/:emergencyId/status",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "emergency"
  ),
  async (
    req,
    res
  ) => {

    const status =
      String(
        req.body?.status ||
        ""
      )
        .toUpperCase();


    const validStatuses = [

      "OPEN",

      "PENDING",

      "ACCEPTED",

      "IN_PROGRESS",

      "RESOLVED",

      "REJECTED"
    ];


    if (
      !validStatuses.includes(
        status
      )
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid emergency status"
        });
    }


    const result =
      await pool.query(
        `
        UPDATE emergency_requests

        SET

          status=$1,

          resolved_at=
            CASE
              WHEN $1='RESOLVED'
              THEN NOW()
              ELSE resolved_at
            END,

          updated_at=NOW()

        WHERE id=$2
          AND hospital_id=$3

        RETURNING *
        `,
        [
          status,
          req.params.emergencyId,
          req.hospital.id
        ]
      );


    if (!result.rows.length) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Emergency not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   PATIENT MANAGEMENT
========================================================= */

app.get(
  "/api/hospital/patients",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "patients"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          p.*,
          ph.last_seen_at

        FROM patients p

        JOIN patient_hospital_links ph
          ON ph.patient_id=p.id

        WHERE ph.hospital_id=$1
          AND ph.is_active=TRUE

        ORDER BY p.id DESC

        LIMIT $2
        `,
        [
          req.hospital.id,
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.get(
  "/api/hospital/patients/:patientId",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "patients"
  ),
  async (
    req,
    res
  ) => {

    const patientResult =
      await pool.query(
        `
        SELECT
          p.*

        FROM patients p

        JOIN patient_hospital_links ph
          ON ph.patient_id=p.id

        WHERE p.id=$1
          AND ph.hospital_id=$2
        `,
        [
          req.params.patientId,
          req.hospital.id
        ]
      );


    if (
      !patientResult.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Patient not found"
        });
    }


    const patient =
      patientResult.rows[0];


    const [
      tokens,
      appointments,
      emergencies,
      care,
      payments
    ] =
      await Promise.all([

        pool.query(
          `
          SELECT *
          FROM token_queue

          WHERE hospital_id=$1
            AND patient_id=$2

          ORDER BY id DESC
          `,
          [
            req.hospital.id,
            req.params.patientId
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM appointments

          WHERE hospital_id=$1
            AND phone=$2

          ORDER BY id DESC
          `,
          [
            req.hospital.id,
            patient.phone
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM emergency_requests

          WHERE hospital_id=$1

            AND
            (
              phone=$2
              OR patient_phone=$2
            )

          ORDER BY id DESC
          `,
          [
            req.hospital.id,
            patient.phone
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM care_records

          WHERE hospital_id=$1
            AND patient_id=$2

          ORDER BY id DESC
          `,
          [
            req.hospital.id,
            req.params.patientId
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM payments

          WHERE hospital_id=$1
            AND patient_id=$2

          ORDER BY id DESC
          `,
          [
            req.hospital.id,
            req.params.patientId
          ]
        )

      ]);


    res.json({

      success: true,

      data: {

        patient,

        tokenHistory:
          tokens.rows,

        appointmentHistory:
          appointments.rows,

        emergencyHistory:
          emergencies.rows,

        careHistory:
          care.rows,

        paymentHistory:
          payments.rows
      }
    });
  }
);


/* =========================================================
   SERVICES
========================================================= */

app.get(
  "/api/hospital/services",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT *
        FROM hospital_services

        WHERE hospital_id=$1

        ORDER BY id DESC
        `,
        [
          req.hospital.id
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/hospital/services",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "settings"
  ),
  async (
    req,
    res
  ) => {

    const {
      service_name,
      description,
      price
    } =
      req.body || {};


    if (
      !service_name
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "service_name is required"
        });
    }


    const result =
      await pool.query(
        `
        INSERT INTO hospital_services
        (
          hospital_id,
          service_name,
          description,
          price
        )

        VALUES
        (
          $1,$2,$3,$4
        )

        RETURNING *
        `,
        [
          req.hospital.id,
          service_name,
          description ||
            null,
          Number(
            price || 0
          )
        ]
      );


    res
      .status(201)
      .json({
        success: true,
        data:
          result.rows[0]
      });
  }
);


app.patch(
  "/api/hospital/services/:serviceId",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "settings"
  ),
  async (
    req,
    res
  ) => {

    const {
      is_active,
      price,
      service_name,
      description
    } =
      req.body || {};


    const result =
      await pool.query(
        `
        UPDATE hospital_services

        SET

          service_name=
            COALESCE(
              $1,
              service_name
            ),

          description=
            COALESCE(
              $2,
              description
            ),

          price=
            COALESCE(
              $3,
              price
            ),

          is_active=
            COALESCE(
              $4,
              is_active
            ),

          updated_at=NOW()

        WHERE id=$5
          AND hospital_id=$6

        RETURNING *
        `,
        [
          service_name ??
            null,

          description ??
            null,

          price === undefined
            ? null
            : Number(price),

          is_active === undefined
            ? null
            : toBool(
                is_active
              ),

          req.params.serviceId,

          req.hospital.id
        ]
      );


    if (!result.rows.length) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Service not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   PAYMENTS
========================================================= */

app.get(
  "/api/hospital/payments",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "payments"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          p.*,
          s.service_name

        FROM payments p

        LEFT JOIN hospital_services s
          ON s.id=p.service_id

        WHERE p.hospital_id=$1

        ORDER BY p.id DESC

        LIMIT $2
        `,
        [
          req.hospital.id,
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/hospital/payments",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "payments"
  ),
  async (
    req,
    res
  ) => {

    const b =
      req.body || {};


    if (
      b.amount === undefined
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "amount is required"
        });
    }


    const result =
      await pool.query(
        `
        INSERT INTO payments
        (
          hospital_id,
          patient_id,
          phone,
          service_id,
          appointment_id,
          token_id,
          amount,
          paid_amount,
          status,
          transaction_reference,
          receipt_number
        )

        VALUES
        (
          $1,$2,$3,$4,$5,$6,
          $7,$8,$9,$10,$11
        )

        RETURNING *
        `,
        [
          req.hospital.id,

          b.patient_id ||
            null,

          b.phone ||
            null,

          b.service_id ||
            null,

          b.appointment_id ||
            null,

          b.token_id ||
            null,

          Number(
            b.amount
          ),

          Number(
            b.paid_amount ||
            0
          ),

          b.status ||
            "PENDING",

          b.transaction_reference ||
            null,

          b.receipt_number ||
            `RCPT-${Date.now()}`
        ]
      );


    res
      .status(201)
      .json({
        success: true,
        data:
          result.rows[0]
      });
  }
);


/* =========================================================
   CARE MANAGEMENT
========================================================= */

app.get(
  "/api/hospital/care",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "care"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          c.*,
          d.doctor_name

        FROM care_records c

        LEFT JOIN doctors d
          ON d.id=c.doctor_id

        WHERE c.hospital_id=$1

        ORDER BY c.id DESC

        LIMIT $2
        `,
        [
          req.hospital.id,
          safeLimit(
            req.query.limit
          )
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/hospital/care",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "care"
  ),
  async (
    req,
    res
  ) => {

    const b =
      req.body || {};


    if (
      !b.patient_id
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "patient_id is required"
        });
    }


    const result =
      await pool.query(
        `
        INSERT INTO care_records
        (
          hospital_id,
          patient_id,
          doctor_id,
          medicine_name,
          medicine_schedule,
          follow_up_date,
          tests,
          instructions
        )

        VALUES
        (
          $1,$2,$3,$4,
          $5,$6,$7,$8
        )

        RETURNING *
        `,
        [
          req.hospital.id,

          b.patient_id,

          b.doctor_id ||
            null,

          b.medicine_name ||
            null,

          b.medicine_schedule ||
            null,

          b.follow_up_date ||
            null,

          b.tests ||
            null,

          b.instructions ||
            null
        ]
      );


    res
      .status(201)
      .json({
        success: true,
        data:
          result.rows[0]
      });
  }
);


/* =========================================================
   REMINDERS
========================================================= */

app.post(
  "/api/hospital/reminders",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "care"
  ),
  async (
    req,
    res
  ) => {

    const b =
      req.body || {};


    if (
      !b.patient_phone ||
      !b.title ||
      !b.remind_at
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "patient_phone, title and remind_at are required"
        });
    }


    const result =
      await pool.query(
        `
        INSERT INTO patient_reminders
        (
          hospital_id,
          patient_id,
          patient_phone,
          reminder_type,
          title,
          message,
          remind_at
        )

        VALUES
        (
          $1,$2,$3,$4,
          $5,$6,$7
        )

        RETURNING *
        `,
        [
          req.hospital.id,

          b.patient_id ||
            null,

          b.patient_phone,

          b.reminder_type ||
            "GENERAL",

          b.title,

          b.message ||
            null,

          b.remind_at
        ]
      );


    res
      .status(201)
      .json({
        success: true,
        data:
          result.rows[0]
      });
  }
);


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

app.get(
  "/api/hospital/announcements",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT *
        FROM announcements

        WHERE hospital_id=$1

        ORDER BY id DESC
        `,
        [
          req.hospital.id
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


app.post(
  "/api/hospital/announcements",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "settings"
  ),
  async (
    req,
    res
  ) => {

    const b =
      req.body || {};


    if (
      !b.title ||
      !b.message
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "title and message are required"
        });
    }


    const result =
      await pool.query(
        `
        INSERT INTO announcements
        (
          hospital_id,
          title,
          message,
          category,
          start_at,
          end_at,
          is_active
        )

        VALUES
        (
          $1,$2,$3,$4,
          $5,$6,$7
        )

        RETURNING *
        `,
        [
          req.hospital.id,

          b.title,

          b.message,

          b.category ||
            "GENERAL",

          b.start_at ||
            null,

          b.end_at ||
            null,

          toBool(
            b.is_active,
            true
          )
        ]
      );


    res
      .status(201)
      .json({
        success: true,
        data:
          result.rows[0]
      });
  }
);


app.patch(
  "/api/hospital/announcements/:id",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  permissionMiddleware(
    "settings"
  ),
  async (
    req,
    res
  ) => {

    const b =
      req.body || {};


    const result =
      await pool.query(
        `
        UPDATE announcements

        SET

          title=
            COALESCE(
              $1,
              title
            ),

          message=
            COALESCE(
              $2,
              message
            ),

          category=
            COALESCE(
              $3,
              category
            ),

          start_at=
            COALESCE(
              $4,
              start_at
            ),

          end_at=
            COALESCE(
              $5,
              end_at
            ),

          is_active=
            COALESCE(
              $6,
              is_active
            ),

          updated_at=NOW()

        WHERE id=$7
          AND hospital_id=$8

        RETURNING *
        `,
        [
          b.title ??
            null,

          b.message ??
            null,

          b.category ??
            null,

          b.start_at ??
            null,

          b.end_at ??
            null,

          b.is_active ===
          undefined
            ? null
            : toBool(
                b.is_active
              ),

          req.params.id,

          req.hospital.id
        ]
      );


    if (
      !result.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Announcement not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   DOCTOR AUTHENTICATION
========================================================= */

async function getAuthDoctor(
  req
) {

  const raw =
    parseBearer(req);

  if (!raw) {
    return null;
  }


  const tokenHash =
    crypto
      .createHash("sha256")
      .update(raw)
      .digest("hex");


  const result =
    await pool.query(
      `
      SELECT
        d.*,
        da.email,
        da.is_active
        account_active

      FROM doctor_sessions ds

      JOIN doctor_accounts da
        ON da.doctor_id =
           ds.doctor_id

      JOIN doctors d
        ON d.id =
           da.doctor_id

      WHERE ds.token_hash=$1
        AND ds.expires_at>NOW()
        AND da.is_active=TRUE
        AND d.is_active=TRUE

      LIMIT 1
      `,
      [
        tokenHash
      ]
    );


  if (!result.rows.length) {
    return null;
  }


  await pool.query(
    `
    UPDATE doctor_sessions

    SET
      last_used_at=NOW()

    WHERE token_hash=$1
    `,
    [
      tokenHash
    ]
  );


  return result.rows[0];
}


async function requireDoctorAuth(
  req,
  res,
  next
) {

  const doctor =
    await getAuthDoctor(req);


  if (!doctor) {

    return res
      .status(401)
      .json({
        success: false,
        message:
          "Unauthorized"
      });
  }


  req.doctor =
    doctor;

  next();
}


/* =========================================================
   CREATE DOCTOR ACCOUNT
========================================================= */

app.post(
  "/api/hospital/doctors/:doctorId/account",

  requireAuth,

  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),

  ensureScopedHospital,

  permissionMiddleware(
    "doctors"
  ),

  async (
    req,
    res
  ) => {

    try {

      const doctor =
        await pool.query(
          `
          SELECT *
          FROM doctors

          WHERE id=$1
            AND hospital_id=$2
          `,
          [
            req.params.doctorId,
            req.hospital.id
          ]
        );


      if (
        !doctor.rows.length
      ) {

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Doctor not found"
          });
      }


      const {
        email,
        password
      } =
        req.body || {};


      if (
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              "email and password are required"
          });
      }


      const result =
        await pool.query(
          `
          INSERT INTO doctor_accounts
          (
            doctor_id,
            email,
            password_hash
          )

          VALUES
          (
            $1,$2,$3
          )

          ON CONFLICT
          (doctor_id)

          DO UPDATE SET

            email=
              EXCLUDED.email,

            password_hash=
              EXCLUDED.password_hash,

            is_active=TRUE,

            updated_at=NOW()

          RETURNING
            id,
            doctor_id,
            email,
            is_active
          `,
          [
            req.params.doctorId,

            email,

            hashPassword(
              password
            )
          ]
        );


      res
        .status(201)
        .json({
          success: true,
          data:
            result.rows[0]
        });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Doctor account creation failed"
        });
    }
  }
);


/* =========================================================
   DOCTOR LOGIN
========================================================= */

app.post(
  "/api/doctor/auth/login",
  async (
    req,
    res
  ) => {

    try {

      const {
        email,
        password
      } =
        req.body || {};


      const result =
        await pool.query(
          `
          SELECT *
          FROM doctor_accounts

          WHERE LOWER(email)
                = LOWER($1)

            AND is_active=TRUE

          LIMIT 1
          `,
          [
            email
          ]
        );


      const account =
        result.rows[0];


      if (
        !account ||
        !verifyPassword(
          password,
          account.password_hash
        )
      ) {

        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid credentials"
          });
      }


      const raw =
        makeSessionToken();


      const hash =
        crypto
          .createHash("sha256")
          .update(raw)
          .digest("hex");


      await pool.query(
        `
        INSERT INTO doctor_sessions
        (
          doctor_id,
          token_hash,
          expires_at
        )

        VALUES
        (
          $1,
          $2,
          NOW() + INTERVAL '7 days'
        )
        `,
        [
          account.doctor_id,
          hash
        ]
      );


      const doctor =
        await pool.query(
          `
          SELECT
            d.*,
            h.hospital_name

          FROM doctors d

          JOIN hospitals h
            ON h.id=d.hospital_id

          WHERE d.id=$1
          `,
          [
            account.doctor_id
          ]
        );


      res.json({

        success: true,

        token: raw,

        user:
          doctor.rows[0]
      });

    } catch (error) {

      console.error(error);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Doctor login failed"
        });
    }
  }
);


/* =========================================================
   DOCTOR LOGOUT
========================================================= */

app.post(
  "/api/doctor/auth/logout",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    const raw =
      parseBearer(req);


    const hash =
      crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex");


    await pool.query(
      `
      DELETE FROM doctor_sessions

      WHERE token_hash=$1
      `,
      [
        hash
      ]
    );


    res.json({
      success: true
    });
  }
);


/* =========================================================
   DOCTOR PROFILE
========================================================= */

app.get(
  "/api/doctor/me",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    res.json({
      success: true,
      user:
        req.doctor
    });
  }
);


/* =========================================================
   DOCTOR DASHBOARD
========================================================= */

app.get(
  "/api/doctor/me/dashboard",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    const today =
      getTodayDate();


    const [
      tokens,
      appointments,
      emergencies
    ] =
      await Promise.all([

        pool.query(
          `
          SELECT *
          FROM token_queue

          WHERE doctor_id=$1
            AND token_date=$2

          ORDER BY token_number
          `,
          [
            req.doctor.id,
            today
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM appointments

          WHERE doctor_id=$1
            AND appointment_date=$2

          ORDER BY slot
          `,
          [
            req.doctor.id,
            today
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM emergency_requests

          WHERE assigned_doctor_id=$1

            AND status IN
            (
              'OPEN',
              'PENDING',
              'ACCEPTED',
              'IN_PROGRESS'
            )

          ORDER BY id DESC
          `,
          [
            req.doctor.id
          ]
        )

      ]);


    res.json({

      success: true,

      data: {

        doctor:
          req.doctor,

        tokens:
          tokens.rows,

        appointments:
          appointments.rows,

        emergencies:
          emergencies.rows
      }
    });
  }
);


/* =========================================================
   DOCTOR TOKEN CONTROLS
========================================================= */

app.post(
  "/api/doctor/me/tokens/:tokenId/call",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        UPDATE token_queue

        SET

          status='CALLED',

          called_at=
            COALESCE(
              called_at,
              NOW()
            ),

          updated_at=NOW()

        WHERE id=$1
          AND doctor_id=$2

        RETURNING *
        `,
        [
          req.params.tokenId,
          req.doctor.id
        ]
      );


    if (
      !result.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Token not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


app.post(
  "/api/doctor/me/tokens/:tokenId/complete",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        UPDATE token_queue

        SET

          status='COMPLETED',

          completed_at=NOW(),

          updated_at=NOW()

        WHERE id=$1
          AND doctor_id=$2

        RETURNING *
        `,
        [
          req.params.tokenId,
          req.doctor.id
        ]
      );


    if (
      !result.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Token not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


app.post(
  "/api/doctor/me/tokens/:tokenId/hold",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        UPDATE token_queue

        SET
          status='WAITING',
          updated_at=NOW()

        WHERE id=$1
          AND doctor_id=$2
          AND status='CALLED'

        RETURNING *
        `,
        [
          req.params.tokenId,
          req.doctor.id
        ]
      );


    if (
      !result.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Called token not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


app.post(
  "/api/doctor/me/tokens/:tokenId/skip",
  requireDoctorAuth,
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        UPDATE token_queue

        SET

          status='CANCELLED',

          cancelled_at=NOW(),

          updated_at=NOW()

        WHERE id=$1
          AND doctor_id=$2

        RETURNING *
        `,
        [
          req.params.tokenId,
          req.doctor.id
        ]
      );


    if (
      !result.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Token not found"
        });
    }


    res.json({
      success: true,
      data:
        result.rows[0]
    });
  }
);


/* =========================================================
   DOCTOR PANEL
========================================================= */

app.get(
  "/api/doctor/dashboard/:doctorId",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  async (
    req,
    res
  ) => {

    const doctorId =
      req.params.doctorId;


    const doctor =
      await pool.query(
        `
        SELECT
          d.*,
          h.hospital_name

        FROM doctors d

        JOIN hospitals h
          ON h.id=d.hospital_id

        WHERE d.id=$1
        `,
        [
          doctorId
        ]
      );


    if (
      !doctor.rows.length
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Doctor not found"
        });
    }


    if (
      req.auth.role !==
        "SUPER_ADMIN" &&

      Number(
        doctor.rows[0].hospital_id
      ) !==
      Number(
        req.auth.hospital_id
      )
    ) {

      return res
        .status(403)
        .json({
          success: false,
          message:
            "Access denied"
        });
    }


    const today =
      getTodayDate();


    const [
      tokens,
      appointments,
      emergencies
    ] =
      await Promise.all([

        pool.query(
          `
          SELECT *
          FROM token_queue

          WHERE doctor_id=$1
            AND token_date=$2

          ORDER BY token_number
          `,
          [
            doctorId,
            today
          ]
        ),

        pool.query(
          `
          SELECT *
          FROM appointments

          WHERE doctor_id=$1
            AND appointment_date=$2

          ORDER BY slot
          `,
          [
            doctorId,
            today
          ]
        ),

        pool.query(
          `
          SELECT
            e.*,
            d.doctor_name

          FROM emergency_requests e

          LEFT JOIN doctors d
            ON d.id=e.assigned_doctor_id

          WHERE e.assigned_doctor_id=$1

            AND e.status IN
            (
              'OPEN',
              'PENDING',
              'ACCEPTED',
              'IN_PROGRESS'
            )

          ORDER BY e.id DESC
          `,
          [
            doctorId
          ]
        )

      ]);


    res.json({

      success: true,

      data: {

        doctor:
          doctor.rows[0],

        tokens:
          tokens.rows,

        appointments:
          appointments.rows,

        emergencies:
          emergencies.rows
      }
    });
  }
);


app.get(
  "/api/doctor/:doctorId/queue",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  async (
    req,
    res
  ) => {

    const date =
      req.query.date ||
      getTodayDate();


    const result =
      await pool.query(
        `
        SELECT
          tq.*,
          d.doctor_name

        FROM token_queue tq

        JOIN doctors d
          ON d.id=tq.doctor_id

        WHERE tq.doctor_id=$1
          AND tq.token_date=$2

        ORDER BY tq.token_number
        `,
        [
          req.params.doctorId,
          date
        ]
      );


    res.json({
      success: true,
      data:
        result.rows
    });
  }
);


/* =========================================================
   REPORTS
========================================================= */

app.get(
  "/api/hospital/reports/summary",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  ensureScopedHospital,
  async (
    req,
    res
  ) => {

    const from =
      req.query.from ||
      getTodayDate();

    const to =
      req.query.to ||
      getTodayDate();


    const q =
      async (
        sql,
        params
      ) =>
        Number(
          (
            await pool.query(
              sql,
              params
            )
          )
            .rows[0]
            ?.count || 0
        );


    const [
      tokens,
      appointments,
      completed,
      emergencies
    ] =
      await Promise.all([

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM token_queue

          WHERE hospital_id=$1
            AND token_date
            BETWEEN $2 AND $3
          `,
          [
            req.hospital.id,
            from,
            to
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM appointments

          WHERE hospital_id=$1
            AND appointment_date
            BETWEEN $2 AND $3
          `,
          [
            req.hospital.id,
            from,
            to
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM token_queue

          WHERE hospital_id=$1
            AND token_date
            BETWEEN $2 AND $3

            AND status='COMPLETED'
          `,
          [
            req.hospital.id,
            from,
            to
          ]
        ),

        q(
          `
          SELECT
            COUNT(*)::int count

          FROM emergency_requests

          WHERE hospital_id=$1
            AND created_at::date
            BETWEEN $2 AND $3
          `,
          [
            req.hospital.id,
            from,
            to
          ]
        )

      ]);


    const revenue =
      (
        await pool.query(
          `
          SELECT
            COALESCE(
              SUM(paid_amount),
              0
            )::numeric revenue

          FROM payments

          WHERE hospital_id=$1

            AND created_at::date
            BETWEEN $2 AND $3
          `,
          [
            req.hospital.id,
            from,
            to
          ]
        )
      )
        .rows[0]
        .revenue;


    res.json({

      success: true,

      data: {

        from,

        to,

        tokens,

        appointments,

        completedTokens:
          completed,

        emergencies,

        revenue
      }
    });
  }
);


/* =========================================================
   SUPER ADMIN GLOBAL SETTINGS
========================================================= */

app.get(
  "/api/super-admin/settings",
  requireAuth,
  requireRole(
    "SUPER_ADMIN"
  ),
  async (
    req,
    res
  ) => {

    const result =
      await pool.query(
        `
        SELECT *
        FROM smartclinic_plans
        ORDER BY id
        `
      );


    res.json({

      success: true,

      data: {

        plans:
          result.rows,

        platform: {

          graph_version:
            GRAPH_VERSION,

          port:
            PORT
        }
      }
    });
  }
);


/* =========================================================
   END SMARTCLINIC AI V2
========================================================= */


/* =========================================================
   WHATSAPP WEBHOOK VERIFICATION
========================================================= */

app.get(
  "/webhook",
  (
    req,
    res
  ) => {

    const mode =
      req.query[
        "hub.mode"
      ];

    const token =
      req.query[
        "hub.verify_token"
      ];

    const challenge =
      req.query[
        "hub.challenge"
      ];


    if (
      mode === "subscribe" &&
      token === VERIFY_TOKEN
    ) {

      console.log(
        "✅ WhatsApp webhook verified"
      );


      return res
        .status(200)
        .send(
          challenge
        );
    }


    return res
      .sendStatus(403);
  }
);


/* =========================================================
   WHATSAPP WEBHOOK RECEIVER
========================================================= */

app.post(
  "/webhook",
  async (
    req,
    res
  ) => {

    try {

      const body =
        req.body;


      if (
        body?.object !==
        "whatsapp_business_account"
      ) {

        return res
          .sendStatus(404);
      }


      const entries =
        body.entry || [];


      for (
        const entry
        of entries
      ) {

        const changes =
          entry.changes || [];


        for (
          const change
          of changes
        ) {

          const value =
            change.value;


          const phoneNumberId =
            value
              ?.metadata
              ?.phone_number_id;


          const messages =
            value
              ?.messages || [];


          if (
            !phoneNumberId
          ) {
            continue;
          }


          for (
            const message
            of messages
          ) {

            if (
              !message.from
            ) {
              continue;
            }


            /*
             * Meta ko immediately 200.
             * Processing background mein.
             */

            handleIncomingMessage(
              message.from,
              message,
              phoneNumberId
            )
              .catch(
                error => {

                  console.error(
                    "Background message error:",
                    error
                  );
                }
              );
          }
        }
      }


      return res
        .sendStatus(200);

    } catch (error) {

      console.error(
        "Webhook error:",
        error
      );


      return res
        .sendStatus(500);
    }
  }
);


/* =========================================================
   ROOT
========================================================= */

app.get(
  "/",
  (
    req,
    res
  ) => {

    res
      .status(200)
      .json({

        success: true,

        service:
          "SmartClinic AI",

        status:
          "running",

        timestamp:
          new Date()
            .toISOString()
      });
  }
);


/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/health",
  async (
    req,
    res
  ) => {

    try {

      await pool.query(
        "SELECT 1"
      );


      return res
        .status(200)
        .json({

          success: true,

          server:
            "healthy",

          database:
            "connected"
        });

    } catch (error) {

      console.error(
        "Health check failed:",
        error
      );


      return res
        .status(503)
        .json({

          success: false,

          server:
            "healthy",

          database:
            "disconnected"
        });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

  try {

    console.log(
      "================================================="
    );

    console.log(
      "🏥 SMARTCLINIC AI"
    );

    console.log(
      "================================================="
    );

    console.log(
      "🔄 Initializing SmartClinic database..."
    );

    await initSmartClinicSchema();

    await initSmartClinicV2();

    await verifySmartClinicDatabaseFoundation();

    console.log(
      "✅ SmartClinic database initialized successfully"
    );

    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          "================================================="
        );

        console.log(
          "🚀 SMARTCLINIC AI SERVER RUNNING"
        );

        console.log(
          `🚀 Port: ${PORT}`
        );

        console.log(
          "🏥 Multi-Hospital Architecture: ACTIVE"
        );

        console.log(
          "👑 Super Admin: ACTIVE"
        );

        console.log(
          "🏥 Hospital Admin: ACTIVE"
        );

        console.log(
          "👨‍⚕️ Doctor Panel: ACTIVE"
        );

        console.log(
          "👤 Patient / WhatsApp: ACTIVE"
        );

        console.log(
          "🎟️ Doctor-specific Tokens: ACTIVE"
        );

        console.log(
          "📅 Appointments: ACTIVE"
        );

        console.log(
          "🚨 Emergency: ACTIVE"
        );

        console.log(
          "💳 Payments: ACTIVE"
        );

        console.log(
          "💊 Care: ACTIVE"
        );

        console.log(
          "🔔 Notifications: ACTIVE"
        );

        console.log(
          "📢 Announcements: ACTIVE"
        );

        console.log(
          "📊 Reports: ACTIVE"
        );

        console.log(
          "📜 Logs: ACTIVE"
        );

        console.log(
          "📱 WhatsApp Webhook: READY"
        );

        console.log(
          "================================================="
        );

      }
    );

  } catch (error) {

    console.error(
      "================================================="
    );

    console.error(
      "❌ SMARTCLINIC AI SERVER STARTUP FAILED"
    );

    console.error(
      "================================================="
    );

    console.error(
      error?.message ||
      error
    );

    console.error(
      error?.stack ||
      ""
    );

    process.exit(1);

  }

}


/* =========================================================
   START SMARTCLINIC AI
========================================================= */

startServer();