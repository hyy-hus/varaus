import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResourceFormFields } from "./ResourceFormFields"
import { resourceSchema, type ResourceFormValues } from "../schema"
import { useCreateResource } from "#/api/endpoints/resources/resources"
import { Card, CardContent, CardFooter, CardHeader } from "#/components/ui/card"
import { Field } from "#/components/ui/field"
import { Button } from "#/components/ui/button"
import { t } from "i18next"
import { toast } from "sonner"

export function CreateResourceForm() {
    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            description: "",
            is_active: true,
        }
    })

    const createMutation = useCreateResource()

    const onSubmit = (data: ResourceFormValues) => {
        createMutation.mutate(
            { data: data },
            {
                onSuccess: () => {
                    toast.success(t('resources.successToast', { name: data.name }));
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
            </CardHeader>
            <CardContent>
                <form id="create-resource-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <ResourceFormFields control={form.control} />
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation={"horizontal"} >
                    <Button type="button" variant="outline" onClick={() => form.reset()} disabled={createMutation.isPending}>
                        Clear
                    </Button>
                    <Button type="submit" form="create-resource-form"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "Creating..." : "Create Resource"}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
