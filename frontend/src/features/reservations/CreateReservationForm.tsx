import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReservationFormFields } from "./ReservationFormFields"
import { reservationSchema, type ReservationFormValues } from "./schema"
import { useCreateReservationWithOccurrences } from "#/api/endpoints/reservations/reservations"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#/components/ui/card"
import { Field } from "#/components/ui/field"
import { Button } from "#/components/ui/button"
import { t } from "i18next"
import { toast } from "sonner"
import { Temporal } from "@js-temporal/polyfill"
import { calculateOccurrences } from "#/lib/rrule-utils"

export function CreateReservationForm() {

    const now = Temporal.Now.plainDateTimeISO();

    const startOfHour = now.with({
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0
    });

    const endOfHour = startOfHour.add({ hours: 1 });

    const form = useForm<ReservationFormValues>({
        resolver: zodResolver(reservationSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            description: "",
            status: "pending",
            startDateTime: startOfHour,
            endDateTime: endOfHour,
            resourceIds: [],
        },
    })

    const createMutation = useCreateReservationWithOccurrences()

    const onSubmit = (data: ReservationFormValues) => {
        const start = new Date(
            data.startDateTime.year, data.startDateTime.month - 1, data.startDateTime.day,
            data.startDateTime.hour, data.startDateTime.minute
        );
        const end = new Date(
            data.endDateTime.year, data.endDateTime.month - 1, data.endDateTime.day,
            data.endDateTime.hour, data.endDateTime.minute
        );
        const durationMs = end.getTime() - start.getTime();

        const starts = data.rrule
            ? calculateOccurrences(data.startDateTime, data.rrule)
            : [start];

        const intervals = starts.map(startDate => ({
            start: startDate.toISOString(),
            end: new Date(startDate.getTime() + durationMs).toISOString()
        }));

        const payload = {
            name: data.name,
            description: data.description,
            status: data.status,
            rrule: data.rrule,
            resource_ids: data.resourceIds,
            intervals: intervals
        };

        createMutation.mutate(
            { data: payload },
            {
                onSuccess: () => {
                    toast.success(t('reservations.successToast', { name: data.name }));
                    form.reset();
                },
                onError: (error) => {
                    console.error("Error while submitting form:", error);
                    toast.error(t('common.submitError'));
                }
            }
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold" >Create a new reservation</CardTitle>
                <CardDescription>
                    Something about what a reservation is?
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="create-reservation-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <ReservationFormFields control={form.control} />
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation={"horizontal"} >
                    <Button type="button" variant="outline" onClick={() => form.reset()} disabled={createMutation.isPending}>
                        Clear
                    </Button>
                    <Button type="submit" form="create-reservation-form"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "Creating..." : "Create Reservation"}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
