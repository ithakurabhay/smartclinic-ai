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
      `Welcome to *${CLINIC_NAME}* ≡ƒÅÑ\n\nPlease select your preferred language:`,

    langEnglish: "≡ƒç¼≡ƒçº English",
    langHindi: "≡ƒç«≡ƒç│ αñ╣αñ┐αñéαñªαÑÇ",

    askName:
      "Great! What is your *full name*?",

    invalidName:
      "Please enter a valid name using letters only.",

    askPhone:
      "Thanks! Please share your *10-digit phone number*.",

    invalidPhone:
      "Please enter a valid 10-digit phone number.",

    registrationDone: (name) =>
      `Thank you, *${name}*!\n\nYour registration is complete Γ£à`,

      mainMenuHeader: (name) =>
  `Hi *${name}* ≡ƒæï\n\nHow can we help you today?`,

    mainMenuButton: "≡ƒôï Open Menu",

    book: "≡ƒôà Book Appointment",
    timing: "≡ƒæ¿ΓÇìΓÜò∩╕Å Doctor Timings",
    emergency: "≡ƒÜ¿ Emergency",
    token: "≡ƒÄƒ∩╕Å Token / Queue Status",
    language: "≡ƒîÉ Change Language",
    details: "≡ƒæñ My Details",

    mainMenu: "≡ƒÅá Main Menu",

    chooseDate:
      "≡ƒôà Please choose a date for your appointment:",

    chooseDateButton:
      "Select Date",

    chooseSlot:
      "≡ƒòÉ Choose an available time slot:",

    noSlots:
      "Sorry, no slots are available for this date.",

    confirmAppointment: (date, slot) =>
      `Please confirm your appointment:\n\n≡ƒôà Date: *${date}*\n≡ƒòÉ Slot: *${slot}*\n≡ƒæ¿ΓÇìΓÜò∩╕Å Doctor: *${DOCTOR_NAME}*`,

    confirmYes: "Γ£à Confirm",
    confirmNo: "Γ¥î Cancel",

    appointmentBooked: (token, date, slot) =>
      `≡ƒÄë *Appointment booked successfully!*\n\n≡ƒÄƒ∩╕Å Token Number: *${token}*\n≡ƒôà Date: *${date}*\n≡ƒòÉ Slot: *${slot}*\n≡ƒæ¿ΓÇìΓÜò∩╕Å Doctor: *${DOCTOR_NAME}*\n\nPlease arrive a few minutes before your appointment. ≡ƒÖÅ`,

    appointmentCancelled:
      "Γ¥î Your appointment request was cancelled.\n\nYou can start again anytime from the Main Menu.",

    doctorTiming:
      `≡ƒæ¿ΓÇìΓÜò∩╕Å *${DOCTOR_NAME} - Consultation Timings*\n\nMonday - Saturday\n≡ƒòÖ 10:00 AM - 1:00 PM\n≡ƒòö 5:00 PM - 8:00 PM\n\nSunday: Closed`,

    emergency:
      "≡ƒÜ¿ *Emergency Assistance*\n\nIf this is a life-threatening medical emergency, please contact your nearest hospital/emergency service immediately.\n\nDo not wait for a WhatsApp response.",

    emergencyRecorded:
      "≡ƒÜ¿ Your emergency request has been recorded.\n\nPlease contact the nearest emergency medical service immediately. Our staff will review your request as soon as possible.",

    noToken:
      "≡ƒÄƒ∩╕Å You do not have any active appointment/token for today.\n\nWould you like to book an appointment?",

    tokenStatus: (token, date, slot, position) =>
      `≡ƒÄƒ∩╕Å *Your Token: ${token}*\n\n≡ƒôà Date: ${date}\n≡ƒòÉ Slot: ${slot}\n≡ƒæÑ Patients ahead of you: ${position}`,

    myDetails: (name, phone, lang) =>
      `≡ƒæñ *Your Details*\n\nName: ${name}\nPhone: ${phone}\nLanguage: ${lang === "hi" ? "Hindi" : "English"}`,

    languageChanged:
      "≡ƒîÉ Language changed successfully.",

    invalidInput:
      "ΓÜá∩╕Å Sorry, I didn't understand that.\n\nPlease choose one of the available options.",

    back:
      "Γ¼à∩╕Å Back",

    yes:
      "Yes",

    no:
      "No"
  },


  hi: {

    welcome:
      `*${CLINIC_NAME}* αñ«αÑçαñé αñåαñ¬αñòαñ╛ αñ╕αÑìαñ╡αñ╛αñùαññ αñ╣αÑê ≡ƒÅÑ\n\nαñòαÑâαñ¬αñ»αñ╛ αñàαñ¬αñ¿αÑÇ αñ¬αñ╕αñéαñªαÑÇαñªαñ╛ αñ¡αñ╛αñ╖αñ╛ αñÜαÑüαñ¿αÑçαñé:`,

    langEnglish: "≡ƒç¼≡ƒçº English",
    langHindi: "≡ƒç«≡ƒç│ αñ╣αñ┐αñéαñªαÑÇ",

    askName:
      "αñ¼αñ╣αÑüαññ αñ¼αñóαñ╝αñ┐αñ»αñ╛! αñòαÑâαñ¬αñ»αñ╛ αñàαñ¬αñ¿αñ╛ *αñ¬αÑéαñ░αñ╛ αñ¿αñ╛αñ«* αñ¡αÑçαñ£αÑçαñéαÑñ",

    invalidName:
      "αñòαÑâαñ¬αñ»αñ╛ αñ╕αñ╣αÑÇ αñ¿αñ╛αñ« αñªαñ░αÑìαñ£ αñòαñ░αÑçαñéαÑñ",

    askPhone:
      "αñºαñ¿αÑìαñ»αñ╡αñ╛αñª! αñòαÑâαñ¬αñ»αñ╛ αñàαñ¬αñ¿αñ╛ *10 αñàαñéαñòαÑïαñé αñòαñ╛ αñ«αÑïαñ¼αñ╛αñçαñ▓ αñ¿αñéαñ¼αñ░* αñ¡αÑçαñ£αÑçαñéαÑñ",

    invalidPhone:
      "αñòαÑâαñ¬αñ»αñ╛ αñ╕αñ╣αÑÇ 10 αñàαñéαñòαÑïαñé αñòαñ╛ αñ«αÑïαñ¼αñ╛αñçαñ▓ αñ¿αñéαñ¼αñ░ αñªαñ░αÑìαñ£ αñòαñ░αÑçαñéαÑñ",

    registrationDone: (name) =>
      `αñºαñ¿αÑìαñ»αñ╡αñ╛αñª, *${name}*!\n\nαñåαñ¬αñòαñ╛ αñ░αñ£αñ┐αñ╕αÑìαñƒαÑìαñ░αÑçαñ╢αñ¿ αñ¬αÑéαñ░αñ╛ αñ╣αÑï αñùαñ»αñ╛ αñ╣αÑê Γ£à`,

    mainMenuButton: "≡ƒôï αñ«αÑüαñûαÑìαñ» αñ«αÑçαñ¿αÑé",

    book: "≡ƒôà αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñ¼αÑüαñò αñòαñ░αÑçαñé",
    timing: "≡ƒæ¿ΓÇìΓÜò∩╕Å αñíαÑëαñòαÑìαñƒαñ░ αñòαñ╛ αñ╕αñ«αñ»",
    emergency: "≡ƒÜ¿ αñçαñ«αñ░αñ£αÑçαñéαñ╕αÑÇ",
    token: "≡ƒÄƒ∩╕Å αñƒαÑïαñòαñ¿ / αñòαññαñ╛αñ░ αñ╕αÑìαñÑαñ┐αññαñ┐",
    language: "≡ƒîÉ αñ¡αñ╛αñ╖αñ╛ αñ¼αñªαñ▓αÑçαñé",
    details: "≡ƒæñ αñ«αÑçαñ░αÑÇ αñ£αñ╛αñ¿αñòαñ╛αñ░αÑÇ",

    mainMenu: "≡ƒÅá αñ«αÑüαñûαÑìαñ» αñ«αÑçαñ¿αÑé",

    chooseDate:
      "≡ƒôà αñòαÑâαñ¬αñ»αñ╛ αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñòαÑç αñ▓αñ┐αñÅ αññαñ╛αñ░αÑÇαñû αñÜαÑüαñ¿αÑçαñé:",

    chooseDateButton:
      "αññαñ╛αñ░αÑÇαñû αñÜαÑüαñ¿αÑçαñé",

    chooseSlot:
      "≡ƒòÉ αñòαÑâαñ¬αñ»αñ╛ αñëαñ¬αñ▓αñ¼αÑìαñº αñ╕αñ«αñ» αñÜαÑüαñ¿αÑçαñé:",

    noSlots:
      "αñòαÑìαñ╖αñ«αñ╛ αñòαñ░αÑçαñé, αñçαñ╕ αññαñ╛αñ░αÑÇαñû αñòαÑç αñ▓αñ┐αñÅ αñòαÑïαñê αñ╕αÑìαñ▓αÑëαñƒ αñëαñ¬αñ▓αñ¼αÑìαñº αñ¿αñ╣αÑÇαñé αñ╣αÑêαÑñ",

    confirmAppointment: (date, slot) =>
      `αñòαÑâαñ¬αñ»αñ╛ αñàαñ¬αñ¿αñ╛ αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñòαñ¿αÑìαñ½αñ░αÑìαñ« αñòαñ░αÑçαñé:\n\n≡ƒôà αññαñ╛αñ░αÑÇαñû: *${date}*\n≡ƒòÉ αñ╕αñ«αñ»: *${slot}*\n≡ƒæ¿ΓÇìΓÜò∩╕Å αñíαÑëαñòαÑìαñƒαñ░: *${DOCTOR_NAME}*`,

    confirmYes: "Γ£à αñòαñ¿αÑìαñ½αñ░αÑìαñ«",
    confirmNo: "Γ¥î αñòαÑêαñéαñ╕αñ▓",

    appointmentBooked: (token, date, slot) =>
      `≡ƒÄë *αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñ╕αñ½αñ▓αññαñ╛αñ¬αÑéαñ░αÑìαñ╡αñò αñ¼αÑüαñò αñ╣αÑï αñùαñ»αñ╛!*\n\n≡ƒÄƒ∩╕Å αñƒαÑïαñòαñ¿ αñ¿αñéαñ¼αñ░: *${token}*\n≡ƒôà αññαñ╛αñ░αÑÇαñû: *${date}*\n≡ƒòÉ αñ╕αñ«αñ»: *${slot}*\n≡ƒæ¿ΓÇìΓÜò∩╕Å αñíαÑëαñòαÑìαñƒαñ░: *${DOCTOR_NAME}*\n\nαñòαÑâαñ¬αñ»αñ╛ αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñ╕αÑç αñòαÑüαñ¢ αñ«αñ┐αñ¿αñƒ αñ¬αñ╣αñ▓αÑç αñ¬αñ╣αÑüαñéαñÜαÑçαñéαÑñ ≡ƒÖÅ`,

    appointmentCancelled:
      "Γ¥î αñåαñ¬αñòαñ╛ αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñòαÑêαñéαñ╕αñ▓ αñòαñ░ αñªαñ┐αñ»αñ╛ αñùαñ»αñ╛ αñ╣αÑêαÑñ\n\nαñåαñ¬ αñ«αÑüαñûαÑìαñ» αñ«αÑçαñ¿αÑé αñ╕αÑç αñªαÑïαñ¼αñ╛αñ░αñ╛ αñ╢αÑüαñ░αÑé αñòαñ░ αñ╕αñòαññαÑç αñ╣αÑêαñéαÑñ",

    doctorTiming:
      `≡ƒæ¿ΓÇìΓÜò∩╕Å *${DOCTOR_NAME} - αñíαÑëαñòαÑìαñƒαñ░ αñòαñ╛ αñ╕αñ«αñ»*\n\nαñ╕αÑïαñ«αñ╡αñ╛αñ░ - αñ╢αñ¿αñ┐αñ╡αñ╛αñ░\n≡ƒòÖ αñ╕αÑüαñ¼αñ╣ 10:00 - αñªαÑïαñ¬αñ╣αñ░ 1:00\n≡ƒòö αñ╢αñ╛αñ« 5:00 - αñ░αñ╛αññ 8:00\n\nαñ░αñ╡αñ┐αñ╡αñ╛αñ░: αñ¼αñéαñª`,

    emergency:
      "≡ƒÜ¿ *αñçαñ«αñ░αñ£αÑçαñéαñ╕αÑÇ αñ╕αñ╣αñ╛αñ»αññαñ╛*\n\nαñàαñùαñ░ αñ»αñ╣ αñ£αñ╛αñ¿αñ▓αÑçαñ╡αñ╛ αñ«αÑçαñíαñ┐αñòαñ▓ αñçαñ«αñ░αñ£αÑçαñéαñ╕αÑÇ αñ╣αÑê, αññαÑï αññαÑüαñ░αñéαññ αñ¿αñ£αñªαÑÇαñòαÑÇ αñàαñ╕αÑìαñ¬αññαñ╛αñ▓ αñ»αñ╛ αñçαñ«αñ░αñ£αÑçαñéαñ╕αÑÇ αñ╕αÑçαñ╡αñ╛ αñ╕αÑç αñ╕αñéαñ¬αñ░αÑìαñò αñòαñ░αÑçαñéαÑñ\n\nWhatsApp αñ£αñ╡αñ╛αñ¼ αñòαñ╛ αñçαñéαññαñ£αñ╛αñ░ αñ¿ αñòαñ░αÑçαñéαÑñ",

    emergencyRecorded:
      "≡ƒÜ¿ αñåαñ¬αñòαÑÇ αñçαñ«αñ░αñ£αÑçαñéαñ╕αÑÇ αñ░αñ┐αñòαÑìαñ╡αÑçαñ╕αÑìαñƒ αñ░αñ┐αñòαÑëαñ░αÑìαñí αñòαñ░ αñ▓αÑÇ αñùαñê αñ╣αÑêαÑñ\n\nαñòαÑâαñ¬αñ»αñ╛ αññαÑüαñ░αñéαññ αñ¿αñ£αñªαÑÇαñòαÑÇ αñçαñ«αñ░αñ£αÑçαñéαñ╕αÑÇ αñ«αÑçαñíαñ┐αñòαñ▓ αñ╕αÑçαñ╡αñ╛ αñ╕αÑç αñ╕αñéαñ¬αñ░αÑìαñò αñòαñ░αÑçαñéαÑñ αñ╣αñ«αñ╛αñ░αÑÇ αñƒαÑÇαñ« αñåαñ¬αñòαÑÇ αñ░αñ┐αñòαÑìαñ╡αÑçαñ╕αÑìαñƒ αñ£αñ▓αÑìαñª αñ╕αÑç αñ£αñ▓αÑìαñª αñªαÑçαñûαÑçαñùαÑÇαÑñ",

    noToken:
      "≡ƒÄƒ∩╕Å αñåαñ£ αñòαÑç αñ▓αñ┐αñÅ αñåαñ¬αñòαñ╛ αñòαÑïαñê αñÅαñòαÑìαñƒαñ┐αñ╡ αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ/αñƒαÑïαñòαñ¿ αñ¿αñ╣αÑÇαñé αñ╣αÑêαÑñ\n\nαñòαÑìαñ»αñ╛ αñåαñ¬ αñàαñ¬αÑëαñçαñéαñƒαñ«αÑçαñéαñƒ αñ¼αÑüαñò αñòαñ░αñ¿αñ╛ αñÜαñ╛αñ╣αññαÑç αñ╣αÑêαñé?",

    tokenStatus: (token, date, slot, position) =>
      `≡ƒÄƒ∩╕Å *αñåαñ¬αñòαñ╛ αñƒαÑïαñòαñ¿: ${token}*\n\n≡ƒôà αññαñ╛αñ░αÑÇαñû: ${date}\n≡ƒòÉ αñ╕αñ«αñ»: ${slot}\n≡ƒæÑ αñåαñ¬αñ╕αÑç αñåαñùαÑç αñ«αñ░αÑÇαñ£: ${position}`,

    myDetails: (name, phone, lang) =>
      `≡ƒæñ *αñåαñ¬αñòαÑÇ αñ£αñ╛αñ¿αñòαñ╛αñ░αÑÇ*\n\nαñ¿αñ╛αñ«: ${name}\nαñ½αÑïαñ¿: ${phone}\nαñ¡αñ╛αñ╖αñ╛: ${lang === "hi" ? "αñ╣αñ┐αñéαñªαÑÇ" : "English"}`,

    languageChanged:
      "≡ƒîÉ αñ¡αñ╛αñ╖αñ╛ αñ╕αñ½αñ▓αññαñ╛αñ¬αÑéαñ░αÑìαñ╡αñò αñ¼αñªαñ▓ αñªαÑÇ αñùαñê αñ╣αÑêαÑñ",

    invalidInput:
      "ΓÜá∩╕Å αñ«αñ╛αñ½ αñòαÑÇαñ£αñ┐αñÅ, αñ«αÑêαñé αñçαñ╕αÑç αñ╕αñ«αñ¥ αñ¿αñ╣αÑÇαñé αñ¬αñ╛αñ»αñ╛αÑñ\n\nαñòαÑâαñ¬αñ»αñ╛ αñëαñ¬αñ▓αñ¼αÑìαñº αñ╡αñ┐αñòαñ▓αÑìαñ¬αÑïαñé αñ«αÑçαñé αñ╕αÑç αñÜαÑüαñ¿αÑçαñéαÑñ",

    back:
      "Γ¼à∩╕Å αñ╡αñ╛αñ¬αñ╕",

    yes:
      "αñ╣αñ╛αñü",

    no:
      "αñ¿αñ╣αÑÇαñé"
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


  console.log("Γ£à Database schema verified/created successfully.");
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
  "Γ£à WhatsApp API Response:",
  response.data
);

  } catch (error) {

    console.error(
      "Γ¥î WhatsApp API Error:",
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

  console.log("≡ƒÜ¿ SENDLIST RECEIVED:", JSON.stringify({
  to,
  body,
  buttonText,
  sections
}, null, 2));

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
    "≡ƒôñ LIST ROW COUNT:",
    payload.interactive.action.sections[0].rows.length
  );

  console.log(
    "≡ƒôñ LIST ROWS:",
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

    `≡ƒîÉ Select Language / αñ¡αñ╛αñ╖αñ╛ αñÜαÑüαñ¿αÑçαñé`,

    [
      {
        id: "LANG_EN",
        title: "≡ƒç¼≡ƒçº English"
      },
      {
        id: "LANG_HI",
        title: "≡ƒç«≡ƒç│ αñ╣αñ┐αñéαñªαÑÇ"
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
        ? (lang === "hi" ? "αñåαñ£" : "Today")
        : i === 1
          ? (lang === "hi" ? "αñòαñ▓" : "Tomorrow")
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
        title: lang === "hi" ? "αñëαñ¬αñ▓αñ¼αÑìαñº αññαñ╛αñ░αÑÇαñûαÑçαñé" : "Available Dates",
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

    `${t.chooseSlot}\n\n≡ƒôà ${formatDate(date)}`,

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

    console.log("Γ£à WhatsApp webhook verified.");

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
    /^[A-Za-z├Ç-├┐\u0900-\u097F\s.'-]+$/.test(cleaned)
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
      ? "≡ƒÜ¿ αñòαÑìαñ»αñ╛ αñåαñ¬ Emergency Booking αñòαñ░αñ¿αñ╛ αñÜαñ╛αñ╣αññαÑç αñ╣αÑêαñé?"
      : "≡ƒÜ¿ Do you want to make an Emergency Booking?"
  );
console.log("≡ƒÜ¿ EMERGENCY SENDLIST DATA:", JSON.stringify([
  {
    title: "SmartClinic",
    rows: [
      {
        id: "EMERGENCY_YES",
        title: lang === "hi" ? "αñ╣αñ╛αñü" : "YES"
      },
      {
        id: "EMERGENCY_NO",
        title: lang === "hi" ? "αñ¿αñ╣αÑÇαñé" : "NO"
      }
    ]
  }
], null, 2));

  await sendList(
    phone,
    lang === "hi" ? "αñ╡αñ┐αñòαñ▓αÑìαñ¬ αñÜαÑüαñ¿αÑçαñé" : "Choose an option",
    lang === "hi" ? "αñÜαÑüαñ¿αÑçαñé" : "Select",
    [
      {
        title: "SmartClinic",
        rows: [
          {
            id: "EMERGENCY_YES",
            title: lang === "hi" ? "αñ╣αñ╛αñü" : "YES"
          },
          {
            id: "EMERGENCY_NO",
            title: lang === "hi" ? "αñ¿αñ╣αÑÇαñé" : "NO"
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
   PART 2B ΓÇö APPOINTMENT + TOKEN FLOW
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
            ? " αñòαÑâαñ¬αñ»αñ╛ αñ«αñ░αÑÇαñ£ αñòαñ╛ *αñ¬αÑéαñ░αñ╛ αñ¿αñ╛αñ«* αñ¡αÑçαñ£αÑçαñéαÑñ"
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
    `≡ƒô⌐ Message received from ${phone}:`,
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
        ? "ΓÜá∩╕Å αñòαÑâαñ¬αñ»αñ╛ αñ«αñ░αÑÇαñ£ αñòαñ╛ αñ╕αñ╣αÑÇ αñ¬αÑéαñ░αñ╛ αñ¿αñ╛αñ« αñ¡αÑçαñ£αÑçαñéαÑñ"
        : "ΓÜá∩╕Å Please enter the patient's full name."
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
      ? "≡ƒô▒ αñòαÑâαñ¬αñ»αñ╛ αñ«αñ░αÑÇαñ£ αñòαñ╛ *10-digit phone number* αñ¡αÑçαñ£αÑçαñéαÑñ"
      : "≡ƒô▒ Please send the patient's *10-digit phone number*."
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
        ? "ΓÜá∩╕Å αñòαÑâαñ¬αñ»αñ╛ αñ«αñ░αÑÇαñ£ αñòαñ╛ αñ╕αñ╣αÑÇ *10 αñàαñéαñòαÑïαñé αñòαñ╛ αñ«αÑïαñ¼αñ╛αñçαñ▓ αñ¿αñéαñ¼αñ░* αñ¡αÑçαñ£αÑçαñéαÑñ"
        : "ΓÜá∩╕Å Please send a valid *10-digit phone number*."
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
      ? "≡ƒÜ¿ αñòαÑâαñ¬αñ»αñ╛ Emergency αñòαÑÇ αñ£αñ╛αñ¿αñòαñ╛αñ░αÑÇ αñ¡αÑçαñ£αÑçαñéαÑñ\n\nαñ»αñ╣ αñ£αñ╛αñ¿αñòαñ╛αñ░αÑÇ *αñ╡αÑêαñòαñ▓αÑìαñ¬αñ┐αñò* αñ╣αÑêαÑñ\n\nαñàαñùαñ░ αñ£αñ╛αñ¿αñòαñ╛αñ░αÑÇ αñ¿αñ╣αÑÇαñé αñªαÑçαñ¿αñ╛ αñÜαñ╛αñ╣αññαÑç αñ╣αÑêαñé αññαÑï *skip* αñ▓αñ┐αñûαÑçαñéαÑñ"
      : "≡ƒÜ¿ Please provide the emergency details.\n\nThis information is *optional*.\n\nIf you don't want to provide details, type *skip*."
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
      ? `Γ£à *αñåαñ¬αñòαÑÇ Emergency Booking αñ╕αñ½αñ▓αññαñ╛αñ¬αÑéαñ░αÑìαñ╡αñò αñ¬αÑéαñ░αÑÇ αñ╣αÑï αñùαñê αñ╣αÑêαÑñ*\n\n≡ƒæñ αñ«αñ░αÑÇαñ£ αñòαñ╛ αñ¿αñ╛αñ«: ${patientName}\n≡ƒô₧ αñ«αÑïαñ¼αñ╛αñçαñ▓ αñ¿αñéαñ¼αñ░: ${patientPhone}\n≡ƒÜ¿ Emergency Details: ${emergencyDetails || "αñ¬αÑìαñ░αñªαñ╛αñ¿ αñ¿αñ╣αÑÇαñé αñòαÑÇ αñùαñê"}\n\n≡ƒÅÑ αñåαñ¬αñòαñ╛ Emergency αñàαñ¿αÑüαñ░αÑïαñº αñªαñ░αÑìαñ£ αñ╣αÑï αñùαñ»αñ╛ αñ╣αÑêαÑñ`
      : `Γ£à *Your Emergency Booking has been completed successfully.*\n\n≡ƒæñ Patient Name: ${patientName}\n≡ƒô₧ Phone Number: ${patientPhone}\n≡ƒÜ¿ Emergency Details: ${emergencyDetails || "Not provided"}\n\n≡ƒÅÑ Your emergency request has been recorded.`
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
        lower.includes("αñ╣αñ┐αñéαñªαÑÇ")
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
      lower.includes("αñ╣αñ┐αñéαñªαÑÇ")
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
        "Γ¥î SLOT DECODE ERROR:",
        error
      );

      slot = "";
    }

    if (!slot) {
      console.error(
        "Γ¥î SLOT VALUE EMPTY:",
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
      "Γ£à SELECTED SLOT:",
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
      lower === "αñ╣αñ╛αñü"
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
      lower === "αñ¿αñ╣αÑÇαñé"
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
      lower === "αñ«αÑüαñûαÑìαñ» αñ«αÑçαñ¿αÑé"
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
        "Γ¥î Message processing error:",
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
          `≡ƒÅÑ ${CLINIC_NAME} WhatsApp bot running on port ${PORT}`
        );

        console.log(
          `≡ƒîÉ Webhook: http://localhost:${PORT}/webhook`
        );

        console.log(
          `Γ¥ñ∩╕Å Health: http://localhost:${PORT}/health`
        );
      }
    );

  } catch (error) {
console.error("Γ¥î FAILED TO START SERVER");
console.error(error);
console.error(error?.stack);

    process.exit(1);
  }
}


startServer();


/* =========================================================
   END OF SMARTCLINIC AI SERVER
========================================================= */
