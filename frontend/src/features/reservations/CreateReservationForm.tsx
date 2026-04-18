import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReservationFormFields } from "./ReservationFormFields"
import { reservationSchema, type ReservationFormValues } from "./schema"
import { useCreateReservation } from "#/api/endpoints/reservations/reservations"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#/components/ui/card"
import { Field, FieldSet } from "#/components/ui/field"
import { Button } from "#/components/ui/button"
import { t } from "i18next"
import { toast } from "sonner"

export function CreateReservationForm() {
    const form = useForm<ReservationFormValues>({
        resolver: zodResolver(reservationSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            description: "",
            status: "pending",
        }
    })

    const createMutation = useCreateReservation()

    const onSubmit = (data: ReservationFormValues) => {
        createMutation.mutate(
            { data: data },
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
