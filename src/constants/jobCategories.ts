export const JOB_CATEGORIES = {
  "Maintenance & Repairs": [
    "Plumber (tubero)",
    "Painter (pintor)",
    "Mason (meison)",
    "Welder",
    "Aircon technician",
    "Handyman (karpintero/all-around)",
    "Pest control",
    "Bodegero (warehouse/storage keeper)",
  ],
  "Care & Support": [
    "Nanny/yaya",
    "Kasambahay (general house help)",
    "Alalay (personal assistant/helper)",
    "Bantay (caretaker for elderly/children)",
    "Nurse (private duty)",
    "Therapist (home service)",
    "Ate/kuya (older sibling figure/helper)",
  ],
  "Household Management": [
    "Labandera (laundry person)",
    "Plantsa (ironing specialist)",
    "Tagalinis (cleaner)",
    "Katiwala (overseer/house manager)",
    "Messenger/errand boy",
  ],
  "Food Services": [
    "Kusinera/kusinero (cook)",
    "Katulong sa kusina (kitchen helper)",
    "Market buyer (tagabili)",
  ],
  "Property & Outdoor": [
    "Hardinero (gardener)",
    "Taga-linis ng pool",
    "Bantay-bahay (house watcher)",
    "Guwardiya (security guard)",
  ],
  Specialized: [
    "Tutor",
    "Modista/mananahi (seamstress)",
    "Driver/chofer",
    "Hilot (traditional massage therapist)",
    "Manicurist/pedicurist (home service)",
  ],
};

// Flatten all jobs into a single array for dropdown
export const ALL_JOB_OPTIONS = Object.values(JOB_CATEGORIES).flat();

// Helper function to get job category for a specific job
export const getJobCategory = (job: string): string | null => {
  for (const [category, jobs] of Object.entries(JOB_CATEGORIES)) {
    if (jobs.includes(job)) {
      return category;
    }
  }
  return null;
};
