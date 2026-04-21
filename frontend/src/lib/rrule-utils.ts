import { RRule } from "rrule";
import type { Temporal } from "@js-temporal/polyfill";

export function calculateOccurrences(
    startDateTime?: Temporal.PlainDateTime,
    rruleString?: string,
    limit: number = 50
): Date[] {
    if (!startDateTime || !rruleString) return [];

    try {
        const dtstart = new Date(
            startDateTime.year,
            startDateTime.month - 1,
            startDateTime.day,
            startDateTime.hour,
            startDateTime.minute
        );

        const options = RRule.parseString(rruleString);

        options.dtstart = dtstart;

        const rule = new RRule(options);

        return rule.all((_, i) => i < limit);

    } catch (e) {
        console.error("Failed to calculate RRULE occurrences:", e);
        return [];
    }
}
