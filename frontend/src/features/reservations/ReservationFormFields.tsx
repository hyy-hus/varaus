import { Controller, useWatch, type Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useEffect, useMemo } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import type { ReservationFormValues } from "./schema";
import type { ConflictCheckRequest } from "#/api/models";
import { calculateOccurrences } from "#/lib/rrule-utils";
import { useCheckConflictsQuery } from "#/lib/hooks/checkConflicts";
import { useReadResources } from "#/api/endpoints/resources/resources";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "#/components/ui/input-group";
import { DateTimePicker } from "#/components/DateTimePicker";

import { RRuleOptions } from "#/components/RRuleOptions";
import { ComboboxMultiple } from "#/components/ComboboxMultiple";
import { Textarea } from "#/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";

interface ReservationFormFieldsProps {
    control: Control<ReservationFormValues>
}

export function ReservationFormFields({ control }: ReservationFormFieldsProps) {
    const { t } = useTranslation();

    const startDateTime = useWatch({ control, name: "startDateTime" });
    const endDateTime = useWatch({ control, name: "endDateTime" });
    const rruleString = useWatch({ control, name: "rrule" });
    const resourceIds = useWatch({ control, name: "resourceIds" }) || [];

    const debouncedStart = useDebounce(startDateTime, 500);
    const debouncedEnd = useDebounce(endDateTime, 500);
    const debouncedRrule = useDebounce(rruleString, 500);
    const debouncedResources = useDebounce(resourceIds, 500);

    const occurrencesPreview = useMemo(() => {
        return calculateOccurrences(startDateTime, rruleString);
    }, [startDateTime, rruleString]);

    const previewDurationMs = useMemo(() => {
        if (!startDateTime || !endDateTime) return 0;
        const start = new Date(
            startDateTime.year, startDateTime.month - 1, startDateTime.day,
            startDateTime.hour, startDateTime.minute
        );
        const end = new Date(
            endDateTime.year, endDateTime.month - 1, endDateTime.day,
            endDateTime.hour, endDateTime.minute
        );
        return end.getTime() - start.getTime();
    }, [startDateTime, endDateTime]);

    const conflictPayload = useMemo<ConflictCheckRequest | null>(() => {
        if (!debouncedStart || !debouncedEnd || debouncedResources.length === 0) return null;

        const start = new Date(
            debouncedStart.year, debouncedStart.month - 1, debouncedStart.day,
            debouncedStart.hour, debouncedStart.minute
        );
        const end = new Date(
            debouncedEnd.year, debouncedEnd.month - 1, debouncedEnd.day,
            debouncedEnd.hour, debouncedEnd.minute
        );
        const durationMs = end.getTime() - start.getTime();

        const starts = debouncedRrule
            ? calculateOccurrences(debouncedStart, debouncedRrule)
            : [start];

        const intervals = starts.map(startDate => ({
            start: startDate.toISOString(),
            end: new Date(startDate.getTime() + durationMs).toISOString()
        }));

        return {
            resourceIds: debouncedResources,
            intervals: intervals
        };
    }, [debouncedStart, debouncedEnd, debouncedRrule, debouncedResources]);

    const { data: cachedConflictData, isFetching: isCheckingConflicts } = useCheckConflictsQuery(conflictPayload);
    const conflictData = conflictPayload ? cachedConflictData : null;

    useEffect(() => {
        console.log("conflicts:", conflictData);
        console.log("payload:", conflictPayload)
    }, [conflictData, conflictPayload]);

    const resourcesResponse = useReadResources();
    const resourcesData = resourcesResponse?.data?.data;
    const resources = Array.isArray(resourcesData) ? resourcesData : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
            <div className="flex flex-col gap-8">
                <FieldSet>
                    <FieldLegend>Reservation info</FieldLegend>
                    <FieldDescription>Information about the reservation</FieldDescription>

                    <FieldGroup>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="reservations-form-name">{t('reservations.nameLabel')}</FieldLabel>
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
                                    <FieldLabel htmlFor="reservation-form-description">{t('reservations.descriptionLabel')}</FieldLabel>
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
                    <FieldDescription>Information about the person / organisation reserving the resource</FieldDescription>

                    <FieldGroup>
                        <Controller
                            name="reserver"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="reservation-form-reserver">{t('reservations.reserverLabel')}</FieldLabel>
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

                        <Controller
                            name="reserverEmail"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="reservation-form-reserver-email">{t('reservations.reserverEmailLabel')}</FieldLabel>
                                    <Input
                                        {...field}
                                        type="email"
                                        id="reservation-form-reserver"
                                        aria-invalid={fieldState.invalid}
                                        placeholder={t('reservations.reserverEmailPlaceholder')}
                                    />
                                    <FieldDescription>
                                        {t('reservations.reserverEmailDescription')}
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="reserverPhone"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="reservation-form-reserver-phone">{t('reservations.reserverPhoneLabel')}</FieldLabel>
                                    <Input
                                        {...field}
                                        type="tel"
                                        id="reservation-form-reserver"
                                        aria-invalid={fieldState.invalid}
                                        placeholder={t('reservations.reserverPhonePlaceholder')}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>
            </div>

            <div className="flex flex-col gap-8">
                <FieldSet>
                    <FieldLegend>Occurrences</FieldLegend>
                    <FieldDescription>When and where does the reservation happen</FieldDescription>

                    <FieldGroup>
                        <Controller
                            name="resourceIds"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Select resources</FieldLabel>
                                    <ComboboxMultiple
                                        {...field}
                                        onValueChange={field.onChange}
                                        items={resources?.map(r => ({ key: r.id, value: r.name })) ?? []}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {isCheckingConflicts ? (
                        <div className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Checking availability...
                        </div>
                    ) : conflictPayload && conflictData?.has_conflicts ? (
                        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                            <strong className="block mb-2 text-base">⚠️ Resource Conflict Detected</strong>
                            <p className="mb-3">The following resources are already booked during your selected times:</p>
                            <ul className="max-h-40 space-y-2 overflow-y-auto rounded bg-destructive/5 p-2 border border-destructive/20">
                                {conflictData.conflicts.map((conflict, idx) => {
                                    const resourceName = resources.find(r => r.id === conflict.resource_id)?.name || "Unknown Resource";
                                    const startDate = new Date(conflict.start);
                                    const endDate = new Date(conflict.end);

                                    return (
                                        <li key={idx} className="flex flex-col gap-0.5 border-b border-destructive/10 pb-2 last:border-0 last:pb-0">
                                            <div className="font-medium">{resourceName}</div>
                                            <div className="text-xs opacity-90">
                                                Conflicting event: <a href={`/reservations/${conflict.reservation_id}`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-destructive-foreground">
                                                    {conflict.reservation_name}
                                                </a>
                                            </div>
                                            <div className="text-xs opacity-80">
                                                {startDate.toLocaleDateString()} ({startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ) : conflictPayload && conflictData && !conflictData.has_conflicts ? (
                        <div className="rounded-md border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            ✅ All selected resources are available!
                        </div>
                    ) : null}

                    <FieldGroup className="flex-row gap-8">
                        <Controller
                            name="startDateTime"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <DateTimePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        dateLabel="Start Date"
                                        timeLabel="Start Time"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="endDateTime"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <DateTimePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        dateLabel="End Date"
                                        timeLabel="End Time"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <Controller
                        name="rrule"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <RRuleOptions
                                    value={field.value}
                                    baseStartTime={startDateTime}
                                    onChange={field.onChange}
                                />

                                {occurrencesPreview.length > 0 && (
                                    <div className="mt-4 rounded-md border bg-muted/20 p-4">
                                        <h4 className="mb-3 text-sm font-medium">
                                            Previewing occurrences ({occurrencesPreview.length} shown)
                                        </h4>
                                        <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                                            {occurrencesPreview.map((date, idx) => {
                                                const occStart = date.getTime();
                                                const occEnd = occStart + previewDurationMs;

                                                const dateConflicts = conflictData?.conflicts?.filter((c) => {
                                                    const conflictStart = new Date(c.start).getTime();
                                                    const conflictEnd = new Date(c.end).getTime();

                                                    return occStart < conflictEnd && occEnd > conflictStart;
                                                }) || [];

                                                const hasConflict = dateConflicts.length > 0;

                                                return (
                                                    <li
                                                        key={idx}
                                                        className={`flex flex-col gap-1.5 p-2 rounded-md border transition-colors ${hasConflict
                                                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                                                            : "border-transparent text-muted-foreground hover:bg-muted/30"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 text-xs opacity-50">{idx + 1}.</span>
                                                            <span className={hasConflict ? "font-semibold" : ""}>
                                                                {date.toLocaleDateString(undefined, {
                                                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                                })}
                                                                {' at '}
                                                                {date.toLocaleTimeString(undefined, {
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </span>
                                                            {hasConflict && (
                                                                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-destructive/20 rounded text-destructive">
                                                                    Conflict
                                                                </span>
                                                            )}
                                                        </div>

                                                        {hasConflict && (
                                                            <div className="ml-8 flex flex-col gap-1 text-xs mt-1">
                                                                {dateConflicts.map((conflict, cIdx) => {
                                                                    const resourceName = resources.find(r => r.id === conflict.resource_id)?.name || "Unknown Resource";
                                                                    return (
                                                                        <div key={cIdx} className="flex items-start gap-1.5 opacity-90">
                                                                            <span>
                                                                                <strong className="font-semibold">{resourceName}</strong> is already booked for{" "}
                                                                                <a
                                                                                    href={`/reservations/${conflict.reservation_id}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="font-bold underline underline-offset-2 hover:text-destructive-foreground transition-colors"
                                                                                >
                                                                                    {conflict.reservation_name}
                                                                                </a>
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                            </div>
                        )}
                    />
                </FieldSet>

                <FieldSeparator />

                <FieldSet>
                    <FieldLegend>Contract</FieldLegend>
                    <FieldDescription>What kind of contract has the reserver agree to in order to make this reservation</FieldDescription>

                    <Controller
                        name="contract"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Contract text</FieldLabel>
                                <Textarea {...field} />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                </FieldSet>

                <FieldSeparator />

                <FieldSet>
                    <FieldLegend>Additional information</FieldLegend>
                    <FieldDescription></FieldDescription>

                    <FieldGroup>
                        <Controller
                            name="internalNotes"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Internal notes</FieldLabel>
                                    <Textarea {...field} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Status of the reservation</FieldLabel>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="informative">Informative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />

                        <Controller
                            name="color"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Color of the reservation</FieldLabel>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Green</SelectItem>
                                            <SelectItem value="confirmed">Blue</SelectItem>
                                            <SelectItem value="cancelled">Red</SelectItem>
                                            <SelectItem value="informative">Orange</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>
            </div>
        </div >

    );
}
