import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "../ui/input-group"
import { useCreateResource } from "#/api/endpoints/resources/resources"
import { Button } from "../ui/button"
import type { ResourceCreate } from "#/api/models"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

const createResourceSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(255, "Name can't exceed than 255 characters"),
    description: z.string()
        .max(500, "Description can't exceed 500 characters")
        .optional(),
    is_active: z.boolean()
}) satisfies z.ZodType<ResourceCreate>;

type ResourceFromValues = z.infer<typeof createResourceSchema>

export function CreateResourceForm() {
    const { t } = useTranslation();

    const form = useForm<ResourceFromValues>({
        resolver: zodResolver(createResourceSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            description: "",
            is_active: true,
        }
    })

    const createMutation = useCreateResource()

    const onSubmit = (data: ResourceFromValues) => {
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
                <CardTitle>Create a resource</CardTitle>
                <CardDescription>
                    Create a new reservable room, equipment or asset into the calendar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="create-resource-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="create-resource-form-name">
                                        {t('resources.nameLabel')}
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="create-resource-form-name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder={t('resources.namePlaceholder')}
                                        autoComplete="off"
                                    />
                                    <FieldDescription>
                                        {t('resources.nameDescription')}
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="create-resource-form-description">
                                        Description
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupTextarea
                                            {...field}
                                            id="create-resource-form-description"
                                            placeholder="Meeting room A has room for 18 people and there is a projector."
                                            rows={6}
                                            className="min-h-24 resize-none"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <InputGroupAddon align="block-end">
                                            <InputGroupText className="tabular-nums text-xs text-muted-foreground/50">
                                                {field.value?.length}/500 characters
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldDescription>
                                        Optional context to help users understand what this resource is
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
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
