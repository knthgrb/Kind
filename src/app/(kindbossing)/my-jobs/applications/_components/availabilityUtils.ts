export interface AvailabilityDay {
  evening: boolean;
  morning: boolean;
  timeSlot: string;
  available: boolean;
}

export interface AvailabilitySchedule {
  [day: string]: AvailabilityDay;
}

export const parseAvailabilitySchedule = (
  schedule: string | Record<string, any> | null
): AvailabilitySchedule | null => {
  if (!schedule) return null;

  try {
    let parsed: Record<string, any>;

    if (typeof schedule === "string") {
      parsed = JSON.parse(schedule);
    } else {
      parsed = schedule;
    }

    return parsed as AvailabilitySchedule;
  } catch (error) {
    console.error("Error parsing availability schedule:", error);
    return null;
  }
};

export const formatAvailabilitySchedule = (
  schedule: AvailabilitySchedule | null
): { days: string[]; timeSlots: { day: string; times: string[] }[] } | null => {
  if (!schedule) return null;

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const dayNames: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const availableDays: string[] = [];
  const scheduleMap: { day: string; times: string[] }[] = [];

  daysOfWeek.forEach((day) => {
    if (schedule[day]?.available) {
      const dayData = schedule[day];
      const times: string[] = [];

      if (dayData.morning) times.push("Morning");
      if (dayData.evening) times.push("Evening");

      if (times.length > 0) {
        availableDays.push(dayNames[day]);
        scheduleMap.push({ day: dayNames[day], times });
      }
    }
  });

  return {
    days: availableDays,
    timeSlots: scheduleMap,
  };
};

export const getAvailabilitySummary = (
  schedule: AvailabilitySchedule | null
): string => {
  if (!schedule) return "Not specified";

  const formatted = formatAvailabilitySchedule(schedule);
  if (!formatted || formatted.days.length === 0) return "Not specified";

  if (formatted.days.length === 7) return "Available all week";

  if (formatted.days.length <= 3) {
    return `Available ${formatted.days.join(", ")}`;
  }

  return `${formatted.days.length} days available per week`;
};
