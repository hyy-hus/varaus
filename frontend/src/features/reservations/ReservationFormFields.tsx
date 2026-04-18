import { Controller, type Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { ReservationFormValues } from "./schema";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "#/components/ui/input-group";


interface ReservationFormFieldsProps {
    control: Control<ReservationFormValues>
}

export function ReservationFormFields({ control }: ReservationFormFieldsProps) {
    const { t } = useTranslation();

    return (
        <FieldGroup>
            <FieldSet>
                <FieldLegend>Reservation info</FieldLegend>
                <FieldDescription>
                    Information about the reservation
                </FieldDescription>

                <FieldGroup>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="reservations-form-name">
                                    {t('reservations.nameLabel')}
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="reservation-form-name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder={t('reservations.namePlaceholder')}
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
                                <FieldLabel htmlFor="reservation-form-description">
                                    {t('reservations.descriptionLabel')}
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupTextarea
                                        {...field}
                                        value={field.value || ""}
                                        id="reservation-form-description"
                                        rows={6}
                                        className="min-h-24 resize-none"
                                        aria-invalid={fieldState.invalid}
                                        placeholder={t('reservations.descriptionPlaceholder')}
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
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>Reserver</FieldLegend>
                <FieldDescription>
                    Information about the person / organisation reserving the resource
                </FieldDescription>

                <FieldGroup>
                    <Controller
                        name="reserver"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel htmlFor="reservation-form-reserver">
                                    {t('reservations.reserverLabel')}
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="reservation-form-reserver"
                                    aria-invalid={fieldState.invalid}
                                    placeholder={t('reservations.reserverPlaceholder')}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>Resources</FieldLegend>
                <FieldDescription>
                    Which resources are being reserved
                </FieldDescription>

                <FieldGroup>
                    fields...
                </FieldGroup>

            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>Occurrences</FieldLegend>
                <FieldDescription>
                    When does the reservation happen
                </FieldDescription>

                <FieldGroup>
                    fields...
                </FieldGroup>
            </FieldSet>

        </FieldGroup>
    )
}
