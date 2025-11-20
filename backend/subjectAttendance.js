// backend/subjectAttendance.js
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://portal.lnct.ac.in/";
const LOGIN_URL = BASE_URL + "Accsoft2/StudentLogin.aspx";
const PARENT_DESK_URL = BASE_URL + "Accsoft2/Parents/ParentDesk1.aspx";
const ATTENDANCE_STATUS_URL = BASE_URL + "Accsoft2/Parents/StuAttendanceStatus.aspx";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

export async function scrapeSubjectAttendance(username, password) {
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
      return { ok: false, error: "Login failed - invalid credentials" };
    }

    // Step 4: Visit ParentDesk page to finalize session
    await axios.get(PARENT_DESK_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    // Step 5: Visit Attendance page
    const attendanceRes = await axios.get(ATTENDANCE_STATUS_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    const $att = cheerio.load(attendanceRes.data);
    
    // Get tokens for post back
    const attViewState = $att("#__VIEWSTATE").val() || "";
    const attEventValidation = $att("#__EVENTVALIDATION").val() || "";
    const attViewGen = $att("#__VIEWSTATEGENERATOR").val() || "";
    
    // Step 6: Click "Subject Wise" link/button to get subject table
    // Looking for link ID that might be lnkSubwise or similar
    const subjectForm = new URLSearchParams({
      "ctl00$ScriptManager1": "ctl00$ctl00$ContentPlaceHolder1$cp2$UpdatePanel1|ctl00$ctl00$ContentPlaceHolder1$cp2$lnkSubwise",
      "__EVENTTARGET": "ctl00$ctl00$ContentPlaceHolder1$cp2$lnkSubwise",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": attViewState,
      "__VIEWSTATEGENERATOR": attViewGen,
      "__EVENTVALIDATION": attEventValidation,
      "__ASYNCPOST": "true",
    });

    const subjectRes = await axios.post(ATTENDANCE_STATUS_URL, subjectForm.toString(), {
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: combinedCookies.join("; "),
      },
    });

    const $attendance = cheerio.load(subjectRes.data);
    
    // Parse the subject-wise attendance table
    // The table ID is like ctl00_ContentPlaceHolder1_grdsubwise129
    const subjects = [];
    
    // Debug: Check what tables exist
    const allTables = [];
    $attendance("table").each((i, el) => {
      const id = $attendance(el).attr("id") || "no-id";
      const className = $attendance(el).attr("class") || "no-class";
      allTables.push({ id, className });
    });
    console.log("[DEBUG] Found tables:", allTables);
    
    // Try multiple selectors
    const tableSelectors = [
      "table[id*='grdsubwise']",
      "table.mGrid",
      "table[id*='grd']",
      "table"
    ];
    
    for (const selector of tableSelectors) {
      $attendance(`${selector} tbody tr, ${selector} tr`).each((i, row) => {
        // Skip header row
        if (i === 0) return;
        
        const $row = cheerio.load(row);
        const cells = $row("td");
        
        if (cells.length >= 3) {
          const subjectName = $row(cells[0]).text().trim();
          // The table structure is: Subject Name | Classes Held | Classes Attended
          const classesHeld = parseInt($row(cells[1]).text().trim()) || 0;
          const classesAttended = parseInt($row(cells[2]).text().trim()) || 0;
          const shortName = subjectName;  // Use subject name as short name
          
          // Skip if this looks like header text or empty
          if (!classesHeld && !classesAttended) return;
          
          const percentage = classesHeld > 0 
            ? ((classesAttended / classesHeld) * 100).toFixed(2)
            : 0;
          
          subjects.push({
            subjectName,
            shortName,
            classesHeld,
            classesAttended,
            classesAbsent: classesHeld - classesAttended,
            attendancePercentage: parseFloat(percentage),
          });
        }
      });
      
      if (subjects.length > 0) {
        console.log("[DEBUG] Found subjects with selector:", selector);
        break;
      }
    }

    if (subjects.length === 0) {
      console.log("[DEBUG] No subjects found. Response length:", subjectRes.data.length);
      return { ok: false, error: "No subject attendance data found" };
    }

    return {
      ok: true,
      subjects,
    };
  } catch (err) {
    const message = err && err.message ? err.message : "Unknown scraper error";
    return { ok: false, error: "Scraper error: " + message };
  }
}
