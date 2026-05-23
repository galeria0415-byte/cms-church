export const PH_REGIONS = [
  {
    code: "NCR",
    name: "NCR – National Capital Region",
    provinces: ["Metro Manila"],
    cities: [
      "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong", "Manila",
      "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig",
      "Pateros", "Quezon City", "San Juan", "Taguig", "Valenzuela",
    ],
  },
  {
    code: "CAR",
    name: "CAR – Cordillera Administrative Region",
    provinces: ["Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province"],
    cities: ["Baguio"],
  },
  {
    code: "I",
    name: "Region I – Ilocos Region",
    provinces: ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"],
    cities: ["Candon", "Laoag", "San Fernando", "Urdaneta", "Vigan"],
  },
  {
    code: "II",
    name: "Region II – Cagayan Valley",
    provinces: ["Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"],
    cities: ["Cauayan", "Ilagan", "Santiago", "Tuguegarao"],
  },
  {
    code: "III",
    name: "Region III – Central Luzon",
    provinces: ["Aurora", "Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales"],
    cities: ["Angeles", "Balanga", "Cabanatuan", "Gapan", "Malolos", "Muñoz", "Olongapo", "Palayan", "San Fernando", "San Jose", "Tarlac"],
  },
  {
    code: "IV-A",
    name: "Region IV-A – CALABARZON",
    provinces: ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
    cities: ["Antipolo", "Bacoor", "Batangas", "Biñan", "Calamba", "Cavite", "Dasmariñas", "General Trias", "Imus", "Lipa", "Lucena", "San Pablo", "San Pedro", "Santa Rosa", "Tagaytay", "Tanauan"],
  },
  {
    code: "IV-B",
    name: "Region IV-B – MIMAROPA",
    provinces: ["Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon"],
    cities: ["Puerto Princesa"],
  },
  {
    code: "V",
    name: "Region V – Bicol Region",
    provinces: ["Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon"],
    cities: ["Iriga", "Legazpi", "Ligao", "Masbate", "Naga", "Sorsogon", "Tabaco"],
  },
  {
    code: "VI",
    name: "Region VI – Western Visayas",
    provinces: ["Aklan", "Antique", "Capiz", "Guimaras", "Iloilo", "Negros Occidental"],
    cities: ["Bacolod", "Cadiz", "Escalante", "Himamaylan", "Iloilo", "Kabankalan", "La Carlota", "Roxas", "Sagay", "San Carlos", "Silay", "Talisay", "Victorias"],
  },
  {
    code: "VII",
    name: "Region VII – Central Visayas",
    provinces: ["Bohol", "Cebu", "Negros Oriental", "Siquijor"],
    cities: ["Bais", "Bayawan", "Canlaon", "Cebu", "Danao", "Dumaguete", "Lapu-Lapu", "Mandaue", "Naga", "Tagbilaran", "Talisay", "Toledo"],
  },
  {
    code: "VIII",
    name: "Region VIII – Eastern Visayas",
    provinces: ["Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte"],
    cities: ["Baybay", "Calbayog", "Catbalogan", "Maasin", "Ormoc", "Tacloban"],
  },
  {
    code: "IX",
    name: "Region IX – Zamboanga Peninsula",
    provinces: ["Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"],
    cities: ["Dapitan", "Dipolog", "Isabela City", "Pagadian", "Zamboanga"],
  },
  {
    code: "X",
    name: "Region X – Northern Mindanao",
    provinces: ["Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental"],
    cities: ["Cagayan de Oro", "El Salvador", "Gingoog", "Iligan", "Malaybalay", "Oroquieta", "Ozamiz", "Tangub", "Valencia"],
  },
  {
    code: "XI",
    name: "Region XI – Davao Region",
    provinces: ["Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental"],
    cities: ["Davao", "Digos", "Island Garden City of Samal", "Mati", "Panabo", "Samal", "Tagum"],
  },
  {
    code: "XII",
    name: "Region XII – SOCCSKSARGEN",
    provinces: ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"],
    cities: ["Cotabato", "General Santos", "Kidapawan", "Koronadal", "Tacurong"],
  },
  {
    code: "XIII",
    name: "Region XIII – Caraga",
    provinces: ["Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur"],
    cities: ["Bislig", "Butuan", "Cabadbaran", "Surigao", "Tandag"],
  },
  {
    code: "BARMM",
    name: "BARMM – Bangsamoro Autonomous Region",
    provinces: ["Basilan", "Lanao del Sur", "Maguindanao del Norte", "Maguindanao del Sur", "Sulu", "Tawi-Tawi"],
    cities: ["Cotabato", "Lamitan", "Marawi"],
  },
] as const;

export const PH_CITIZENSHIPS = [
  "Filipino",
  "Chinese-Filipino",
  "American",
  "Australian",
  "British",
  "Canadian",
  "Japanese",
  "Korean",
  "Spanish",
  "Other",
] as const;

export const EDUCATION_LEVELS = [
  "Elementary",
  "High School (Junior)",
  "High School (Senior/SHS)",
  "Vocational / Technical",
  "College / Bachelor's Degree",
  "Post-Graduate / Master's Degree",
  "Doctorate",
  "No Formal Education",
  "Other",
] as const;

export const EMPLOYMENT_STATUSES = [
  "Full-time Employed",
  "Part-time Employed",
  "Self-employed",
  "Business Owner",
  "OFW (Overseas Filipino Worker)",
  "Unemployed",
  "Student",
  "Retired",
  "Homemaker",
  "Other",
] as const;
