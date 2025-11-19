import { scrapeAttendance } from "./attendance.js";

console.log("Module loaded successfully");
console.log(typeof scrapeAttendance);

setTimeout(() => {
  console.log("Still running after 5 seconds");
}, 5000);
