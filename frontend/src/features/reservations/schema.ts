import type { ReservationCreate } from "#/api/models";
import { Temporal } from "@js-temporal/polyfill";
import { t } from "i18next";
import * as z from "zod";

export const reservationSchema = z.object({
    name: z.string()
        .min(3, t('validation.min', { length: 3 }))
        .max(255, t('validation.max', { length: 255 })),
    description: z.string()
        .max(255, t('validation.max', { length: 255 }))
        .optional(),
    rrule: z.string().optional(),
    startDateTime: z.custom<Temporal.PlainDateTime>((val) => {
        return val instanceof Temporal.PlainDateTime;
    }, "Invalid start date"),

    endDateTime: z.custom<Temporal.PlainDateTime>((val) => {
        return val instanceof Temporal.PlainDateTime;
    }, "Invalid end date"),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'informative'])
}) satisfies z.ZodType<ReservationCreate>;

export type ReservationFormValues = z.infer<typeof reservationSchema>
