/**
 * Philippine Region and Province Mapping
 * Maps provinces to their corresponding regions for better job matching
 */

export interface RegionInfo {
  region: string;
  regionCode: string;
  provinces: string[];
}

export const PHILIPPINE_REGIONS: RegionInfo[] = [
  {
    region: "National Capital Region",
    regionCode: "NCR",
    provinces: [
      "Metro Manila", // Special case - NCR is treated as one unit for job matching
    ],
  },
  {
    region: "Cordillera Administrative Region",
    regionCode: "CAR",
    provinces: [
      "Abra",
      "Apayao",
      "Benguet",
      "Ifugao",
      "Kalinga",
      "Mountain Province",
    ],
  },
  {
    region: "Ilocos Region",
    regionCode: "Region I",
    provinces: ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"],
  },
  {
    region: "Cagayan Valley",
    regionCode: "Region II",
    provinces: ["Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"],
  },
  {
    region: "Central Luzon",
    regionCode: "Region III",
    provinces: [
      "Aurora",
      "Bataan",
      "Bulacan",
      "Nueva Ecija",
      "Pampanga",
      "Tarlac",
      "Zambales",
    ],
  },
  {
    region: "CALABARZON",
    regionCode: "Region IV-A",
    provinces: ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
  },
  {
    region: "MIMAROPA",
    regionCode: "Region IV-B",
    provinces: [
      "Marinduque",
      "Occidental Mindoro",
      "Oriental Mindoro",
      "Palawan",
      "Romblon",
    ],
  },
  {
    region: "Bicol Region",
    regionCode: "Region V",
    provinces: [
      "Albay",
      "Camarines Norte",
      "Camarines Sur",
      "Catanduanes",
      "Masbate",
      "Sorsogon",
    ],
  },
  {
    region: "Western Visayas",
    regionCode: "Region VI",
    provinces: [
      "Aklan",
      "Antique",
      "Capiz",
      "Guimaras",
      "Iloilo",
      "Negros Occidental",
    ],
  },
  {
    region: "Central Visayas",
    regionCode: "Region VII",
    provinces: ["Bohol", "Cebu", "Negros Oriental", "Siquijor"],
  },
  {
    region: "Eastern Visayas",
    regionCode: "Region VIII",
    provinces: [
      "Biliran",
      "Eastern Samar",
      "Leyte",
      "Northern Samar",
      "Samar",
      "Southern Leyte",
    ],
  },
  {
    region: "Zamboanga Peninsula",
    regionCode: "Region IX",
    provinces: [
      "Zamboanga del Norte",
      "Zamboanga del Sur",
      "Zamboanga Sibugay",
    ],
  },
  {
    region: "Northern Mindanao",
    regionCode: "Region X",
    provinces: [
      "Bukidnon",
      "Camiguin",
      "Lanao del Norte",
      "Misamis Occidental",
      "Misamis Oriental",
    ],
  },
  {
    region: "Davao Region",
    regionCode: "Region XI",
    provinces: [
      "Davao del Norte",
      "Davao del Sur",
      "Davao Occidental",
      "Davao Oriental",
      "Davao de Oro",
    ],
  },
  {
    region: "SOCCSKSARGEN",
    regionCode: "Region XII",
    provinces: ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"],
  },
  {
    region: "Caraga",
    regionCode: "Region XIII",
    provinces: [
      "Agusan del Norte",
      "Agusan del Sur",
      "Dinagat Islands",
      "Surigao del Norte",
      "Surigao del Sur",
    ],
  },
  {
    region: "Bangsamoro Autonomous Region",
    regionCode: "BARMM",
    provinces: ["Basilan", "Lanao del Sur", "Maguindanao", "Sulu", "Tawi-Tawi"],
  },
];

/**
 * Get region information for a given province
 */
export function getRegionForProvince(province: string): RegionInfo | null {
  if (!province) return null;

  const normalizedProvince = province.toLowerCase().trim();

  for (const region of PHILIPPINE_REGIONS) {
    const matchingProvince = region.provinces.find(
      (p) =>
        p.toLowerCase().trim() === normalizedProvince ||
        p.toLowerCase().includes(normalizedProvince) ||
        normalizedProvince.includes(p.toLowerCase())
    );

    if (matchingProvince) {
      return region;
    }
  }

  return null;
}

/**
 * Check if two provinces are in the same region
 */
export function areProvincesInSameRegion(
  province1: string,
  province2: string
): boolean {
  const region1 = getRegionForProvince(province1);
  const region2 = getRegionForProvince(province2);

  return !!(region1 && region2 && region1.regionCode === region2.regionCode);
}

/**
 * Get all provinces in a region
 */
export function getProvincesInRegion(regionCode: string): string[] {
  const region = PHILIPPINE_REGIONS.find((r) => r.regionCode === regionCode);
  return region ? region.provinces : [];
}

/**
 * Extract province from location string
 */
export function extractProvinceFromLocation(location: string): string | null {
  if (!location) return null;

  const locationLower = location.toLowerCase().trim();

  // Check against all provinces
  for (const region of PHILIPPINE_REGIONS) {
    for (const province of region.provinces) {
      if (
        locationLower.includes(province.toLowerCase()) ||
        province.toLowerCase().includes(locationLower)
      ) {
        return province;
      }
    }
  }

  return null;
}

/**
 * Get all available regions for dropdown/selection
 */
export function getAllRegions(): Array<{
  value: string;
  label: string;
  code: string;
}> {
  return PHILIPPINE_REGIONS.map((region) => ({
    value: region.region,
    label: region.region,
    code: region.regionCode,
  }));
}

/**
 * Get all provinces for a specific region
 */
export function getProvincesForRegion(
  regionCode: string
): Array<{ value: string; label: string }> {
  const region = PHILIPPINE_REGIONS.find((r) => r.regionCode === regionCode);
  if (!region) return [];

  return region.provinces.map((province) => ({
    value: province,
    label: province,
  }));
}
