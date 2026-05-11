import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../../../.env") });

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { providersTable, reviewsTable } from "./schema/index.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const COMPANIES = [
  { id: "c1", name: "Gamtel Power Solutions", categoryIds: ["electrical"], description: "Leading electrical contractors in Greater Banjul with over 12 years of experience. We handle industrial, commercial and residential projects with full compliance to national electrical standards.", location: "Banjul", verified: true, rating: 4.8, reviewCount: 47, completedJobs: 89, yearsActive: 12, phone: "+220 7001234", services: ["Wiring & Rewiring", "Distribution Boards", "Solar Installations", "Emergency Repairs", "Generator Connections"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c2", name: "Banjul Electrical Contractors", categoryIds: ["electrical"], description: "Certified electrical engineers serving hotels, offices, and homes in Serekunda.", location: "Serekunda", verified: true, rating: 4.6, reviewCount: 32, completedJobs: 61, yearsActive: 8, phone: "+220 7012345", services: ["New Installations", "Fault Finding", "LED Lighting", "Cable Management", "Safety Inspections"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c3", name: "Westside Plumbing Co", categoryIds: ["plumbing"], description: "Expert plumbing contractors operating across Kololi, Kotu, and the Atlantic coast.", location: "Kololi", verified: true, rating: 4.7, reviewCount: 28, completedJobs: 54, yearsActive: 9, phone: "+220 7023456", services: ["Pipe Installation", "Leak Detection", "Bathroom Fitting", "Water Pumps", "Drainage Systems"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c4", name: "Atlantic Water Works", categoryIds: ["plumbing"], description: "Reliable plumbing services for commercial properties and residences in Banjul.", location: "Banjul", verified: true, rating: 4.5, reviewCount: 19, completedJobs: 38, yearsActive: 6, phone: "+220 7034567", services: ["Plumbing Repairs", "Water Tank Installation", "Toilet Fitting", "Waterproofing", "Borehole Connections"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c5", name: "SecureVision Systems", categoryIds: ["cctv"], description: "The Gambia's most trusted CCTV and security company. Over 120 systems installed across hotels, banks, schools, and government buildings.", location: "Kanifing", verified: true, rating: 4.9, reviewCount: 56, completedJobs: 120, yearsActive: 14, phone: "+220 7045678", services: ["CCTV Installation", "IP Camera Systems", "Access Control", "Alarm Systems", "Remote Monitoring"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c6", name: "Gambia Security Solutions", categoryIds: ["cctv"], description: "Professional security system installers with expertise in Hikvision and Dahua camera systems.", location: "Banjul", verified: true, rating: 4.4, reviewCount: 23, completedJobs: 41, yearsActive: 5, phone: "+220 7056789", services: ["Camera Installation", "DVR/NVR Setup", "System Maintenance", "Security Audits", "Cabling"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c7", name: "ProClean Gambia", categoryIds: ["cleaning"], description: "Premium commercial cleaning company trusted by hotels, offices, and NGOs.", location: "Serekunda", verified: true, rating: 4.8, reviewCount: 41, completedJobs: 95, yearsActive: 7, phone: "+220 7067890", services: ["Office Cleaning", "Deep Cleaning", "Post-Construction", "Carpet Cleaning", "Window Cleaning"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c8", name: "Shine Cleaning Services", categoryIds: ["cleaning"], description: "Affordable and professional cleaning services for homes and small businesses in Kololi.", location: "Kololi", verified: true, rating: 4.5, reviewCount: 17, completedJobs: 33, yearsActive: 4, phone: "+220 7078901", services: ["House Cleaning", "Move-in/Move-out", "Kitchen Deep Clean", "Bathroom Sanitization"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c9", name: "CoolAir Gambia", categoryIds: ["ac"], description: "Authorized installers for Midea, Samsung, and LG air conditioning systems.", location: "Banjul", verified: true, rating: 4.7, reviewCount: 35, completedJobs: 78, yearsActive: 10, phone: "+220 7089012", services: ["AC Installation", "Servicing & Maintenance", "Gas Refilling", "Repairs", "Multi-Split Systems"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c10", name: "ArcticBreeze Services", categoryIds: ["ac"], description: "Fast, affordable air conditioning installation and repair. Same-day service available.", location: "Serekunda", verified: true, rating: 4.5, reviewCount: 22, completedJobs: 46, yearsActive: 6, phone: "+220 7090123", services: ["Split Unit Installation", "AC Cleaning", "Breakdown Repairs", "Annual Contracts"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c11", name: "PowerGen Gambia", categoryIds: ["generators"], description: "Specialists in generator supply, installation, and maintenance. Authorized Perkins and Cummins dealer.", location: "Kanifing", verified: true, rating: 4.8, reviewCount: 39, completedJobs: 82, yearsActive: 11, phone: "+220 7001357", services: ["Generator Supply", "Installation & Commission", "Preventive Maintenance", "Emergency Repairs", "Load Calculations"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c12", name: "Reliable Power Co", categoryIds: ["generators"], description: "Practical generator solutions for small and medium businesses.", location: "Banjul", verified: true, rating: 4.3, reviewCount: 15, completedJobs: 29, yearsActive: 5, phone: "+220 7002468", services: ["Generator Sales", "Installation", "Servicing", "Fuel Management"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c13", name: "Artisan Painters Gambia", categoryIds: ["painting"], description: "High-quality interior and exterior painting for commercial and residential properties.", location: "Serekunda", verified: true, rating: 4.7, reviewCount: 26, completedJobs: 58, yearsActive: 8, phone: "+220 7003579", services: ["Interior Painting", "Exterior Painting", "Textured Finishes", "Waterproofing Coatings", "Epoxy Floors"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c14", name: "Gambia Master Carpenters", categoryIds: ["carpentry"], description: "The finest custom carpentry in The Gambia. From hotel reception desks to bespoke home furniture.", location: "Banjul", verified: true, rating: 4.9, reviewCount: 44, completedJobs: 97, yearsActive: 15, phone: "+220 7004680", services: ["Custom Furniture", "Kitchen Cabinets", "Doors & Windows", "Roofing Frames", "Office Fitouts"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
  { id: "c15", name: "Green Gambia Landscapes", categoryIds: ["landscaping"], description: "Professional garden design and landscaping for hotels, resorts, and private estates.", location: "Kololi", verified: true, rating: 4.6, reviewCount: 21, completedJobs: 45, yearsActive: 7, phone: "+220 7005791", services: ["Garden Design", "Lawn Maintenance", "Irrigation Systems", "Tree Planting", "Hardscaping"], approvalStatus: "approved" as const, submitterName: "", submitterEmail: "" },
];

const REVIEWS = [
  { id: "r1", companyId: "c1", userId: "u1", userName: "Fatou Jallow", rating: 5, comment: "Excellent work on our hotel's electrical system. Very professional and completed on time.", date: "2026-03-15" },
  { id: "r2", companyId: "c1", userId: "u2", userName: "Lamin Dibba", rating: 5, comment: "Fixed our distribution board quickly. Would highly recommend to any business.", date: "2026-02-28" },
  { id: "r3", companyId: "c2", userId: "u14", userName: "Nyima Jallow", rating: 4, comment: "Good electrical team. Completed the rewiring of our office efficiently.", date: "2026-04-08" },
  { id: "r4", companyId: "c3", userId: "u11", userName: "Binta Jammeh", rating: 5, comment: "Westside fixed a major leak in our hotel quickly. Called them at 10pm and they responded.", date: "2026-03-30" },
  { id: "r5", companyId: "c5", userId: "u3", userName: "Aminata Ceesay", rating: 5, comment: "SecureVision installed 24 cameras across our property. Exceptional service and clean cabling.", date: "2026-04-02" },
  { id: "r6", companyId: "c5", userId: "u4", userName: "Omar Sanneh", rating: 5, comment: "The best CCTV company in Banjul. Professional team, great pricing.", date: "2026-03-18" },
  { id: "r7", companyId: "c5", userId: "u16", userName: "Seedy Drammeh", rating: 5, comment: "Highly professional installation. Our school now has full coverage.", date: "2026-01-22" },
  { id: "r8", companyId: "c7", userId: "u5", userName: "Isatou Touray", rating: 5, comment: "ProClean transformed our office. Spotless results and they brought all their own equipment.", date: "2026-04-10" },
  { id: "r9", companyId: "c7", userId: "u6", userName: "Bakary Gaye", rating: 4, comment: "Good service overall. Thorough cleaning and the team was polite and efficient.", date: "2026-03-25" },
  { id: "r10", companyId: "c9", userId: "u7", userName: "Mariama Barry", rating: 5, comment: "Installed 8 AC units in our guesthouse. Great workmanship and competitive pricing.", date: "2026-03-08" },
  { id: "r11", companyId: "c10", userId: "u15", userName: "Pa Sowe", rating: 4, comment: "Quick response for our AC breakdown. Fixed it same day which was impressive.", date: "2026-03-12" },
  { id: "r12", companyId: "c11", userId: "u8", userName: "Ousman Jobe", rating: 5, comment: "PowerGen handled our 100KVA generator installation perfectly. Reliable and professional.", date: "2026-04-15" },
  { id: "r13", companyId: "c13", userId: "u12", userName: "Sering Ndong", rating: 5, comment: "Beautiful textured finish on our walls. The team was tidy and worked quickly.", date: "2026-04-05" },
  { id: "r14", companyId: "c14", userId: "u9", userName: "Hawa Kanteh", rating: 5, comment: "Our custom reception desk and cabinets are stunning. True craftsmen.", date: "2026-04-01" },
  { id: "r15", companyId: "c14", userId: "u10", userName: "Modou Faye", rating: 5, comment: "Best carpenters in The Gambia, no question. Delivered exactly what we wanted.", date: "2026-02-20" },
  { id: "r16", companyId: "c15", userId: "u13", userName: "Adama Camara", rating: 5, comment: "Our resort gardens look incredible after Green Gambia redesigned them. Truly talented.", date: "2026-03-22" },
];

async function main() {
  console.log("Seeding providers...");
  for (const c of COMPANIES) {
    await db.insert(providersTable).values(c).onConflictDoNothing();
  }
  console.log(`  ${COMPANIES.length} providers inserted (skipped if already present)`);

  console.log("Seeding reviews...");
  for (const r of REVIEWS) {
    await db.insert(reviewsTable).values(r).onConflictDoNothing();
  }
  console.log(`  ${REVIEWS.length} reviews inserted (skipped if already present)`);

  console.log("Done.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
