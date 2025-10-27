import { create } from "zustand";
import { persist } from "zustand/middleware";
import { finalizeKindTaoOnboarding } from "@/actions/onboarding/finalize-kindtao-onboarding";
import { JobPreferences } from "@/components/modals/JobPreferencesModal";

export type KindTaoPersonalInfo = {
  day: string;
  month: string;
  year: string;
  gender: string;
  location: string;
  barangay: string;
  municipality: string;
  province: string;
  zipCode?: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  highestEducationalAttainment?: string;
};

export type KindTaoSkillsAvailability = {
  skills: string[];
  availabilitySchedule: Record<
    string,
    { available: boolean; timeSlot: string; morning: boolean; evening: boolean }
  >;
  languages?: string[];
};

export type KindTaoWorkEntry = {
  jobTitle: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description?: string;
  isCurrentJob: boolean;
  location?: string;
  skillsUsed?: string[];
  notes?: string;
};

export type KindTaoDocument = {
  id: string;
  file: File;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type KindTaoOnboardingState = {
  personalInfo: KindTaoPersonalInfo | null;
  skillsAvailability: KindTaoSkillsAvailability | null;
  jobPreferences: JobPreferences | null;
  workHistory: KindTaoWorkEntry[];
  documents: KindTaoDocument[];
  setPersonalInfo: (data: KindTaoPersonalInfo) => void;
  setSkillsAvailability: (data: KindTaoSkillsAvailability) => void;
  setJobPreferences: (data: JobPreferences) => void;
  setWorkHistory: (entries: KindTaoWorkEntry[]) => void;
  addDocument: (document: KindTaoDocument) => void;
  updateDocument: (id: string, updates: Partial<KindTaoDocument>) => void;
  removeDocument: (id: string) => void;
  reset: () => void;
};

export const useKindTaoOnboardingStore = create<KindTaoOnboardingState>()(
  persist(
    (set, get) => ({
      personalInfo: null,
      skillsAvailability: null,
      jobPreferences: null,
      workHistory: [],
      documents: [],
      setPersonalInfo: (data) => set({ personalInfo: data }),
      setSkillsAvailability: (data) => set({ skillsAvailability: data }),
      setJobPreferences: (data) => set({ jobPreferences: data }),
      setWorkHistory: (entries) => set({ workHistory: entries }),
      addDocument: (document) =>
        set((state) => ({ documents: [...state.documents, document] })),
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
        })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        })),
      reset: () =>
        set({
          personalInfo: null,
          skillsAvailability: null,
          jobPreferences: null,
          workHistory: [],
          documents: [],
        }),
    }),
    {
      name: "kindtao-onboarding-storage",
      partialize: (state) => ({
        personalInfo: state.personalInfo,
        skillsAvailability: state.skillsAvailability,
        jobPreferences: state.jobPreferences,
        workHistory: state.workHistory,
        documents: state.documents,
      }),
    }
  )
);
