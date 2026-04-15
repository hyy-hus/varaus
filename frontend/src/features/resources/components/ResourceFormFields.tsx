import { Controller, type Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { ResourceFormValues } from "../schema";
import { Field, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "#/components/ui/input-group";


interface ResourceFormFieldsProps {
    control: Control<ResourceFormValues>
}

export function ResourceFormFields({ control }: ResourceFormFieldsProps) {
    const { t } = useTranslation();

    return (
        <FieldGroup>
            <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="resource-form-name">
                            {t('resources.nameLabel', 'Name')}
                        </FieldLabel>
                        <Input
                            {...field}
                            id="resource-form-name"
                            aria-invalid={fieldState.invalid}
                            placeholder={t('resources.namePlaceholder', 'Meeting room A')}
                            autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="resource-form-description">
                            Description
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupTextarea
                                {...field}
                                value={field.value || ""}
                                id="resource-form-description"
                                rows={6}
                                className="min-h-24 resize-none"
                                aria-invalid={fieldState.invalid}
                            />
                            <InputGroupAddon align="block-end">
                                <InputGroupText className="tabular-nums text-xs text-muted-foreground/50">
                                    {field.value?.length || 0}/500
                                </InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />
        </FieldGroup>
    )
}
