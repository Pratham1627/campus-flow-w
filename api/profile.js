// api/profile.js - Vercel Serverless Function
import axios from "axios";
import * as cheerio from "cheerio";

/**
 * scrapeProfile(username, password)
 * - returns { ok: true, profile: { name, enrollmentNo, rollNo, ... } }
 * - or { ok: false, error: "..." }
 */
async function scrapeProfile(username, password) {
  const BASE_URL = "https://portal.lnct.ac.in/";
  const LOGIN_URL = BASE_URL + "Accsoft2/StudentLogin.aspx";
  const PARENT_URL = BASE_URL + "Accsoft2/Parents/ParentDesk1.aspx";
  const PROFILE_URL = BASE_URL + "Accsoft2/Parents/StudentPersonalDetails.aspx";

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36",
    Accept: "*/*",
    "X-MicrosoftAjax": "Delta=true",
    "X-Requested-With": "XMLHttpRequest",
    Origin: BASE_URL,
    Referer: LOGIN_URL,
  };

  try {
    // Step 1: Fetch login page (to get tokens)
    const loginPage = await axios.get(LOGIN_URL, { headers });
    const cookies = loginPage.headers["set-cookie"] || [];
    const $ = cheerio.load(loginPage.data);

    const viewState = $("#__VIEWSTATE").val() || "";
    const eventValidation = $("#__EVENTVALIDATION").val() || "";
    const viewGen = $("#__VIEWSTATEGENERATOR").val() || "";

    // Step 2: Attempt login
    const form = new URLSearchParams({
      "ctl00$ScriptManager1": "ctl00$cph1$UpdatePanel5|ctl00$cph1$btnStuLogin",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": viewState,
      "__VIEWSTATEGENERATOR": viewGen,
      "__EVENTVALIDATION": eventValidation,
      "ctl00$cph1$rdbtnlType": "2",
      "ctl00$cph1$txtStuUser": username,
      "ctl00$cph1$txtStuPsw": password,
      "__ASYNCPOST": "true",
      "ctl00$cph1$btnStuLogin": "Login >>",
    });

    const loginRes = await axios.post(LOGIN_URL, form.toString(), {
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: cookies.join("; "),
      },
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: () => true,
    });

    const newCookies = loginRes.headers["set-cookie"] || [];
    const combinedCookies = [...cookies, ...newCookies];

    // Step 3: Check if login redirected / succeeded
    if (!loginRes.data.includes("ParentDesk1.aspx")) {
      return { ok: false, error: "Login failed" };
    }

    // Step 4: Visit ParentDesk page to finalize session
    await axios.get(PARENT_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    // Step 5: Visit Profile page
    const profileRes = await axios.get(PROFILE_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    const $$ = cheerio.load(profileRes.data);
    
    // Extract profile information using the IDs from your HTML file
    const studentName = $$("#ctl00_ContentPlaceHolder1_txtStudName").attr("value") || "";
    const enrollmentNo = $$("#ctl00_ContentPlaceHolder1_txtUEnrollNo").attr("value") || "";
    const rollNo = $$("#ctl00_ContentPlaceHolder1_txtBoardRollNo").attr("value") || "";
    const scholarNo = $$("#ctl00_ContentPlaceHolder1_txtEnrollNo").attr("value") || "";
    const dob = $$("#ctl00_ContentPlaceHolder1_txtDOB").attr("value") || "";
    const gender = $$("#ctl00_ContentPlaceHolder1_drdGender").find("option[selected]").attr("value") || "";
    const email = $$("#ctl00_ContentPlaceHolder1_txtSEmail").attr("value") || "";
    const mobile = $$("#ctl00_ContentPlaceHolder1_txtSMob").attr("value") || "";
    const section = $$("#ctl00_ContentPlaceHolder1_drdSection").find("option[selected]").text().trim() || "";
    
    // Additional fields from the HTML
    const fatherName = $$("#ctl00_ContentPlaceHolder1_txtFName").attr("value") || "";
    const motherName = $$("#ctl00_ContentPlaceHolder1_txtMName").attr("value") || "";
    const address = $$("#ctl00_ContentPlaceHolder1_txtPAddress").val() || "";
    const city = $$("#ctl00_ContentPlaceHolder1_txtPCity").attr("value") || "";
    const pinCode = $$("#ctl00_ContentPlaceHolder1_txtPPin").attr("value") || "";

    if (!studentName && !enrollmentNo && !rollNo) {
      return { ok: false, error: "Profile not accessible" };
    }

    return {
      ok: true,
      profile: {
        name: studentName,
        enrollmentNo: enrollmentNo,
        rollNo: rollNo,
        scholarNo: scholarNo,
        dob: dob,
        gender: gender,
        email: email,
        mobile: mobile,
        section: section,
        fatherName: fatherName,
        motherName: motherName,
        address: address,
        city: city,
        pinCode: pinCode,
      },
    };
  } catch (err) {
    // surface useful error where possible
    const message = err && err.message ? err.message : "Unknown scraper error";
    return { ok: false, error: "Scraper error: " + message };
  }
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Missing credentials" });
  }

  try {
    const result = await scrapeProfile(username, password);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
