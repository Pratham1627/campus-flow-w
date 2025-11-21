// testProfile.js - Test the profile scraper
import { scrapeProfile } from "./profile.js";

const username = "11151131778";
const password = "11151131778";

console.log("Testing profile scraper...");
console.log("Username:", username);

scrapeProfile(username, password)
  .then((result) => {
    if (result.ok) {
      console.log("\n✅ SUCCESS! Profile data:");
      console.log(JSON.stringify(result.profile, null, 2));
      
      console.log("\n📊 Key Information:");
      console.log("Name:", result.profile.name);
      console.log("Enrollment:", result.profile.enrollmentNo);
      console.log("Roll No:", result.profile.rollNo);
      console.log("Scholar No:", result.profile.scholarNo);
      console.log("Branch:", result.profile.branch);
      console.log("Semester:", result.profile.semester);
      console.log("Section:", result.profile.section);
      console.log("Email:", result.profile.email);
      console.log("Mobile:", result.profile.mobile);
      console.log("Father:", result.profile.fatherName);
      console.log("Mother:", result.profile.motherName);
      console.log("10th %:", result.profile.percentage10);
      console.log("12th %:", result.profile.percentage12);
    } else {
      console.error("\n❌ ERROR:", result.error);
    }
  })
  .catch((err) => {
    console.error("\n❌ EXCEPTION:", err.message);
    console.error(err);
  });
