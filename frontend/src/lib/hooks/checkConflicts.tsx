import { useQuery } from "@tanstack/react-query";
import { checkConflicts } from "#/api/endpoints/reservations/reservations";
import type { ConflictCheckRequest } from "#/api/models";

export function useCheckConflictsQuery(payload: ConflictCheckRequest | null) {
    return useQuery({
        queryKey: ["checkConflicts", payload],
        queryFn: async () => {
            console.log("Sending payload to FastAPI:", payload);
            const response = await checkConflicts(payload!);

            if (response.status === 422) {
                console.error("FastAPI Validation Error:", response.data);
                throw new Error("Validation Error");
            }
            return response.data;
        },
        enabled: !!payload && payload.resourceIds?.length > 0 && payload.intervals?.length > 0,
        placeholderData: (prev) => prev,
    });
}
