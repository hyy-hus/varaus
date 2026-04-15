import type { ResourceCreate } from "#/api/models";
import { t } from "i18next";
import * as z from "zod";

export const resourceSchema = z.object({
    name: z.string()
        .min(3, t('validation.min', { length: 3 }))
        .max(255, t('validation.max', { length: 255 })),
    description: z.string()
        .max(255, t('validation.max', { length: 255 }))
        .optional(),
    is_active: z.boolean()
}) satisfies z.ZodType<ResourceCreate>;

export type ResourceFormValues = z.infer<typeof resourceSchema>
