/**
 * Utility functions to format work schedule data from JSONB
 */

export interface WorkSchedule {
  days: string[];
  time_slots: string[];
  hours_per_day: number;
}

export interface FormattedWorkSchedule {
  days: string[];
  hours: string;
  summary: string;
}

/**
 * Format work schedule from JSONB object to human-readable format
 */
export function formatWorkSchedule(
  workSchedule: any
): FormattedWorkSchedule | null {
  if (!workSchedule) return null;

  // If it's already a string, return it as is
  if (typeof workSchedule === "string") {
    return {
      days: [],
      hours: workSchedule,
      summary: workSchedule,
    };
  }

  // If it's an object, parse it
  if (typeof workSchedule === "object") {
    const schedule = workSchedule as WorkSchedule;

    // Handle the actual data structure: { days: [], time_slots: [], hours_per_day: number }
    if (schedule.days && Array.isArray(schedule.days)) {
      const availableDays = schedule.days.map((day) => {
        // Capitalize first letter of each day
        return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
      });

      // Format time slots
      const timeSlotText =
        schedule.time_slots && schedule.time_slots.length > 0
          ? schedule.time_slots
              .map((slot) => slot.charAt(0).toUpperCase() + slot.slice(1))
              .join(", ")
          : "";

      // Create summary
      let summary = "";
      if (availableDays.length === 0) {
        summary = "No availability specified";
      } else if (availableDays.length === 7) {
        summary = "Available 7 days a week";
      } else if (
        availableDays.length === 5 &&
        availableDays.includes("Monday") &&
        availableDays.includes("Tuesday") &&
        availableDays.includes("Wednesday") &&
        availableDays.includes("Thursday") &&
        availableDays.includes("Friday")
      ) {
        summary = "Monday to Friday";
      } else {
        summary = availableDays.join(", ");
      }

      // Add time information
      if (timeSlotText) {
        summary += ` (${timeSlotText})`;
      }

      // Add hours per day information
      if (schedule.hours_per_day && schedule.hours_per_day > 0) {
        summary += ` - ${schedule.hours_per_day} hours per day`;
      }

      return {
        days: availableDays,
        hours: timeSlotText,
        summary,
      };
    }

    // Fallback for old format (day-by-day availability)
    const availableDays: string[] = [];
    const timeSlots: string[] = [];

    // Day names mapping
    const dayNames: { [key: string]: string } = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };

    // Process each day
    Object.entries(schedule).forEach(([day, data]) => {
      if (
        data &&
        typeof data === "object" &&
        "available" in data &&
        data.available
      ) {
        const dayName = dayNames[day.toLowerCase()] || day;
        availableDays.push(dayName);

        if (
          data.hours &&
          Array.isArray(data.hours) &&
          data.hours.length === 2
        ) {
          const [start, end] = data.hours;
          timeSlots.push(`${dayName}: ${start} - ${end}`);
        }
      }
    });

    // Create summary for old format
    let summary = "";
    if (availableDays.length === 0) {
      summary = "No availability specified";
    } else if (availableDays.length === 7) {
      summary = "Available 7 days a week";
    } else if (
      availableDays.length === 5 &&
      availableDays.includes("Monday") &&
      availableDays.includes("Tuesday") &&
      availableDays.includes("Wednesday") &&
      availableDays.includes("Thursday") &&
      availableDays.includes("Friday")
    ) {
      summary = "Monday to Friday";
    } else {
      summary = availableDays.join(", ");
    }

    // Add time information if available
    if (timeSlots.length > 0) {
      const uniqueTimes = [
        ...new Set(timeSlots.map((slot) => slot.split(": ")[1])),
      ];
      if (uniqueTimes.length === 1) {
        summary += ` (${uniqueTimes[0]})`;
      } else if (uniqueTimes.length > 1) {
        summary += ` (Various times)`;
      }
    }

    return {
      days: availableDays,
      hours: timeSlots.join("; "),
      summary,
    };
  }

  return null;
}

/**
 * Get a simple string representation of work schedule
 */
export function getWorkScheduleSummary(workSchedule: any): string {
  const formatted = formatWorkSchedule(workSchedule);
  return formatted ? formatted.summary : "Schedule not specified";
}

/**
 * Check if work schedule has specific day availability
 */
export function hasDayAvailability(workSchedule: any, day: string): boolean {
  if (!workSchedule || typeof workSchedule !== "object") return false;

  const schedule = workSchedule as WorkSchedule;

  // Handle new format
  if (schedule.days && Array.isArray(schedule.days)) {
    return schedule.days.includes(day.toLowerCase());
  }

  // Handle old format
  return schedule[day.toLowerCase()]?.available || false;
}

/**
 * Get time range for a specific day
 */
export function getDayTimeRange(workSchedule: any, day: string): string | null {
  if (!workSchedule || typeof workSchedule !== "object") return null;

  const schedule = workSchedule as WorkSchedule;

  // Handle new format - return time slots if available
  if (schedule.days && Array.isArray(schedule.days) && schedule.time_slots) {
    if (
      schedule.days.includes(day.toLowerCase()) &&
      schedule.time_slots.length > 0
    ) {
      return schedule.time_slots
        .map((slot) => slot.charAt(0).toUpperCase() + slot.slice(1))
        .join(", ");
    }
    return null;
  }

  // Handle old format
  const dayData = schedule[day.toLowerCase()];

  if (!dayData?.available || !dayData.hours) return null;

  const [start, end] = dayData.hours;
  return `${start} - ${end}`;
}
