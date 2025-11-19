// backend/attendance.js
import axios from "axios";
import * as cheerio from "cheerio";

/**
 * scrapeAttendance(username, password)
 * - returns { ok: true, summary: { total_classes, present, percentage } }
 * - or { ok: false, error: "..." }
 */
export async function scrapeAttendance(username, password) {
  const BASE_URL = "https://portal.lnct.ac.in/";
  const LOGIN_URL = BASE_URL + "Accsoft2/StudentLogin.aspx";
  const PARENT_URL = BASE_URL + "Accsoft2/Parents/ParentDesk1.aspx";
  const ATTENDANCE_URL =
    BASE_URL + "Accsoft2/Parents/StuAttendanceStatus.aspx";

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

    // Step 5: Visit Attendance page
    const attRes = await axios.get(ATTENDANCE_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    const $$ = cheerio.load(attRes.data);
    const total = $$("#ctl00_ctl00_ContentPlaceHolder1_cp2_lbltotperiod111")
      .text()
      .trim();
    const present = $$("#ctl00_ctl00_ContentPlaceHolder1_cp2_lbltotalp11")
      .text()
      .trim();
    const percent = $$("#ctl00_ctl00_ContentPlaceHolder1_cp2_lblPer119")
      .text()
      .trim();

    if (!total && !present && !percent) {
      return { ok: false, error: "Attendance not accessible" };
    }

    return {
      ok: true,
      summary: { total_classes: total, present, percentage: percent },
    };
  } catch (err) {
    // surface useful error where possible
    const message = err && err.message ? err.message : "Unknown scraper error";
    return { ok: false, error: "Scraper error: " + message };
  }
}
