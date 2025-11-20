// api/subject-attendance.js - Vercel Serverless Function
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://portal.lnct.ac.in/";
const LOGIN_URL = BASE_URL + "Accsoft2/StudentLogin.aspx";
const PARENT_DESK_URL = BASE_URL + "Accsoft2/Parents/ParentDesk1.aspx";
const ATTENDANCE_STATUS_URL = BASE_URL + "Accsoft2/Parents/StuAttendanceStatus.aspx";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36",
  "Accept": "*/*",
  "X-MicrosoftAjax": "Delta=true",
  "X-Requested-With": "XMLHttpRequest",
  Origin: BASE_URL,
  Referer: LOGIN_URL,
};

async function scrapeSubjectAttendance(username, password) {
  try {
    // Step 1: Fetch login page
    const loginPage = await axios.get(LOGIN_URL, { headers });
    const cookies = loginPage.headers["set-cookie"] || [];
    const $ = cheerio.load(loginPage.data);

    const viewState = $("#__VIEWSTATE").val() || "";
    const eventValidation = $("#__EVENTVALIDATION").val() || "";
    const viewGen = $("#__VIEWSTATEGENERATOR").val() || "";

    // Step 2: Login
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

    if (!loginRes.data.includes("ParentDesk1.aspx")) {
      return { ok: false, error: "Login failed - invalid credentials" };
    }

    // Step 3: Visit ParentDesk
    await axios.get(PARENT_DESK_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    // Step 4: Get attendance page
    const attendanceRes = await axios.get(ATTENDANCE_STATUS_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    const $att = cheerio.load(attendanceRes.data);
    
    const attViewState = $att("#__VIEWSTATE").val() || "";
    const attEventValidation = $att("#__EVENTVALIDATION").val() || "";
    const attViewGen = $att("#__VIEWSTATEGENERATOR").val() || "";
    
    // Step 5: Click Subject Wise link
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
    
    const subjects = [];
    
    $attendance("table[id*='grd'] tbody tr, table[id*='grd'] tr").each((i, row) => {
      if (i === 0) return;
      
      const $row = cheerio.load(row);
      const cells = $row("td");
      
      if (cells.length >= 3) {
        const subjectName = $row(cells[0]).text().trim();
        const classesHeld = parseInt($row(cells[1]).text().trim()) || 0;
        const classesAttended = parseInt($row(cells[2]).text().trim()) || 0;
        
        if (!classesHeld && !classesAttended) return;
        
        const percentage = classesHeld > 0 
          ? ((classesAttended / classesHeld) * 100).toFixed(2)
          : 0;
        
        subjects.push({
          subjectName,
          shortName: subjectName,
          classesHeld,
          classesAttended,
          classesAbsent: classesHeld - classesAttended,
          attendancePercentage: parseFloat(percentage),
        });
      }
    });

    if (subjects.length === 0) {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Missing credentials" });
  }

  try {
    const result = await scrapeSubjectAttendance(username, password);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
