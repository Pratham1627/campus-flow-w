// Test script to debug the subject attendance scraper
import { scrapeSubjectAttendance } from "./subjectAttendance.js";

const username = "11151131778";
const password = "11151131778";

console.log("Testing subject attendance scraper...");
console.log("Username:", username);

scrapeSubjectAttendance(username, password)
  .then((result) => {
    console.log("\n=== RESULT ===");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.error("\n=== ERROR ===");
    console.error(err);
  });
