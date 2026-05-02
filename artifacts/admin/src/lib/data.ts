export type ApprovalStatus = "approved" | "pending" | "rejected";

export interface Provider {
  id: string;
  name: string;
  categoryIds: string[];
  description: string;
  location: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  yearsActive: number;
  phone: string;
  services: string[];
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  submittedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const MOCK_CATEGORIES: Category[] = [
  {"id":"electrical","name":"Electrical","color":"#F59E0B"},
  {"id":"plumbing","name":"Plumbing","color":"#3B82F6"},
  {"id":"cctv","name":"CCTV & Security","color":"#8B5CF6"},
  {"id":"cleaning","name":"Cleaning","color":"#06B6D4"},
  {"id":"ac","name":"Air Conditioning","color":"#0EA5E9"},
  {"id":"generators","name":"Generators","color":"#EF4444"},
  {"id":"painting","name":"Painting","color":"#EC4899"},
  {"id":"carpentry","name":"Carpentry","color":"#92400E"},
  {"id":"landscaping","name":"Landscaping","color":"#10B981"}
];

export const MOCK_PROVIDERS: Provider[] = [
  {"id":"c1","name":"Gamtel Power Solutions","categoryIds":["electrical"],"description":"Leading electrical contractors in Greater Banjul with over 12 years of experience.","location":"Banjul","verified":true,"rating":4.8,"reviewCount":47,"completedJobs":89,"yearsActive":12,"phone":"+220 7001234","services":["Wiring & Rewiring","Distribution Boards","Solar Installations","Emergency Repairs","Generator Connections"],"approvalStatus":"approved","submittedAt":"2024-01-10T08:00:00Z"},
  {"id":"c2","name":"Banjul Electrical Contractors","categoryIds":["electrical"],"description":"Certified electrical engineers serving hotels, offices, and homes in Serekunda.","location":"Serekunda","verified":true,"rating":4.6,"reviewCount":32,"completedJobs":61,"yearsActive":8,"phone":"+220 7012345","services":["New Installations","Fault Finding","LED Lighting","Cable Management","Safety Inspections"],"approvalStatus":"approved","submittedAt":"2024-01-15T09:00:00Z"},
  {"id":"c3","name":"Westside Plumbing Co","categoryIds":["plumbing"],"description":"Expert plumbing contractors operating across Kololi, Kotu, and the Atlantic coast.","location":"Kololi","verified":true,"rating":4.7,"reviewCount":28,"completedJobs":54,"yearsActive":9,"phone":"+220 7023456","services":["Pipe Installation","Leak Detection","Bathroom Fitting","Water Pumps","Drainage Systems"],"approvalStatus":"approved","submittedAt":"2024-01-20T10:00:00Z"},
  {"id":"c4","name":"Atlantic Water Works","categoryIds":["plumbing"],"description":"Reliable plumbing services for commercial properties and residences in Banjul.","location":"Banjul","verified":true,"rating":4.5,"reviewCount":19,"completedJobs":38,"yearsActive":6,"phone":"+220 7034567","services":["Plumbing Repairs","Water Tank Installation","Toilet Fitting","Waterproofing","Borehole Connections"],"approvalStatus":"approved","submittedAt":"2024-02-01T08:30:00Z"},
  {"id":"c5","name":"SecureVision Systems","categoryIds":["cctv"],"description":"The Gambia's most trusted CCTV and security company with 120+ installations.","location":"Kanifing","verified":true,"rating":4.9,"reviewCount":56,"completedJobs":120,"yearsActive":14,"phone":"+220 7045678","services":["CCTV Installation","IP Camera Systems","Access Control","Alarm Systems","Remote Monitoring"],"approvalStatus":"approved","submittedAt":"2024-02-05T11:00:00Z"},
  {"id":"c6","name":"Gambia Security Solutions","categoryIds":["cctv"],"description":"Professional security system installers with expertise in Hikvision and Dahua cameras.","location":"Banjul","verified":true,"rating":4.4,"reviewCount":23,"completedJobs":41,"yearsActive":5,"phone":"+220 7056789","services":["Camera Installation","DVR/NVR Setup","System Maintenance","Security Audits","Cabling"],"approvalStatus":"approved","submittedAt":"2024-02-10T09:30:00Z"},
  {"id":"c7","name":"SparkleClean Services","categoryIds":["cleaning"],"description":"Commercial and residential cleaning specialists serving hotels and NGOs in Banjul.","location":"Banjul","verified":true,"rating":4.6,"reviewCount":41,"completedJobs":93,"yearsActive":7,"phone":"+220 7067890","services":["Office Cleaning","Deep Cleaning","Hotel Housekeeping","Post-Construction Cleanup","Carpet Cleaning"],"approvalStatus":"approved","submittedAt":"2024-02-15T08:00:00Z"},
  {"id":"c8","name":"GreenLeaf Cleaning Co","categoryIds":["cleaning"],"description":"Eco-friendly cleaning company using biodegradable products.","location":"Serekunda","verified":false,"rating":4.2,"reviewCount":14,"completedJobs":28,"yearsActive":3,"phone":"+220 7078901","services":["Residential Cleaning","Office Cleaning","Window Washing","Sanitation Services"],"approvalStatus":"pending","submittedAt":"2024-03-01T10:00:00Z"},
  {"id":"c9","name":"CoolBreeze AC Services","categoryIds":["ac"],"description":"Authorised Daikin and Carrier service partner covering all of Greater Banjul.","location":"Banjul","verified":true,"rating":4.7,"reviewCount":35,"completedJobs":72,"yearsActive":10,"phone":"+220 7089012","services":["AC Installation","Servicing & Maintenance","Gas Recharge","Ducted Systems","Energy Audits"],"approvalStatus":"approved","submittedAt":"2024-02-20T11:00:00Z"},
  {"id":"c10","name":"Arctic Air Gambia","categoryIds":["ac"],"description":"Specialists in variable refrigerant flow systems for commercial buildings.","location":"Kololi","verified":false,"rating":0,"reviewCount":0,"completedJobs":0,"yearsActive":2,"phone":"+220 7090123","services":["VRF System Installation","Split AC Installation","Commercial HVAC","Preventive Maintenance"],"approvalStatus":"pending","submittedAt":"2024-03-05T14:00:00Z"},
  {"id":"c11","name":"PowerGen Gambia","categoryIds":["generators"],"description":"Full generator lifecycle services: supply, installation, and maintenance across The Gambia.","location":"Banjul","verified":true,"rating":4.8,"reviewCount":29,"completedJobs":58,"yearsActive":11,"phone":"+220 7001235","services":["Generator Supply","Installation","Servicing","Fuel Management","Emergency Repairs"],"approvalStatus":"approved","submittedAt":"2024-01-25T09:00:00Z"},
  {"id":"c12","name":"Brush & Roll Painters","categoryIds":["painting"],"description":"Interior and exterior painting specialists with a portfolio across major hotels in Senegambia.","location":"Senegambia","verified":true,"rating":4.5,"reviewCount":22,"completedJobs":45,"yearsActive":8,"phone":"+220 7012346","services":["Interior Painting","Exterior Painting","Wall Texturing","Waterproof Coating","Epoxy Floors"],"approvalStatus":"approved","submittedAt":"2024-02-08T10:00:00Z"},
  {"id":"c13","name":"Master Craft Joinery","categoryIds":["carpentry"],"description":"Custom furniture and joinery works for offices, hotels, and high-end residences.","location":"Banjul","verified":true,"rating":4.6,"reviewCount":18,"completedJobs":32,"yearsActive":9,"phone":"+220 7023457","services":["Custom Furniture","Kitchen Fitting","Office Fitout","Doors & Windows","Wooden Flooring"],"approvalStatus":"approved","submittedAt":"2024-01-30T08:30:00Z"},
  {"id":"c14","name":"Eden Gardens Landscaping","categoryIds":["landscaping"],"description":"Creating beautiful outdoor spaces for hotels, embassies, and corporate campuses.","location":"Fajara","verified":true,"rating":4.9,"reviewCount":31,"completedJobs":47,"yearsActive":12,"phone":"+220 7034568","services":["Garden Design","Lawn Maintenance","Irrigation Systems","Tree Surgery","Outdoor Lighting"],"approvalStatus":"approved","submittedAt":"2024-01-12T11:00:00Z"},
  {"id":"c15","name":"Riverside Contractors","categoryIds":["electrical","plumbing"],"description":"Multi-trade contractors handling complete building MEP works for commercial projects.","location":"Banjul","verified":false,"rating":0,"reviewCount":0,"completedJobs":0,"yearsActive":1,"phone":"+220 7045679","services":["Electrical Works","Plumbing","Building MEP","Project Management"],"approvalStatus":"pending","submittedAt":"2024-03-10T09:00:00Z"}
];