import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import axios from "npm:axios";
import * as cheerio from "npm:cheerio";

async function fetchAttendance(userId: string, password: string) {
  const baseUrl = "https://erp.aitpune.edu.in/";
  const loginUrl = baseUrl + "Login.aspx";

  const client = axios.create({
    withCredentials: true,
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  // STEP 1: Load login page to get VIEWSTATE
  const loginPage = await client.get(loginUrl);
  const $ = cheerio.load(loginPage.data);

  const viewState = $("#__VIEWSTATE").val() || "";
  const eventValidation = $("#__EVENTVALIDATION").val() || "";
  const viewStateGen = $("#__VIEWSTATEGENERATOR").val() || "";

  // STEP 2: Submit login form
  const loginPayload = new URLSearchParams({
    "__VIEWSTATE": viewState,
    "__VIEWSTATEGENERATOR": viewStateGen,
    "__EVENTVALIDATION": eventValidation,
    "txtUserName": userId,
    "txtPassword": password,
    "btnLogin": "Login",
  });

  const loginResponse = await client.post(loginUrl, loginPayload);

  if (!loginResponse.data.includes("StudentDashboard")) {
    return { ok: false, message: "Invalid credentials" };
  }

  // STEP 3: Hit attendance page
  const attendanceUrl =
    baseUrl + "Academics/StudentAttendanceSummary.aspx?acdyear=2024-25";

  const attendancePage = await client.get(attendanceUrl);
  const $$ = cheerio.load(attendancePage.data);

  const rows = [];
  $$("#gvAttendance tr").each((i, el) => {
    if (i === 0) return; // skip header
    const tds = $$(el).find("td");
    if (tds.length >= 5) {
      rows.push({
        subject: $$(tds[0]).text().trim(),
        conducted: $$(tds[1]).text().trim(),
        attended: $$(tds[2]).text().trim(),
        percentage: $$(tds[3]).text().trim(),
      });
    }
  });

  return {
    ok: true,
    data: rows,
  };
}

// ============ SUPABASE EDGE HANDLER ============
serve(async (req) => {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ ok: false, message: "Missing username or password" }),
        { status: 400 },
      );
    }

    const result = await fetchAttendance(username, password);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, message: "Server error", error: String(e) }),
      { status: 500 },
    );
  }
});
