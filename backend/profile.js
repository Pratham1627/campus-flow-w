// backend/profile.js
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://portal.lnct.ac.in/";
const LOGIN_URL = BASE_URL + "Accsoft2/StudentLogin.aspx";
const PARENT_DESK_URL = BASE_URL + "Accsoft2/Parents/ParentDesk1.aspx";
const PROFILE_PRINT_URL = BASE_URL + "Accsoft2/Parents/StudentProfilePrint.aspx";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

/**
 * scrapeProfile(username, password)
 * Scrapes student profile data from StudentProfilePrint.aspx
 * Returns comprehensive profile information including personal, academic, and parent details
 */
export async function scrapeProfile(username, password) {
  try {
    // Step 1: Fetch login page to get tokens
    const loginPage = await axios.get(LOGIN_URL, { headers });
    const cookies = loginPage.headers["set-cookie"] || [];
    const $ = cheerio.load(loginPage.data);

    const viewState = $("#__VIEWSTATE").val() || "";
    const eventValidation = $("#__EVENTVALIDATION").val() || "";
    const viewGen = $("#__VIEWSTATEGENERATOR").val() || "";

    // Step 2: Perform ScriptManager AJAX login (same as attendance.js)
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

    // Step 3: Verify login succeeded
    if (!loginRes.data.includes("ParentDesk1.aspx")) {
      return { ok: false, error: "Login failed - invalid credentials" };
    }

    // Step 4: Visit ParentDesk to establish session
    await axios.get(PARENT_DESK_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    // Step 5: Fetch profile print page
    // Note: This page may have a warning dialog, but since we're scraping HTML
    // the dialog won't prevent us from getting the data
    const profileRes = await axios.get(PROFILE_PRINT_URL, {
      headers: { ...headers, Cookie: combinedCookies.join("; ") },
    });

    const $profile = cheerio.load(profileRes.data);

    // Extract student information from span elements
    const profile = {
      // Basic Information
      name: $profile("#lblName").text().trim() || "",
      enrollmentNo: $profile("#lblEnrolment").text().trim() || "",
      rollNo: $profile("#lblRoll").text().trim() || "",
      scholarNo: $profile("#lblScholar").text().trim() || "",
      gender: $profile("#lblGender").text().trim() || "",
      
      // Academic Information
      class: $profile("#lblClass").text().trim() || "",
      section: $profile("#lblSection").text().trim() || "",
      
      // Personal Information
      dob: $profile("#lblDOB").text().trim() || "",
      aadharNo: $profile("#lblAadhar").text().trim() || "",
      email: $profile("#lblStudentEmail").text().trim() || "",
      category: $profile("#lblCategory").text().trim() || "",
      mobile: $profile("#lblStudentMobile").text().trim() || "",
      bloodGroup: $profile("#lblBlood").text().trim() || "",
      birthPlace: $profile("#lblBirthPlace").text().trim() || "",
      motherTongue: $profile("#lblMotherTongue").text().trim() || "",
      nationality: $profile("#lblNationality").text().trim() || "",
      religion: $profile("#lblreligion").text().trim() || "",
      samagraId: $profile("#lblSamagra").text().trim() || "",
      maritalStatus: $profile("#lblMaritalStatus").text().trim() || "",
      aadharMobile: $profile("#lblAadharMob").text().trim() || "",
      abcId: $profile("#lblAbcID").text().trim() || "",
      
      // Parent Information
      fatherName: $profile("#lblFName").text().trim() || "",
      fatherOccupation: $profile("#lblOccupationF").text().trim() || "",
      fatherMobile: $profile("#lblFMobile").text().trim() || "",
      motherName: $profile("#lblMName").text().trim() || "",
      motherOccupation: $profile("#lblOccupationM").text().trim() || "",
      motherMobile: $profile("#lblMMobNo").text().trim() || "",
      
      // Address Information
      permanentAddress: $profile("#lblAddress").text().trim() || "",
      permanentCity: $profile("#lblPCity").text().trim() || "",
      permanentState: $profile("#lblState").text().trim() || "",
      permanentPin: $profile("#lblPinNo").text().trim() || "",
      permanentPhone: $profile("#lblPPhone").text().trim() || "",
      localAddress: $profile("#lblLAddress").text().trim() || "",
      localCity: $profile("#lblLCity").text().trim() || "",
      localState: $profile("#lblLState").text().trim() || "",
      
      // 10th Details
      school10Name: $profile("#lblSchoolName").text().trim() || "",
      board10: $profile("#lbl10thBoard").text().trim() || "",
      year10: $profile("#lbl0thYear").text().trim() || "",
      roll10: $profile("#lbl10thRoll").text().trim() || "",
      obtain10: $profile("#lb10thObtain").text().trim() || "",
      total10: $profile("#lbl10thTotal").text().trim() || "",
      percentage10: $profile("#lbl10thPer").text().trim() || "",
      resultStatus10: $profile("#lblResultStatus").text().trim() || "",
      
      // 12th Details
      school12Name: $profile("#lbl12thSchoolName").text().trim() || "",
      board12: $profile("#lbl12thBoard").text().trim() || "",
      year12: $profile("#lbl12thYear").text().trim() || "",
      roll12: $profile("#lbl12thRoll").text().trim() || "",
      obtain12: $profile("#lbl12thObtain").text().trim() || "",
      total12: $profile("#lbl12thTotal").text().trim() || "",
      percentage12: $profile("#lbl12thPer").text().trim() || "",
      stream12: $profile("#lblStreamSubj").text().trim() || "",
      resultStatus12: $profile("#lbl12ResultStatus").text().trim() || "",
      
      // Graduation Details
      collegeName: $profile("#lblCollegeName").text().trim() || "",
      university: $profile("#lblUniversity").text().trim() || "",
      graduationYear: $profile("#lblYear").text().trim() || "",
      graduationRoll: $profile("#lblRollC").text().trim() || "",
      graduationObtain: $profile("#lblObtainC").text().trim() || "",
      graduationTotal: $profile("#lblTotalMarksC").text().trim() || "",
      graduationCGPA: $profile("#lblCGPA").text().trim() || "",
      graduationRank: $profile("#lblRankGradDivRes").text().trim() || "",
      graduationStream: $profile("#lblCourStreamGradu").text().trim() || "",
      
      // Diploma Details
      diplomaCollegeName: $profile("#lblDiplomaCollegeName").text().trim() || "",
      diplomaUniversity: $profile("#lblDiplomaUniversity").text().trim() || "",
      diplomaYear: $profile("#lblDiplomaYear").text().trim() || "",
      diplomaRoll: $profile("#lblDiplomaRoll").text().trim() || "",
      diplomaObtain: $profile("#lblDiplomaObtain").text().trim() || "",
      diplomaTotal: $profile("#lblDiplomaTotal").text().trim() || "",
      diplomaCGPA: $profile("#lblDiplomaCGPA").text().trim() || "",
      
      // Qualified Exam Details
      qualifiedExamName: $profile("#lblQlfdExamName").text().trim() || "",
      qualifiedExamRoll: $profile("#lblQlfdExamRollNo").text().trim() || "",
      qualifiedExamRank: $profile("#lblQlfdExamRank").text().trim() || "",
      qualifiedExamQuota: $profile("#lblQlfdExamQuota").text().trim() || "",
      qualifiedExamMarks: $profile("#lblQlfdExamMarks").text().trim() || "",
      
      // Photo URL (from img src)
      photoUrl: $profile("#imgphoto").attr("src") || "",
    };

    // Parse class field to extract branch and semester
    // Format: "B.Tech - C.S.E.- I.O.T. & Cyber Security-5th Sem"
    const classText = profile.class;
    let branch = "";
    let semester = "";
    
    if (classText) {
      const parts = classText.split("-");
      if (parts.length >= 3) {
        // Extract branch (everything between first and last dash)
        branch = parts.slice(1, parts.length - 1).join("-").trim();
        // Extract semester (last part)
        const semPart = parts[parts.length - 1].trim();
        semester = semPart.replace("Sem", "").trim();
      }
    }
    
    profile.branch = branch;
    profile.semester = semester;

    // Validate we got some data
    if (!profile.name && !profile.enrollmentNo) {
      return { ok: false, error: "No profile data found" };
    }

    console.log("[DEBUG] Profile scraped successfully:", {
      name: profile.name,
      enrollment: profile.enrollmentNo,
      branch: profile.branch,
      semester: profile.semester
    });

    return {
      ok: true,
      profile,
    };
  } catch (err) {
    const message = err && err.message ? err.message : "Unknown scraper error";
    console.error("[ERROR] Profile scraper error:", message);
    return { ok: false, error: "Scraper error: " + message };
  }
}
