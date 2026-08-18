
const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
/* =========================================================
SMARTCLINIC AI — CLEAN SERVER
CURRENT SCOPE:
- WhatsApp bot
- Multi-hospital connection mapping
- Patient registration
- Appointment booking
- Token booking + queue status
- Doctor timing
- Emergency request
- Hindi / English
- Future SmartClinic upgrade foundation
NOT INCLUDED YET:
- Admin dashboards
- Patient Dashboard UI
- Medicine reminders
- Real payment gateway
- Service ON/OFF controls
========================================================= */
/* =========================================================
RUNTIME CONFIG
No dotenv.
No .env file.
========================================================= */
const PORT = 10000;
const VERIFY_TOKEN =
"smartclinic_verify_2026";
const GRAPH_VERSION =
"v23.0";
const DB_CONFIG = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
};
const pool =
  new Pool(DB_CONFIG);
/* =========================================================
TEXTS
========================================================= */
const TEXTS = {
/* =======================================================
ENGLISH
======================================================= */
en: {
askName:
"Great! What is your *full name*?",
invalidName:
"Please enter a valid name using letters only.",
registrationDone:
(name) =>
`Thank you, *${name}*!\n\n` +
`Your registration is complete ■`,
mainMenuHeader:
(name) =>
`Hi *${name}* ■\n\n` +
`How can we help you today?`,
mainMenuButton:
"■ Open Menu",
/* =====================================================
MAIN SERVICES
===================================================== */
book:
"■ Book Appointment",
timing:
"■■■■ Doctor Timings",
emergency:
"■ Emergency",
tokenMenu:
"■■ Token Services",
language:
"■ Change Language",
details:
"■ My Details",
/* =====================================================
TOKEN
===================================================== */
bookToken:
"■■ Book Token",
tokenStatus:
"■ Token / Queue Status",
/* =====================================================
APPOINTMENT
===================================================== */
chooseDoctor:
"■■■■ Please select a doctor:",
chooseTokenDoctor:
"■■■■ Please select a doctor for your token:",
chooseDate:
"■ Please choose a date for your appointment:",
chooseSlot:
"■ Choose an available time slot:",
noSlots:
"Sorry, no slots are available for this date.",
confirmAppointment:
(doctor, date, slot) =>
`Please confirm your appointment:\n\n` +
`■■■■ Doctor: *${doctor}*\n` +
`■ Date: *${date}*\n` +
`■ Slot: *${slot}*`,
confirmYes:
"■ Confirm",
confirmNo:
"■ Cancel",
appointmentBooked:
(token, doctor, date, slot) =>
`■ *Appointment booked successfully!*\n\n` +
`■■■■ Doctor: *${doctor}*\n` +
`■■ Token Number: *${token}*\n` +
`■ Date: *${date}*\n` +
`■ Slot: *${slot}*\n\n` +
`Please arrive a few minutes before your appointment. ■`,
appointmentCancelled:
"■ Your appointment request was cancelled.",
/* =====================================================
TOKEN BOOKING
===================================================== */
tokenBooked:
(token, doctor) =>
`■■ *Token booked successfully!*\n\n` +
`■■■■ Doctor: *${doctor}*\n` +
`■■ Your Token: *${token}*\n\n` +
`You can check your queue status anytime.`,
noActiveToken:
"■■ You do not have any active token for today.",
tokenStatusMessage:
(
token,
activeToken,
patientsAhead,
waitMinutes,
estimatedTime
) =>
`■■ *Token Status*\n\n` +
`■ Your Token: *${token}*\n` +
`■ Active Token: *${activeToken || "Not started"}*\n` +
`■ Patients Ahead: *${patientsAhead}*\n` +
`■■ Estimated Waiting Time: *${waitMinutes} minutes*\n` +
`■ Estimated Turn: *${estimatedTime}*`,
/* =====================================================
DOCTOR
===================================================== */
doctorNotAvailable:
"Sorry, no doctor is currently available.",
doctorTiming:
"■■■■ Doctor timings are managed by the hospital.",
/* =====================================================
EMERGENCY
===================================================== */
emergencyAsk:
"■ Do you want to make an Emergency Booking?",
emergencyYes:
"■ YES",
emergencyNo:
"■ NO",
emergencyName:
"Please send the patient's *full name*.",
emergencyPhone:
"Please send the patient's *10-digit phone number*.",
emergencyDetails:
"Please provide the emergency details.\n\n" +
"This is optional. Type *skip* if you do not want to provide details.",
emergencyRecorded:
"■ Your emergency request has been recorded. " +
"Please contact the nearest emergency medical service immediately.",
/* =====================================================
MY DETAILS
===================================================== */
myDetails:
(name, phone, lang) =>
`■ *Your Details*\n\n` +
`Name: ${name}\n` +
`Phone: ${phone}\n` +
`Language: ${lang === "hi" ? "Hindi" : "English"}`,
/* =====================================================
GENERAL
===================================================== */
languageChanged:
"■ Language changed successfully.",
invalidInput:
"■■ Sorry, I didn't understand that.\n\n" +
"Please choose one of the available options.",
languageMenu:
"■ Select Language / ■■■■ ■■■■■",
english:
"■■ English",
hindi:
"■■ ■■■■■"
},
/* =======================================================
HINDI
======================================================= */
hi: {
askName:
"■■■■ ■■■■■■! ■■■■■ ■■■■ *■■■■ ■■■* ■■■■■■",
invalidName:
"■■■■■ ■■■ ■■■ ■■■■ ■■■■■",
registrationDone:
(name) =>
`■■■■■■■, *${name}*!\n\n` +
`■■■■ ■■■■■■■■■■■ ■■■■ ■■ ■■■ ■■ ■`,
mainMenuHeader:
(name) =>
`■■■■■■ *${name}* ■\n\n` +
`■■ ■■ ■■■■ ■■■■ ■■■ ■■ ■■■■ ■■■?`,
mainMenuButton:
"■ ■■■■■ ■■■■",
/* =====================================================
MAIN SERVICES
===================================================== */
book:
"■ ■■■■■■■■■■ ■■■ ■■■■",
timing:
"■■■■ ■■■■■■ ■■ ■■■",
emergency:
"■ ■■■■■■■■",
tokenMenu:
"■■ ■■■■ ■■■■",
language:
"■ ■■■■ ■■■■■",
details:
"■ ■■■■ ■■■■■■■",
/* =====================================================
TOKEN
===================================================== */
bookToken:
"■■ ■■■■ ■■■ ■■■■",
tokenStatus:
"■ ■■■■ / ■■■■ ■■■■■■",
/* =====================================================
APPOINTMENT
===================================================== */
chooseDoctor:
"■■■■ ■■■■■ ■■■■■■ ■■■■■:",
chooseTokenDoctor:
"■■■■ ■■■■■ ■■■■ ■■ ■■■ ■■■■■■ ■■■■■:",
chooseDate:
"■ ■■■■■ ■■■■■■■■■■ ■■ ■■■ ■■■■■ ■■■■■:",
chooseSlot:
"■ ■■■■■ ■■■■■■ ■■■ ■■■■■:",
noSlots:
"■■■■■ ■■■■, ■■ ■■■■■ ■■ ■■■ ■■■ ■■■■■ ■■■■■■ ■■■■ ■■■",
confirmAppointment:
(doctor, date, slot) =>
`■■■■■ ■■■■ ■■■■■■■■■■ ■■■■■■■ ■■■■:\n\n` +
`■■■■ ■■■■■■: *${doctor}*\n` +
`■ ■■■■■: *${date}*\n` +
`■ ■■■: *${slot}*`,
confirmYes:
"■ ■■■■■■■",
confirmNo:
"■ ■■■■■",
appointmentBooked:
(token, doctor, date, slot) =>
`■ *■■■■■■■■■■ ■■■■■■■■■■■ ■■■ ■■ ■■■!*\n\n` +
`■■■■ ■■■■■■: *${doctor}*\n` +
`■■ ■■■■ ■■■■: *${token}*\n` +
`■ ■■■■■: *${date}*\n` +
`■ ■■■: *${slot}*\n\n` +
`■■■■■ ■■■■■■■■■■ ■■ ■■■ ■■■■ ■■■■ ■■■■■■■■ ■`,
appointmentCancelled:
"■ ■■■■ ■■■■■■■■■■ ■■■■■ ■■ ■■■■ ■■■ ■■■",
/* =====================================================
TOKEN BOOKING
===================================================== */
tokenBooked:
(token, doctor) =>
`■■ *■■■■ ■■■■■■■■■■■ ■■■ ■■ ■■■!*\n\n` +
`■■■■ ■■■■■■: *${doctor}*\n` +
`■■ ■■■■ ■■■■: *${token}*\n\n` +
`■■ ■■■ ■■ ■■■■ ■■■■ ■■■■■■ ■■■ ■■■■ ■■■■`,
noActiveToken:
"■■ ■■ ■■ ■■■ ■■■■ ■■■ ■■■■■■ ■■■■ ■■■■ ■■■",
tokenStatusMessage:
(
token,
activeToken,
patientsAhead,
waitMinutes,
estimatedTime
) =>
`■■ *■■■■ ■■■■■■*\n\n` +
`■ ■■■■ ■■■■: *${token}*\n` +
`■ ■■■■■■ ■■■■: *${activeToken || "■■■■ ■■■■ ■■■"}*\n` +
`■ ■■■■ ■■■ ■■■■: *${patientsAhead}*\n` +
`■■ ■■■■■■■■ ■■■■■■■■■ ■■■: *${waitMinutes} ■■■■*\n` +
`■ ■■■■■■■■ ■■■■: *${estimatedTime}*`,
/* =====================================================
DOCTOR
===================================================== */
doctorNotAvailable:
"■■■■■ ■■■■, ■■■ ■■■ ■■■■■■ ■■■■■■ ■■■■ ■■■",
doctorTiming:
"■■■■ ■■■■■■ ■■ ■■■ ■■■■■■■ ■■■■■■ ■■■■■ ■■■■ ■■■■ ■■■",
/* =====================================================
EMERGENCY
===================================================== */
emergencyAsk:
"■ ■■■■ ■■ Emergency Booking ■■■■ ■■■■■ ■■■?",
emergencyYes:
"■ ■■■",
emergencyNo:
"■ ■■■■",
emergencyName:
"■■■■■ ■■■■ ■■ *■■■■ ■■■* ■■■■■■",
emergencyPhone:
"■■■■■ ■■■■ ■■ *10 ■■■■■ ■■ ■■■■■■ ■■■■* ■■■■■■",
emergencyDetails:
"■■■■■ Emergency ■■ ■■■■■■■ ■■■■■■\n\n" +
"■■ ■■■■■■■■ ■■■ ■■■■■■■ ■■■■ ■■■■ ■■■■■ ■■■ ■■ *skip* ■■■■■■",
emergencyRecorded:
"■ ■■■■ Emergency Request ■■■■■■■ ■■ ■■ ■■■ " +
"■■■■■ ■■■■■ ■■■■■■ Emergency Medical Service ■■ ■■■■■■ ■■■■■",
/* =====================================================
MY DETAILS
===================================================== */
myDetails:
(name, phone, lang) =>
`■ *■■■■ ■■■■■■■*\n\n` +
`■■■: ${name}\n` +
`■■■: ${phone}\n` +
`■■■■: ${lang === "hi" ? "■■■■■" : "English"}`,
/* =====================================================
GENERAL
===================================================== */
languageChanged:
"■ ■■■■ ■■■■■■■■■■■ ■■■ ■■ ■■ ■■■",
invalidInput:
"■■ ■■■ ■■■■■, ■■■ ■■■ ■■■ ■■■■ ■■■■■\n\n" +
"■■■■■ ■■■■■■ ■■■■■■■■ ■■■ ■■ ■■■■■■",
languageMenu:
"■ Select Language / ■■■■ ■■■■■",
english:
"■■ English",
hindi:
"■■ ■■■■■"
}
};
/* =========================================================
DATABASE INITIALIZATION
async function initDB() {

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

    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(30) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      language VARCHAR(5) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      phone VARCHAR(30) PRIMARY KEY,
      state VARCHAR(60) DEFAULT 'START',
      temp_data JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,
      doctor_name VARCHAR(200) NOT NULL,
      specialization VARCHAR(150),
      average_consultation_minutes INTEGER DEFAULT 5,
      is_on_duty BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
      appointment_enabled BOOLEAN DEFAULT TRUE,
      token_enabled BOOLEAN DEFAULT TRUE,
      emergency_enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (
        doctor_id,
        day_of_week
      )
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL
        REFERENCES doctors(id)
        ON DELETE CASCADE,
      phone VARCHAR(30) NOT NULL,
      patient_name VARCHAR(150) NOT NULL,
      appointment_date DATE NOT NULL,
      slot VARCHAR(50) NOT NULL,
      token_number INTEGER NOT NULL,
      status VARCHAR(30) DEFAULT 'BOOKED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (
        hospital_id,
        doctor_id,
        appointment_date,
        slot,
        token_number
      )
    );

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
      source VARCHAR(20) NOT NULL
        CHECK (
          source IN ('ONLINE', 'OFFLINE')
        ),
      status VARCHAR(30) DEFAULT 'WAITING'
        CHECK (
          status IN (
            'WAITING',
            'CALLED',
            'COMPLETED',
            'CANCELLED'
          )
        ),
      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      called_at TIMESTAMP,
      completed_at TIMESTAMP,
      cancelled_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (
        hospital_id,
        doctor_id,
        token_date,
        token_number
      )
    );

    CREATE INDEX IF NOT EXISTS
      idx_token_queue_doctor_date
    ON token_queue (
      hospital_id,
      doctor_id,
      token_date
    );

    CREATE INDEX IF NOT EXISTS
      idx_token_queue_patient
    ON token_queue (
      patient_phone,
      token_date
    );

    CREATE TABLE IF NOT EXISTS emergency_requests (
      id SERIAL PRIMARY KEY,
      hospital_id INTEGER
        REFERENCES hospitals(id)
        ON DELETE SET NULL,
      phone VARCHAR(30) NOT NULL,
      patient_name VARCHAR(150),
      patient_phone VARCHAR(30),
      message TEXT,
      status VARCHAR(30) DEFAULT 'OPEN',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS whatsapp_connections (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER UNIQUE NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      waba_id VARCHAR(150),

      phone_number_id VARCHAR(150)
        UNIQUE NOT NULL,

      business_phone_number VARCHAR(30),

      display_name VARCHAR(200),

      access_token TEXT NOT NULL,

      verify_token VARCHAR(200),

      graph_version VARCHAR(30)
        DEFAULT 'v23.0',

      is_connected BOOLEAN
        DEFAULT FALSE,

      is_active BOOLEAN
        DEFAULT TRUE,

      last_verified_at TIMESTAMP,

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS smartclinic_plans (
      id SERIAL PRIMARY KEY,

      plan_name VARCHAR(100)
        UNIQUE NOT NULL,

      price NUMERIC(10,2)
        DEFAULT 0,

      billing_cycle VARCHAR(30)
        DEFAULT 'MONTHLY',

      is_active BOOLEAN
        DEFAULT TRUE,

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hospital_subscriptions (
      id SERIAL PRIMARY KEY,

      hospital_id INTEGER UNIQUE NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

      plan_id INTEGER
        REFERENCES smartclinic_plans(id)
        ON DELETE SET NULL,

      status VARCHAR(30)
        DEFAULT 'FREE',

      starts_at TIMESTAMP,

      expires_at TIMESTAMP,

      payment_reference VARCHAR(200),

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );
  `);



  /*
   * SmartClinic plans
   */

  await pool.query(`
    INSERT INTO smartclinic_plans
    (
      plan_name,
      price,
      billing_cycle
    )
    VALUES
    (
      'FREE',
      0,
      'MONTHLY'
    )
    ON CONFLICT (
      plan_name
    )
    DO NOTHING;
  `);


  console.log(
    "■ SmartClinic database initialized"
  );


/* =========================================================
SESSION HELPERS
========================================================= */
async function getSession(phone) {
const result =
await pool.query(
`
SELECT
phone,
state,
temp_data
FROM sessions
WHERE phone = $1
`,
[phone]
);
if (!result.rows.length) {
return {
phone,
state: "START",
temp_data: {}
};
}
return result.rows[0];
}
async function setSession(
phone,
state,
tempData = {}
) {
await pool.query(
`
INSERT INTO sessions
(
phone,
state,
temp_data,
updated_at
)
VALUES
(
$1,
$2,
$3::jsonb,
CURRENT_TIMESTAMP
)
ON CONFLICT (phone)
DO UPDATE SET
state = EXCLUDED.state,
temp_data = EXCLUDED.temp_data,
updated_at = CURRENT_TIMESTAMP
`,
[
phone,
state,
JSON.stringify(tempData)
]
);
}
async function clearSession(
phone
) {
await pool.query(
`
DELETE FROM sessions
WHERE phone = $1
`,
[phone]
);
}
/* =========================================================
PATIENT HELPERS
========================================================= */
async function getPatient(
phone
) {
const result =
await pool.query(
`
SELECT
id,
phone,
name,
language,
created_at,
updated_at
FROM patients
WHERE phone = $1
`,
[phone]
);
return result.rows[0] || null;
}
async function createPatient(
phone,
name,
language = "en"
) {
const result =
await pool.query(
`
INSERT INTO patients
(
phone,
name,
language
)
VALUES
(
$1,
$2,
$3
)
ON CONFLICT (phone)
DO UPDATE SET
name = EXCLUDED.name,
language = EXCLUDED.language,
updated_at = CURRENT_TIMESTAMP
RETURNING
id,
phone,
name,
language
`,
[
phone,
name,
language
]
);
return result.rows[0];
}
async function updatePatientLanguage(
phone,
language
) {
await pool.query(
`
UPDATE patients
SET
language = $1,
updated_at = CURRENT_TIMESTAMP
WHERE phone = $2
`,
[
language,
phone
]
);
}
/* =========================================================
HOSPITAL / WHATSAPP HELPERS
========================================================= */
async function getHospitalByPhoneNumberId(
phoneNumberId
) {
const result =
await pool.query(
`
SELECT
h.id,
h.hospital_name,
h.hospital_code,
h.phone,
h.email,
h.address,
h.city,
h.state,
h.is_active,
w.phone_number_id,
w.business_phone_number,
w.display_name,
w.access_token,
w.verify_token,
w.graph_version,
w.is_connected,
w.is_active AS whatsapp_active
FROM hospitals h
INNER JOIN whatsapp_connections w
ON w.hospital_id = h.id
WHERE
w.phone_number_id = $1
AND h.is_active = TRUE
AND w.is_active = TRUE
LIMIT 1
`,
[phoneNumberId]
);
return result.rows[0] || null;
}
async function getDefaultHospital() {
const result =
await pool.query(
`
SELECT
h.id,
h.hospital_name,
h.hospital_code,
h.phone,
h.email,
h.address,
h.city,
h.state,
h.is_active,
w.phone_number_id,
w.business_phone_number,
w.display_name,
w.access_token,
w.verify_token,
w.graph_version,
w.is_connected,
w.is_active AS whatsapp_active
FROM hospitals h
INNER JOIN whatsapp_connections w
ON w.hospital_id = h.id
WHERE
h.is_active = TRUE
AND w.is_active = TRUE
ORDER BY h.id ASC
LIMIT 1
`
);
return result.rows[0] || null;
}
/* =========================================================
DOCTOR HELPERS
========================================================= */
async function getDoctors(
hospitalId
) {
const result =
await pool.query(
`
SELECT
id,
hospital_id,
doctor_name,
specialization,
average_consultation_minutes,
is_on_duty,
is_active
FROM doctors
WHERE
hospital_id = $1
AND is_active = TRUE
ORDER BY
doctor_name ASC
`,
[hospitalId]
);
return result.rows;
}
async function getDoctorById(
doctorId,
hospitalId
) {
const result =
await pool.query(
`
SELECT
id,
hospital_id,
doctor_name,
specialization,
average_consultation_minutes,
is_on_duty,
is_active
FROM doctors
WHERE
id = $1
AND hospital_id = $2
AND is_active = TRUE
LIMIT 1
`,
[
doctorId,
hospitalId
]
);
return result.rows[0] || null;
}
async function getDoctorSchedule(
doctorId,
date
) {
const result =
await pool.query(
`
SELECT
ds.*
FROM doctor_schedules ds
WHERE
ds.doctor_id = $1
AND ds.day_of_week =
EXTRACT(
DOW FROM $2::date
)::integer
LIMIT 1
`,
[
doctorId,
date
]
);
return result.rows[0] || null;
}
/* =========================================================
DATE / TIME HELPERS
========================================================= */
function padNumber(
value
) {
return String(value)
.padStart(2, "0");
}
function getTodayDate() {
const now =
new Date();
return (
now.getFullYear()
+ "-"
+ padNumber(
now.getMonth() + 1
)
+ "-"
+ padNumber(
now.getDate()
)
);
}
function formatDate(
date
) {
if (!date) {
return "";
}
const d =
new Date(
`${date}T00:00:00`
);
if (
Number.isNaN(
d.getTime()
)
) {
return String(date);
}
return (
padNumber(
d.getDate()
)
+ "/"
+ padNumber(
d.getMonth() + 1
)
+ "/"
+ d.getFullYear()
);
}
function formatTime(
time
) {
if (!time) {
return "";
}
const parts =
String(time)
.split(":");
if (parts.length < 2) {
return String(time);
}
let hour =
Number(parts[0]);
const minute =
parts[1];
const suffix =
hour >= 12
? "PM"
: "AM";
hour =
hour % 12 || 12;
return `${padNumber(hour)}:${minute} ${suffix}`;
}
function getDayName(
date,
lang = "en"
) {
const d =
new Date(
`${date}T00:00:00`
);
const daysEn = [
"Sunday",
"Monday",
"Tuesday",
"Wednesday",
"Thursday",
"Friday",
"Saturday"
];
const daysHi = [
"■■■■■■",
"■■■■■■",
"■■■■■■■",
"■■■■■■",
"■■■■■■■",
"■■■■■■■■",
"■■■■■■"
];
return (
lang === "hi"
? daysHi[d.getDay()]
: daysEn[d.getDay()]
);
}
/* =========================================================
TOKEN HELPERS
========================================================= */
async function getNextTokenNumber(
hospitalId,
doctorId,
date
) {
const result =
await pool.query(
`
SELECT
COALESCE(
MAX(token_number),
0
) + 1 AS next_token
FROM token_queue
WHERE
hospital_id = $1
AND doctor_id = $2
AND token_date = $3
`,
[
hospitalId,
doctorId,
date
]
);
return Number(
result.rows[0].next_token
);
}
async function getActiveToken(
hospitalId,
doctorId,
date
) {
const result =
await pool.query(
`
SELECT
token_number
FROM token_queue
WHERE
hospital_id = $1
AND doctor_id = $2
AND token_date = $3
AND status = 'CALLED'
ORDER BY
token_number ASC
LIMIT 1
`,
[
hospitalId,
doctorId,
date
]
);
return result.rows[0]
? Number(
result.rows[0].token_number
)
: null;
}
async function getPatientsAhead(
hospitalId,
doctorId,
date,
tokenNumber
) {
const result =
await pool.query(
`
SELECT
COUNT(*)::integer AS count
FROM token_queue
WHERE
hospital_id = $1
AND doctor_id = $2
AND token_date = $3
AND token_number < $4
AND status IN (
'WAITING',
'CALLED'
)
`,
[
hospitalId,
doctorId,
date,
tokenNumber
]
);
return Number(
result.rows[0].count
);
}
async function getTokenForPatient(
phone,
hospitalId,
doctorId,
date
) {
const result =
await pool.query(
`
SELECT
*
FROM token_queue
WHERE
patient_phone = $1
AND hospital_id = $2
AND doctor_id = $3
AND token_date = $4
AND status IN (
'WAITING',
'CALLED'
)
ORDER BY
token_number ASC
LIMIT 1
`,
[
phone,
hospitalId,
doctorId,
date
]
);
return result.rows[0] || null;
}
/* =========================================================
APPOINTMENT HELPERS
========================================================= */
async function getBookedSlots(
hospitalId,
doctorId,
date
) {
const result =
await pool.query(
`
SELECT
slot
FROM appointments
WHERE
hospital_id = $1
AND doctor_id = $2
AND appointment_date = $3
AND status = 'BOOKED'
ORDER BY
slot ASC
`,
[
hospitalId,
doctorId,
date
]
);
return result.rows.map(
row => row.slot
);
}
/* =========================================================
SMARTCLINIC FUTURE PLAN HELPERS
========================================================= */
async function getHospitalSubscription(
hospitalId
) {
const result =
await pool.query(
`
SELECT
hs.*,
sp.plan_name,
sp.price,
sp.billing_cycle
FROM hospital_subscriptions hs
LEFT JOIN smartclinic_plans sp
ON sp.id = hs.plan_id
WHERE
hs.hospital_id = $1
LIMIT 1
`,
[hospitalId]
);
return result.rows[0] || null;
}
/* =========================================================
VALIDATION HELPERS
========================================================= */
function isValidName(
name
) {
if (!name) {
return false;
}
const cleaned =
String(name)
.trim();
if (
cleaned.length < 2 ||
cleaned.length > 100
) {
return false;
}
return /^[A-Za-zÀ-ÖØ-öø-ÿ\u0900-\u097F\s.'-]+$/
.test(cleaned);
}
function isValidPhone(
phone
) {
if (!phone) {
return false;
}
const cleaned =
String(phone)
.replace(
/\D/g,
""
);
return (
cleaned.length >= 10 &&
cleaned.length <= 15
);
}
function normalizeLanguage(
language
) {
return (
language === "hi"
? "hi"
: "en"
);
}
/* =========================================================
PART 2 END
========================================================= */
/* =========================================================
WHATSAPP SEND HELPERS
========================================================= */
async function sendWhatsAppRequest(
phoneNumberId,
accessToken,
payload,
graphVersion = GRAPH_VERSION
) {
const url =
`https://graph.facebook.com/${graphVersion}` +
`/${phoneNumberId}/messages`;
try {
const response =
await axios.post(
url,
payload,
{
headers: {
Authorization:
`Bearer ${accessToken}`,
"Content-Type":
"application/json"
},
timeout: 15000
}
);
return response.data;
} catch (error) {
console.error(
"WhatsApp API error:",
error.response?.data ||
error.message
);
throw error;
}
}
/* =========================================================
SEND TEXT
========================================================= */
async function sendText(
phone,
text,
hospital
) {
if (!hospital) {
console.error(
"sendText: hospital connection missing"
);
return null;
}
return await sendWhatsAppRequest(
hospital.phone_number_id,
hospital.access_token,
{
messaging_product:
"whatsapp",
to:
phone,
type:
"text",
text: {
body:
text
}
},
hospital.graph_version ||
GRAPH_VERSION
);
}
/* =========================================================
SEND BUTTONS
========================================================= */
async function sendButtons(
phone,
body,
buttons,
hospital
) {
if (!hospital) {
console.error(
"sendButtons: hospital connection missing"
);
return null;
}
const formattedButtons =
buttons
.slice(0, 3)
.map(
button => ({
type:
"reply",
reply: {
id:
button.id,
title:
button.title
.slice(0, 20)
}
})
);
return await sendWhatsAppRequest(
hospital.phone_number_id,
hospital.access_token,
{
messaging_product:
"whatsapp",
to:
phone,
type:
"interactive",
interactive: {
type:
"button",
body: {
text:
body
},
action: {
buttons:
formattedButtons
}
}
},
hospital.graph_version ||
GRAPH_VERSION
);
}
/* =========================================================
SEND LIST
========================================================= */
async function sendList(
phone,
body,
buttonText,
sections,
hospital
) {
if (!hospital) {
console.error(
"sendList: hospital connection missing"
);
return null;
}
return await sendWhatsAppRequest(
hospital.phone_number_id,
hospital.access_token,
{
messaging_product:
"whatsapp",
to:
phone,
type:
"interactive",
interactive: {
type:
"list",
body: {
text:
body
},
action: {
button:
buttonText
.slice(0, 20),
sections:
sections
}
}
},
hospital.graph_version ||
GRAPH_VERSION
);
}
/* =========================================================
SEND MAIN MENU
========================================================= */
async function sendMainMenu(
phone,
patient,
hospital
) {
const lang =
normalizeLanguage(
patient?.language
);
const t =
TEXTS[lang];
await sendText(
phone,
t.mainMenuHeader(
patient?.name ||
"Patient"
),
hospital
);
await sendList(
phone,
lang === "hi"
? "■■■■ ■■■ ■■ ■■■■■■ ■■■ ■■ ■■■■ ■■■■■:"
: "Please select a service from the menu:",
t.mainMenuButton,
[
{

title:
lang === "hi"
? "■■■■■ ■■■■■■"
: "Main Services",
rows: [
{
id:
"MENU_BOOK",
title:
t.book,
description:
lang === "hi"
? "■■■■■■ ■■ ■■■ ■■■■■■■■■■ ■■■ ■■■■"
: "Book an appointment with a doctor"
},
{
id:
"MENU_TOKEN",
title:
t.tokenMenu,
description:
lang === "hi"
? "■■■■ ■■■ ■■■■ ■■ ■■■■ ■■■■■"
: "Book token or check queue status"
},
{
id:
"MENU_TIMING",
title:
t.timing,
description:
lang === "hi"
? "■■■■■■ ■■ ■■■ ■■■■■"
: "View doctor timings"
},
{
id:
"MENU_EMERGENCY",
title:
t.emergency,
description:
lang === "hi"
? "Emergency request"
: "Emergency request"
},
{
id:
"MENU_DETAILS",
title:
t.details,
description:
lang === "hi"
? "■■■■ ■■■■■■■ ■■■■■"
: "View your details"
},
{
id:
"MENU_LANGUAGE",
title:
t.language,
description:
lang === "hi"
? "■■■■ ■■■■■"
: "Change language"
}
]
}
],
hospital
);
}
/* =========================================================
SEND LANGUAGE MENU
========================================================= */
async function sendLanguageMenu(
phone,
hospital
) {
await sendButtons(
phone,
"■ Select Language / ■■■■ ■■■■■",
[
{
id:
"LANG_EN",
title:
"■■ English"
},
{
id:
"LANG_HI",
title:
"■■ ■■■■■"
}
],
hospital
);
}
/* =========================================================
SEND DOCTOR MENU
========================================================= */
async function sendDoctorMenu(
phone,
hospital,
lang,
tokenMode = false
) {
const doctors =
await getDoctors(
hospital.id
);
if (!doctors.length) {
await sendText(
phone,
TEXTS[lang]
.doctorNotAvailable,
hospital
);
return;
}
const rows =
doctors
.slice(0, 10)
.map(
doctor => ({
id:
tokenMode
? `TOKEN_DOCTOR_${doctor.id}`
: `DOCTOR_${doctor.id}`,
title:
doctor.doctor_name
.slice(0, 24),
description:
(
doctor.specialization ||
"Doctor"
)
.slice(0, 72)
})
);
await sendList(
phone,
tokenMode
? TEXTS[lang].chooseTokenDoctor
: TEXTS[lang].chooseDoctor,
lang === "hi"
? "■■■■■■ ■■■■■"
: "Select Doctor",
[
{
title:
lang === "hi"
? "■■■■■■ ■■■■■■"
: "Available Doctors",
rows
}
],
hospital
);
}
/* =========================================================
SEND DATE MENU
========================================================= */
async function sendDateMenu(
phone,
lang,
hospital
) {
const today =
new Date();
const rows = [];
for (
let i = 0;
i < 7;
i++
) {
const date =
new Date(today);
date.setDate(
today.getDate() + i
);
const value =
date.getFullYear()
+ "-"
+ padNumber(
date.getMonth() + 1
)
+ "-"
+ padNumber(
date.getDate()
);
const title =
i === 0
? (
lang === "hi"
? "■■"
: "Today"
)
: i === 1
? (
lang === "hi"
? "■■"
: "Tomorrow"
)
: (
padNumber(
date.getDate()
)
+ "/"
+ padNumber(
date.getMonth() + 1
)
);
rows.push({
id:
`DATE_${value}`,
title:
title,
description:
getDayName(
value,
lang
)
});
}
await sendList(
phone,
TEXTS[lang].chooseDate,
lang === "hi"
? "■■■■■ ■■■■■"
: "Select Date",
[
{
title:
lang === "hi"
? "■■■■■■ ■■■■■"
: "Available Dates",
rows
}
],
hospital
);
}
/* =========================================================
GENERATE TIME SLOTS
========================================================= */
function generateTimeSlots(
startTime,
endTime,
intervalMinutes = 30,
breakStart = null,
breakEnd = null
) {
const slots = [];
if (
!startTime ||
!endTime
) {
return slots;
}
const toMinutes =
time => {
const [
hour,
minute
] =
String(time)
.split(":")
.map(Number);
return (
hour * 60 +
minute
);
};
const start =
toMinutes(
startTime
);
const end =
toMinutes(
endTime
);
const breakStartMinutes =
breakStart
? toMinutes(
breakStart
)
: null;
const breakEndMinutes =
breakEnd
? toMinutes(
breakEnd
)
: null;
for (
let current = start;
current < end;
current += intervalMinutes
) {
if (
breakStartMinutes !== null &&
breakEndMinutes !== null &&
current >= breakStartMinutes &&
current < breakEndMinutes
) {
continue;
}
const hour =
Math.floor(
current / 60
);
const minute =
current % 60;
const displayHour =
hour % 12 || 12;
const suffix =
hour >= 12
? "PM"
: "AM";
const slot =
`${padNumber(displayHour)}:` +
`${padNumber(minute)} ${suffix}`;
slots.push(slot);
}
return slots;
}
/* =========================================================
SEND SLOT MENU
========================================================= */
async function sendSlotMenu(
phone,
doctorId,
date,
hospital,
lang
) {
const doctor =
await getDoctorById(
doctorId,
hospital.id
);
if (!doctor) {
await sendText(
phone,
TEXTS[lang]
.doctorNotAvailable,
hospital
);
return;
}
const schedule =
await getDoctorSchedule(
doctorId,
date
);
if (
!schedule ||
!schedule.is_working ||
!schedule.appointment_enabled
) {
await sendText(
phone,
TEXTS[lang].noSlots,
hospital
);
return;
}
const interval =
Number(
doctor.average_consultation_minutes
) || 30;
const allSlots =
generateTimeSlots(
schedule.start_time,
schedule.end_time,
interval,
schedule.break_start_time,
schedule.break_end_time
);
const bookedSlots =
await getBookedSlots(
hospital.id,
doctorId,
date
);
const availableSlots =
allSlots.filter(
slot =>
!bookedSlots.includes(
slot
)
);
if (
!availableSlots.length
) {
await sendText(
phone,
TEXTS[lang].noSlots,
hospital
);
return;
}
const rows =
availableSlots
.slice(0, 10)
.map(
(slot, index) => ({
id:
`SLOT_${index}_${encodeURIComponent(slot)}`,
title:
slot,
description:
doctor.doctor_name
})
);
await sendList(
phone,
TEXTS[lang].chooseSlot,
lang === "hi"
? "■■■ ■■■■■"
: "Select Time",
[
{
title:
lang === "hi"
? "■■■■■■ ■■■■■"
: "Available Slots",
rows
}
],
hospital
);
}
/* =========================================================
SEND TOKEN MENU
========================================================= */
async function sendTokenMenu(
phone,
lang,
hospital
) {
await sendButtons(
phone,
lang === "hi"
? "■■ ■■■■ ■■■■ ■■■■■:"
: "■■ Select a token service:",
[
{
id:
"TOKEN_BOOK",
title:
TEXTS[lang].bookToken
},
{
id:
"TOKEN_STATUS",
title:
TEXTS[lang].tokenStatus
}
],
hospital
);
}
/* =========================================================
DOCTOR TIMING
========================================================= */
async function sendDoctorTimings(
phone,
lang,
hospital
) {
const doctors =
await getDoctors(
hospital.id
);
if (!doctors.length) {
await sendText(
phone,
TEXTS[lang]
.doctorNotAvailable,
hospital
);
return;
}
const lines = [];
for (
const doctor of doctors
) {
const result =
await pool.query(
`
SELECT
day_of_week,
is_working,
start_time,
end_time
FROM doctor_schedules
WHERE
doctor_id = $1
ORDER BY
day_of_week ASC
`,
[doctor.id]
);
lines.push(
`■■■■ *${doctor.doctor_name}*`
);
if (
doctor.specialization
) {
lines.push(
`Specialization: ${doctor.specialization}`
);
}
if (
!result.rows.length
) {
lines.push(
lang === "hi"
? "■■■ ■■■■■■ ■■■■ ■■■"
: "Timing not available."
);
lines.push("");
continue;
}
for (
const schedule of result.rows
) {
if (
!schedule.is_working
) {
continue;
}
const day =
getDayName(
`2026-08-${String(
16 + schedule.day_of_week
).padStart(2, "0")}`,
lang
);
lines.push(
`${day}: ` +
`${formatTime(schedule.start_time)}` +
` - ` +
`${formatTime(schedule.end_time)}`
);
}
lines.push("");
}
await sendText(
phone,
lines.join("\n"),
hospital
);
}
/* =========================================================
PART 3 END
========================================================= */
/* =========================================================
TOKEN BOOKING
========================================================= */
async function bookTokenForDoctor(
phone,
doctorId,
hospitalId,
lang,
hospital
) {
const patient =
await getPatient(phone);
if (!patient) {
await sendText(
phone,
TEXTS[lang].askName,
hospital
);
await setSession(
phone,
"WAIT_NAME",
{}
);
return;
}
const doctor =
await getDoctorById(
doctorId,
hospitalId
);
if (!doctor) {
await sendText(
phone,
TEXTS[lang]
.doctorNotAvailable,
hospital
);
await setSession(
phone,
"MAIN_MENU",
{}
);
return;
}
const today =
getTodayDate();
const schedule =
await getDoctorSchedule(
doctorId,
today
);
if (
!schedule ||
!schedule.is_working ||
!schedule.token_enabled
) {
await sendText(
phone,
lang === "hi"
? "■■ ■■ ■■■■■■ ■■ ■■■ ■■■■ ■■■■■■ ■■■■ ■■■"
: "Tokens are not available for this doctor today.",
hospital
);
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendMainMenu(
phone,
patient,
hospital
);
return;
}
const existingToken =
await getTokenForPatient(
phone,
hospitalId,
doctorId,
today
);
if (existingToken) {
await sendText(
phone,
lang === "hi"
? `■■■■ ■■ ■■ ■■■■ ■■■■ ■■ ■■■ ■■: *${existingToken.token_number}*`
: `You already have a token today: *${existingToken.token_number}*`,
hospital
);
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendMainMenu(
phone,
patient,
hospital
);
return;
}
const tokenNumber =
await getNextTokenNumber(
hospitalId,
doctorId,
today
);
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
$1,
$2,
$3,
$4,
$5,
$6,
$7,
'ONLINE',
'WAITING'
)
`,
[
hospitalId,
doctorId,
patient.id,
phone,
patient.name,
today,
tokenNumber
]
);
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendText(
phone,
TEXTS[lang].tokenBooked(
tokenNumber,
doctor.doctor_name
),
hospital
);
await sendMainMenu(
phone,
patient,
hospital
);
}
/* =========================================================
TOKEN STATUS
========================================================= */
async function sendTokenStatus(
phone,
lang,
hospital
) {
const today =
getTodayDate();
const result =
await pool.query(
`
SELECT
tq.*,
d.doctor_name,
d.average_consultation_minutes
FROM token_queue tq
INNER JOIN doctors d
ON d.id = tq.doctor_id
WHERE
tq.patient_phone = $1
AND tq.hospital_id = $2
AND tq.token_date = $3
AND tq.status IN (
'WAITING',
'CALLED'
)
ORDER BY
tq.id DESC
LIMIT 1
`,
[
phone,
hospital.id,
today
]
);
if (!result.rows.length) {
await sendText(
phone,
TEXTS[lang].noActiveToken,
hospital
);
return;
}
const token =
result.rows[0];
const activeToken =
await getActiveToken(
hospital.id,
token.doctor_id,
today
);
const patientsAhead =
await getPatientsAhead(
hospital.id,
token.doctor_id,
today,
token.token_number
);
const consultationMinutes =
Number(
token.average_consultation_minutes
) || 5;
const waitMinutes =
patientsAhead *
consultationMinutes;
const now =
new Date();
const estimated =
new Date(
now.getTime()
+
waitMinutes * 60000
);
const estimatedTime =
estimated.toLocaleTimeString(
"en-IN",
{
hour:
"2-digit",
minute:
"2-digit"
}
);
await sendText(
phone,
TEXTS[lang]
.tokenStatusMessage(
token.token_number,
activeToken,
patientsAhead,
waitMinutes,
estimatedTime
),
hospital
);
}
/* =========================================================
APPOINTMENT BOOKING
========================================================= */
async function startBooking(
phone,
lang,
hospital,
doctorId = null
) {
await setSession(
phone,
"WAIT_DATE",
{
doctor_id:
doctorId
}
);
await sendDateMenu(
phone,
lang,
hospital
);
}
/* =========================================================
DATE SELECTED
========================================================= */
async function handleDateSelection(
phone,
date,
lang,
hospital
) {
if (!date) {
await sendText(
phone,
TEXTS[lang].invalidInput,
hospital
);
return;
}
const session =
await getSession(phone);
const doctorId =
Number(
session.temp_data?.doctor_id
);
if (!doctorId) {
await sendDoctorMenu(
phone,
hospital,
lang,
false
);
return;
}
await setSession(
phone,
"WAIT_SLOT",
{
doctor_id:
doctorId,
date:
date
}
);
await sendSlotMenu(
phone,
doctorId,
date,
hospital,
lang
);
}
/* =========================================================
SLOT SELECTED
========================================================= */
async function handleSlotSelection(
phone,
slot,
lang,
hospital
) {
const session =
await getSession(phone);
const doctorId =
Number(
session.temp_data?.doctor_id
);
const date =
session.temp_data?.date;
if (
!doctorId ||
!date ||
!slot
) {
await sendText(
phone,
TEXTS[lang].invalidInput,
hospital
);
await setSession(
phone,
"MAIN_MENU",
{}
);
return;
}
const patient =
await getPatient(phone);
if (!patient) {
await setSession(
phone,
"WAIT_NAME",
{
doctor_id:
doctorId,
date:
date,
slot:
slot
}
);
await sendText(
phone,
TEXTS[lang].askName,
hospital
);
return;
}
const doctor =
await getDoctorById(
doctorId,
hospital.id
);
if (!doctor) {
await sendText(
phone,
TEXTS[lang]
.doctorNotAvailable,
hospital
);
return;
}
await setSession(
phone,
"WAIT_CONFIRM",
{
doctor_id:
doctorId,
date:
date,
slot:
slot
}
);
await sendButtons(
phone,
TEXTS[lang]
.confirmAppointment(
doctor.doctor_name,
formatDate(date),
slot
),
[
{
id:
"CONFIRM_YES",
title:
TEXTS[lang].confirmYes
},
{
id:
"CONFIRM_NO",
title:
TEXTS[lang].confirmNo
}
],
hospital
);
}
/* =========================================================
CONFIRM APPOINTMENT
========================================================= */
async function confirmAppointment(
phone,
lang,
hospital
) {
const session =
await getSession(phone);
const doctorId =
Number(
session.temp_data?.doctor_id
);
const date =
session.temp_data?.date;
const slot =
session.temp_data?.slot;
if (
!doctorId ||
!date ||
!slot
) {
await sendText(
phone,
TEXTS[lang].invalidInput,
hospital
);
await clearSession(phone);
return;
}
const patient =
await getPatient(phone);
if (!patient) {
await sendText(
phone,
TEXTS[lang].askName,
hospital
);
await setSession(
phone,
"WAIT_NAME",
{
doctor_id:
doctorId,
date:
date,
slot:
slot
}
);
return;
}
const doctor =
await getDoctorById(
doctorId,
hospital.id
);
if (!doctor) {
await sendText(
phone,
TEXTS[lang]
.doctorNotAvailable,
hospital
);
return;
}
const bookedSlots =
await getBookedSlots(
hospital.id,
doctorId,
date
);
if (
bookedSlots.includes(
slot
)
) {
await sendText(
phone,
lang === "hi"
? "■■■ ■■■■■, ■■ ■■■■■ ■■■ ■■■ ■■ ■■■ ■■■ ■■■■■ ■■■■■ ■■■■■ ■■■■■■"
: "Sorry, this slot has just been booked. Please choose another slot.",
hospital
);
await sendSlotMenu(
phone,
doctorId,
date,
hospital,
lang
);
return;
}
const tokenNumber =
await getNextTokenNumber(
hospital.id,
doctorId,
date
);
await pool.query(
`
INSERT INTO appointments
(
hospital_id,
doctor_id,
phone,
patient_name,
appointment_date,
slot,
token_number,
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
'BOOKED'
)
`,
[
hospital.id,
doctorId,
phone,
patient.name,
date,
slot,
tokenNumber
]
);
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendText(
phone,
TEXTS[lang]
.appointmentBooked(
tokenNumber,
doctor.doctor_name,
formatDate(date),
slot
),
hospital
);
await sendMainMenu(
phone,
patient,
hospital
);
}
/* =========================================================
CANCEL APPOINTMENT
========================================================= */
async function cancelAppointment(
phone,
lang,
hospital
) {
await clearSession(
phone
);
await sendText(
phone,
TEXTS[lang]
.appointmentCancelled,
hospital
);
const patient =
await getPatient(phone);
if (patient) {
await sendMainMenu(
phone,
patient,
hospital
);
}
}
/* =========================================================
CHANGE LANGUAGE
========================================================= */
async function changeLanguage(
phone,
hospital
) {
await setSession(
phone,
"WAIT_LANGUAGE_CHANGE",
{}
);
await sendLanguageMenu(
phone,
hospital
);
}
/* =========================================================
REGISTRATION
========================================================= */
async function startRegistration(
phone,
hospital,
extraData = {}
) {
await setSession(
phone,
"WAIT_NAME",
extraData
);
const sessionLanguage =
await getSession(phone);
const lang =
normalizeLanguage(
sessionLanguage.temp_data?.language
|| "en"
);
await sendText(
phone,
TEXTS[lang].askName,
hospital
);
}
/* =========================================================
COMPLETE REGISTRATION
========================================================= */
async function completeRegistration(
phone,
name,
hospital
) {
const session =
await getSession(phone);
const lang =
normalizeLanguage(
session.temp_data?.language
|| "en"
);
const patient =
await createPatient(
phone,
name,
lang
);
await sendText(
phone,
TEXTS[lang]
.registrationDone(
patient.name
),
hospital
);
const doctorId =
Number(
session.temp_data?.doctor_id
);
const date =
session.temp_data?.date;
const slot =
session.temp_data?.slot;
if (
doctorId &&
date &&
slot
) {
await setSession(
phone,
"WAIT_CONFIRM",
{
doctor_id:
doctorId,
date:
date,
slot:
slot
}
);
const doctor =
await getDoctorById(
doctorId,
hospital.id
);
if (doctor) {
await sendButtons(
phone,
TEXTS[lang]
.confirmAppointment(
doctor.doctor_name,
formatDate(date),
slot
),
[
{
id:
"CONFIRM_YES",
title:
TEXTS[lang].confirmYes
},
{
id:
"CONFIRM_NO",
title:
TEXTS[lang].confirmNo
}
],
hospital
);
return;
}
}
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendMainMenu(
phone,
patient,
hospital
);
}
/* =========================================================
EMERGENCY FLOW
========================================================= */
async function startEmergency(
phone,
lang,
hospital
) {
await setSession(
phone,
"WAIT_EMERGENCY_CONFIRM",
{}
);
await sendButtons(
phone,
TEXTS[lang]
.emergencyAsk,
[
{
id:
"EMERGENCY_YES",
title:
TEXTS[lang]
.emergencyYes
},
{
id:
"EMERGENCY_NO",
title:
TEXTS[lang]
.emergencyNo
}
],
hospital
);
}
/* =========================================================
SAVE EMERGENCY
========================================================= */
async function saveEmergency(
phone,
patientName,
patientPhone,
message,
hospital
) {
await pool.query(
`
INSERT INTO emergency_requests
(
hospital_id,
phone,
patient_name,
patient_phone,
message,
status
)
VALUES
(
$1,
$2,
$3,
$4,
$5,
'OPEN'
)
`,
[
hospital.id,
phone,
patientName,
patientPhone,
message
]
);
}
/* =========================================================
HANDLE EMERGENCY CONFIRMATION
========================================================= */
async function handleEmergencyConfirmation(
phone,
id,
lang,
hospital
) {
if (
id === "EMERGENCY_NO"
) {
const patient =
await getPatient(phone);
await setSession(
phone,
"MAIN_MENU",
{}
);
if (patient) {
await sendMainMenu(
phone,
patient,
hospital
);
}
return;
}
if (
id === "EMERGENCY_YES"
) {
await setSession(
phone,
"WAIT_EMERGENCY_NAME",
{}
);
await sendText(
phone,
TEXTS[lang]
.emergencyName,
hospital
);
return;
}
await sendText(
phone,
TEXTS[lang]
.invalidInput,
hospital
);
}
/* =========================================================
PART 4 END
========================================================= */
/* =========================================================
TEXT MESSAGE STATE HANDLER
========================================================= */
async function handleTextMessage(
phone,
text,
hospital
) {
let session =
await getSession(phone);
let patient =
await getPatient(phone);
const cleanText =
String(text || "")
.trim();
const lowerText =
cleanText.toLowerCase();
/* =======================================================
NEW USER / LANGUAGE
======================================================= */
if (
session.state === "WAIT_LANGUAGE"
) {
if (
lowerText === "english" ||
lowerText === "en" ||
lowerText === "1"
) {
await setSession(
phone,
"WAIT_NAME",
{
language: "en"
}
);
await sendText(
phone,
TEXTS.en.askName,
hospital
);
return;
}
if (
lowerText === "hindi" ||
lowerText === "■■■■■" ||
lowerText === "hi" ||
lowerText === "2"
) {
await setSession(
phone,
"WAIT_NAME",
{
language: "hi"
}
);
await sendText(
phone,
TEXTS.hi.askName,
hospital
);
return;
}
await sendLanguageMenu(
phone,
hospital
);
return;
}
/* =======================================================
NAME REGISTRATION
======================================================= */
if (
session.state === "WAIT_NAME"
) {
if (
!isValidName(
cleanText
)
) {
const lang =
normalizeLanguage(
session.temp_data?.language ||
"en"
);
await sendText(
phone,
TEXTS[lang].invalidName,
hospital
);
return;
}
const language =
normalizeLanguage(
session.temp_data?.language ||
patient?.language ||
"en"
);
const savedPatient =
await createPatient(
phone,
cleanText,
language
);
/*
Registration ke baad agar appointment
booking pending thi to usi flow ko continue karo.
*/
const doctorId =
Number(
session.temp_data?.doctor_id
);
const date =
session.temp_data?.date;
const slot =
session.temp_data?.slot;
if (
doctorId &&
date &&
slot
) {
const doctor =
await getDoctorById(
doctorId,
hospital.id
);
if (doctor) {
await setSession(
phone,
"WAIT_CONFIRM",
{
doctor_id:
doctorId,
date:
date,
slot:
slot
}
);
await sendText(
phone,
TEXTS[language]
.registrationDone(
savedPatient.name
),
hospital
);
await sendButtons(
phone,
TEXTS[language]
.confirmAppointment(
doctor.doctor_name,
formatDate(date),
slot
),
[
{
id:
"CONFIRM_YES",
title:
TEXTS[language]
.confirmYes
},
{
id:
"CONFIRM_NO",
title:
TEXTS[language]
.confirmNo
}
],
hospital
);
return;
}
}
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendText(
phone,
TEXTS[language]
.registrationDone(
savedPatient.name
),
hospital
);
await sendMainMenu(
phone,
savedPatient,
hospital
);
return;
}
/* =======================================================
IF PATIENT DOES NOT EXIST
======================================================= */
if (!patient) {
await setSession(
phone,
"WAIT_LANGUAGE",
{}
);
await sendLanguageMenu(
phone,
hospital
);
return;
}
const lang =
normalizeLanguage(
patient.language
);
/* =======================================================
WAIT DOCTOR FOR APPOINTMENT
======================================================= */
if (
session.state ===
"WAIT_DOCTOR_BOOKING"
) {
await sendDoctorMenu(
phone,
hospital,
lang,
false
);
return;
}
/* =======================================================
WAIT DOCTOR FOR TOKEN
======================================================= */
if (
session.state ===
"WAIT_DOCTOR_TOKEN"
) {
await sendDoctorMenu(
phone,
hospital,
lang,
true
);
return;
}
/* =======================================================
WAIT DATE
======================================================= */
if (
session.state ===
"WAIT_DATE"
) {
const date =
cleanText;
if (
!/^\d{4}-\d{2}-\d{2}$/
.test(date)
) {
await sendDateMenu(
phone,
lang,
hospital
);
return;
}
await handleDateSelection(
phone,
date,
lang,
hospital
);
return;
}
/* =======================================================
WAIT SLOT
======================================================= */
if (
session.state ===
"WAIT_SLOT"
) {
await handleSlotSelection(
phone,
cleanText,
lang,
hospital
);
return;
}
/* =======================================================
WAIT CONFIRM
======================================================= */
if (
session.state ===
"WAIT_CONFIRM"
) {
if (
lowerText === "yes" ||
lowerText === "y" ||
lowerText === "confirm" ||
lowerText === "■■■" ||
lowerText === "■■■"
) {
await confirmAppointment(
phone,
lang,
hospital
);
return;
}
if (
lowerText === "no" ||
lowerText === "n" ||
lowerText === "cancel" ||
lowerText === "■■■■"
) {
await cancelAppointment(
phone,
lang,
hospital
);
return;
}
await sendText(
phone,
TEXTS[lang].invalidInput,
hospital
);
return;
}
/* =======================================================
EMERGENCY CONFIRMATION
======================================================= */
if (
session.state ===
"WAIT_EMERGENCY_CONFIRM"
) {
if (
lowerText === "yes" ||
lowerText === "y" ||
lowerText === "■■■" ||
lowerText === "■■■"
) {
await setSession(
phone,
"WAIT_EMERGENCY_NAME",
{}
);
await sendText(
phone,
TEXTS[lang]
.emergencyName,
hospital
);
return;
}
if (
lowerText === "no" ||
lowerText === "n" ||
lowerText === "■■■■"
) {
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendMainMenu(
phone,
patient,
hospital
);
return;
}
await sendText(
phone,
TEXTS[lang]
.emergencyAsk,
hospital
);
return;
}
/* =======================================================
EMERGENCY NAME
======================================================= */
if (
session.state ===
"WAIT_EMERGENCY_NAME"
) {
if (
!isValidName(
cleanText
)
) {
await sendText(
phone,
TEXTS[lang]
.invalidName,
hospital
);
return;
}
await setSession(
phone,
"WAIT_EMERGENCY_PHONE",
{
patient_name:
cleanText
}
);
await sendText(
phone,
TEXTS[lang]
.emergencyPhone,
hospital
);
return;
}
/* =======================================================
EMERGENCY PHONE
======================================================= */
if (
session.state ===
"WAIT_EMERGENCY_PHONE"
) {
if (
!isValidPhone(
cleanText
)
) {
await sendText(
phone,
lang === "hi"
? "■■■■■ ■■■ ■■■■■■ ■■■■ ■■■■■■"
: "Please send a valid phone number.",
hospital
);
return;
}
const patientName =
session.temp_data
?.patient_name ||
patient.name;
await setSession(
phone,
"WAIT_EMERGENCY_DETAILS",
{
patient_name:
patientName,
patient_phone:
cleanText
}
);
await sendText(
phone,
TEXTS[lang]
.emergencyDetails,
hospital
);
return;
}
/* =======================================================
EMERGENCY DETAILS
======================================================= */
if (
session.state ===
"WAIT_EMERGENCY_DETAILS"
) {
const patientName =
session.temp_data
?.patient_name ||
patient.name;
const patientPhone =
session.temp_data
?.patient_phone ||
phone;
const emergencyMessage =
lowerText === "skip"
? ""
: cleanText;
await saveEmergency(
phone,
patientName,
patientPhone,
emergencyMessage,
hospital
);
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendText(
phone,
TEXTS[lang]
.emergencyRecorded,
hospital
);
await sendMainMenu(
phone,
patient,
hospital
);
return;
}
/* =======================================================
NORMAL TEXT COMMANDS
======================================================= */
if (
lowerText === "hi" ||
lowerText === "hello" ||
lowerText === "hey" ||
lowerText === "start" ||
lowerText === "menu"
) {
await setSession(
phone,
"MAIN_MENU",
{}
);
await sendMainMenu(
phone,
patient,
hospital
);
return;
}
if (
lowerText === "appointment" ||
lowerText === "book" ||
lowerText === "book appointment"
) {
await setSession(
phone,
"WAIT_DOCTOR_BOOKING",
{}
);
await sendDoctorMenu(
phone,
hospital,
lang,
false
);
return;
}
if (
lowerText === "token"
) {
await sendTokenMenu(
phone,
lang,
hospital
);
return;
}
if (
lowerText === "timing" ||
lowerText === "doctor timing"
) {
await sendDoctorTimings(
phone,
lang,
hospital
);
return;
}
if (
lowerText === "emergency" ||
lowerText === "urgent"
) {
await startEmergency(
phone,
lang,
hospital
);
return;
}
if (
lowerText === "language"
) {
await changeLanguage(
phone,
hospital
);
return;
}
if (
lowerText === "details" ||
lowerText === "my details"
) {
await sendText(
phone,
TEXTS[lang]
.myDetails(
patient.name,
phone,
lang
),
hospital
);
return;
}
/* =======================================================
UNKNOWN TEXT
======================================================= */
await sendText(
phone,
TEXTS[lang].invalidInput,
hospital
);
await sendMainMenu(
phone,
patient,
hospital
);
}
/* =========================================================
INTERACTIVE MESSAGE HANDLER
========================================================= */
async function handleInteractiveMessage(
phone,
message,
hospital
) {
const patient =
await getPatient(phone);
if (!patient) {
await setSession(
phone,
"WAIT_LANGUAGE",
{}
);
await sendLanguageMenu(
phone,
hospital
);
return;
}
const lang =
normalizeLanguage(
patient.language
);
const interactive =
message.interactive;
let selectedId =
null;
if (
interactive?.type ===
"button_reply"
) {
selectedId =
interactive
.button_reply
?.id;
}
if (
interactive?.type ===
"list_reply"
) {
selectedId =
interactive
.list_reply
?.id;
}
if (!selectedId) {
return;
}
/* ======================================================
=======================================================
LANGUAGE
======================================================= */
if (
selectedId === "LANG_EN" ||
selectedId === "LANG_HI"
) {
const selectedLanguage =
selectedId === "LANG_HI"
? "hi"
: "en";
if (patient) {
await updatePatientLanguage(
phone,
selectedLanguage
);
}
await setSession(
phone,
"MAIN_MENU",
{}
);
const updatedPatient =
await getPatient(phone);
if (updatedPatient) {
await sendText(
phone,
TEXTS[selectedLanguage]
.languageChanged,
hospital
);
await sendMainMenu(
phone,
updatedPatient,
hospital
);
}
return;
}
/* =======================================================
MAIN MENU — APPOINTMENT
======================================================= */
if (
selectedId === "MENU_BOOK"
) {
await setSession(
phone,
"WAIT_DOCTOR_BOOKING",
{}
);
await sendDoctorMenu(
phone,
hospital,
lang,
false
);
return;
}
/* =====================
/* =======================================================
MAIN MENU — TOKEN
======================================================= */
if (
selectedId === "MENU_TOKEN"
) {
await sendTokenMenu(
phone,
lang,
hospital
);
return;
}
/* =======================================================
MAIN MENU — TIMING
======================================================= */
if (
selectedId === "MENU_TIMING"
) {
await sendDoctorTimings(
phone,
lang,
hospital
);
return;
}
/* =======================================================
MAIN MENU — EMERGENCY
======================================================= */
if (
selectedId === "MENU_EMERGENCY"
) {
await startEmergency(
phone,
lang,
hospital
);
return;
}
/* =======================================================
MAIN MENU — DETAILS
======================================================= */
if (
selectedId === "MENU_DETAILS"
) {
await sendText(
phone,
TEXTS[lang]
.myDetails(
patient.name,
phone,
lang
),
hospital
);
return;
}
/* =======================================================
MAIN MENU — LANGUAGE
======================================================= */
if (
selectedId === "MENU_LANGUAGE"
) {
await changeLanguage(
phone,
hospital
);
return;
}
/* =======================================================
TOKEN MENU
======================================================= */
if (
selectedId === "TOKEN_BOOK"
) {
await setSession(
phone,
"WAIT_DOCTOR_TOKEN",
{}
);
await sendDoctorMenu(
phone,
hospital,
lang,
true
);
return;
}
if (
selectedId === "TOKEN_STATUS"
) {
await sendTokenStatus(
phone,
lang,
hospital
);
return;
}
/* =======================================================
APPOINTMENT DOCTOR
======================================================= */
if (
selectedId.startsWith(
"DOCTOR_"
)
) {
const doctorId =
Number(
selectedId.replace(
"DOCTOR_",
""
)
);
if (!doctorId) {
await sendText(
phone,
TEXTS[lang]
.invalidInput,
hospital
);
return;
}
await startBooking(
phone,
lang,
hospital,
doctorId
);
return;
}
/* =======================================================
TOKEN DOCTOR
======================================================= */
if (
selectedId.startsWith(
"TOKEN_DOCTOR_"
)
) {
const doctorId =
Number(
selectedId.replace(
"TOKEN_DOCTOR_",
""
)
);
if (!doctorId) {
await sendText(
phone,
TEXTS[lang]
.invalidInput,
hospital
);
return;
}
await bookTokenForDoctor(
phone,
doctorId,
hospital.id,
lang,
hospital
);
return;
}
/* =======================================================
DATE
======================================================= */
if (
selectedId.startsWith(
"DATE_"
)
) {
const date =
selectedId.replace(
"DATE_",
""
);
await handleDateSelection(
phone,
date,
lang,
hospital
);
return;
}
/* =======================================================
SLOT
======================================================= */
if (
selectedId.startsWith(
"SLOT_"
)
) {
const parts =
selectedId.split(
"_"
);
const encodedSlot =
parts
.slice(2)
.join("_");
let slot;
try {
slot =
decodeURIComponent(
encodedSlot
);
} catch {
slot =
encodedSlot;
}
await handleSlotSelection(
phone,
slot,
lang,
hospital
);
return;
}
/* =======================================================
CONFIRM
======================================================= */
if (
selectedId ===
"CONFIRM_YES"
) {
await confirmAppointment(
phone,
lang,
hospital
);
return;
}
if (
selectedId ===
"CONFIRM_NO"
) {
await cancelAppointment(
phone,
lang,
hospital
);
return;
}
/* =======================================================
EMERGENCY BUTTONS
======================================================= */
if (
selectedId ===
"EMERGENCY_YES"
||
selectedId ===
"EMERGENCY_NO"
) {
await handleEmergencyConfirmation(
phone,
selectedId,
lang,
hospital
);
return;
}
/* =======================================================
UNKNOWN INTERACTIVE
======================================================= */
await sendText(
phone,
TEXTS[lang]
.invalidInput,
hospital
);
await sendMainMenu(
phone,
patient,
hospital
);
}
/* =========================================================
WHATSAPP INCOMING MESSAGE
========================================================= */
async function handleIncomingMessage(
phone,
message,
phoneNumberId
) {
try {
const hospital =
await getHospitalByPhoneNumberId(
phoneNumberId
);
if (!hospital) {
console.error(
"No active hospital connection found:",
phoneNumberId
);
return;
}
if (
message.type === "text"
) {
await handleTextMessage(
phone,
message.text?.body,
hospital
);
return;
}
if (
message.type === "interactive"
) {
await handleInteractiveMessage(
phone,
message,
hospital
);
return;
}
/*
Other WhatsApp message types are
currently ignored safely.
*/
console.log(
"Unsupported message type:",
message.type
);
} catch (error) {
console.error(
"Incoming message error:",
error
);
}
}
/* =========================================================
WHATSAPP WEBHOOK VERIFICATION
========================================================= */
app.get(
"/webhook",
(req, res) => {
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
"■ WhatsApp webhook verified"
);
return res
.status(200)
.send(challenge);
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
async (req, res) => {
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
Meta ko immediately 200.
Processing background mein.
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
 =========================================================
ROOT / HEALTH
========================================================= */
app.get(
"/",
(req, res) => {
res
.status(200)
.json({
success:
true,
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
app.get(
"/health",
async (req, res) => {
try {
await pool.query(
"SELECT 1"
);
return res
.status(200)
.json({
success:
true,
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
success:
false,
server:
"healthy",
database:
"disconnected"
});
}
}
);
/* =========================================================
SERVER START
========================================================= */
async function startServer() {
try {
await initDB();
app.listen(
PORT,
"0.0.0.0",
() => {
console.log(
"======================================="
);
console.log(
"■ SmartClinic AI"
);
console.log(
`■ Server running on port ${PORT}`
);
console.log(
"■ Database initialized"
);
console.log(
"■ WhatsApp webhook ready"
);
console.log(
"======================================="
);
}
);
} catch (error) {
console.error(
"■ Server startup failed:",
error
);
process.exit(
1
);
}
}
startServer();
/* =========================================================
END OF SERVER.JS
========================================================= */