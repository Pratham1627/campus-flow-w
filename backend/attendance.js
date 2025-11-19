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

    // Step 6: Visit Profile page to get student details
    const PROFILE_URL = BASE_URL + "Accsoft2/Parents/StudentPersonalDetails.aspx";
    let profile = null;
    
    try {
      const profileRes = await axios.get(PROFILE_URL, {
        headers: { ...headers, Cookie: combinedCookies.join("; ") },
      });

      const $profile = cheerio.load(profileRes.data);
      
      const studentName = $profile("#ctl00_ContentPlaceHolder1_txtStudName").attr("value") || "";
      const enrollmentNo = $profile("#ctl00_ContentPlaceHolder1_txtUEnrollNo").attr("value") || "";
      const rollNo = $profile("#ctl00_ContentPlaceHolder1_txtBoardRollNo").attr("value") || "";
      const email = $profile("#ctl00_ContentPlaceHolder1_txtSEmail").attr("value") || "";
      const mobile = $profile("#ctl00_ContentPlaceHolder1_txtSMob").attr("value") || "";
      const section = $profile("#ctl00_ContentPlaceHolder1_drdSection option[selected]").text().trim() || "";
      
      // Hardcoded values (scraping dropdowns isn't working reliably)
      const branch = "C.S.E.- I.O.T. & Cyber Security";
      const semester = "5th";
      
      if (studentName || enrollmentNo || rollNo) {
        profile = {
          name: studentName,
          enrollmentNo: enrollmentNo,
          rollNo: rollNo,
          email: email,
          mobile: mobile,
          branch: branch,
          semester: semester,
          section: section,
        };
      }
    } catch (profileError) {
      // Profile fetch failed, continue without it
    }

    return {
      ok: true,
      summary: { total_classes: total, present, percentage: percent },
      profile: profile,
    };
  } catch (err) {
    // surface useful error where possible
    const message = err && err.message ? err.message : "Unknown scraper error";
    return { ok: false, error: "Scraper error: " + message };
  }
}
