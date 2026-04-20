import { Controller, useWatch, type Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { ReservationFormValues } from "./schema";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "#/components/ui/input-group";
import { DateTimePicker } from "#/components/DateTimePicker";
import { useEffect, useMemo, useState } from "react";
import { Switch } from "#/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { RRule, Frequency, type ByWeekday } from "rrule";
import { Temporal } from "@js-temporal/polyfill";
import { Button } from "#/components/ui/button";
import { useReadResources } from "#/api/endpoints/resources/resources";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "#/components/ui/combobox";
import { XIcon } from "lucide-react";
import { calculateOccurrences } from "#/lib/rrule-utils";
import { useDebounce } from "@uidotdev/usehooks";
import type { ConflictCheckRequest } from "#/api/models";
import { useCheckConflictsQuery } from "#/lib/hooks/checkConflicts";


interface ReservationFormFieldsProps {
    control: Control<ReservationFormValues>
}

interface RRuleOptionsProps {
    value?: string;
    baseStartTime?: Temporal.PlainDateTime;
    onChange?: (rruleString?: string) => void;
}

const WEEKDAYS = [
    { label: "Mo", value: RRule.MO },
    { label: "Tu", value: RRule.TU },
    { label: "We", value: RRule.WE },
    { label: "Th", value: RRule.TH },
    { label: "Fr", value: RRule.FR },
    { label: "Sa", value: RRule.SA },
    { label: "Su", value: RRule.SU },
];

export function RRuleOptions({ value, baseStartTime, onChange }: RRuleOptionsProps) {
    const [isRecurring, setIsRecurring] = useState<boolean>(false);

    const [interval, setInterval] = useState<number>(1);
    const [freq, setFreq] = useState<Frequency>(RRule.WEEKLY);

    const initialWeekday = baseStartTime ? WEEKDAYS[baseStartTime.dayOfWeek - 1].value : RRule.MO;
    const [selectedWeekdays, setSelectedWeekdays] = useState<ByWeekday[]>([initialWeekday]);

    const [monthDay, setMonthDay] = useState<number>(baseStartTime?.day || 1);

    const [endMode, setEndMode] = useState<"count" | "until">("count");
    const [count, setCount] = useState<number>(10);
    const [untilDate, setUntilDate] = useState<string>("");

    const toggleWeekday = (day: ByWeekday) => {
        setSelectedWeekdays((prev) => {
            if (prev.includes(day)) {
                // Prevent deselecting the last day
                if (prev.length === 1) return prev;
                return prev.filter((d) => d !== day);
            }
            return [...prev, day];
        });
    };

    useEffect(() => {
        if (!value) {
            setIsRecurring(false);
        }
    }, [value]);

    useEffect(() => {
        if (!isRecurring || !baseStartTime) {
            onChange?.(undefined);
            return;
        }

        const dtstart = new Date(
            baseStartTime.year,
            baseStartTime.month - 1,
            baseStartTime.day,
            baseStartTime.hour,
            baseStartTime.minute
        );

        let until: Date | undefined;
        if (endMode === "until" && untilDate) {
            const parts = untilDate.split("-");
            if (parts.length === 3) {
                until = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
            }
        }

        const rule = new RRule({
            freq,
            interval,
            dtstart,
            ...(endMode === "count" ? { count } : {}),
            ...(endMode === "until" && until ? { until } : {}),
            ...(freq === RRule.WEEKLY ? { byweekday: selectedWeekdays } : {}),
            ...(freq === RRule.MONTHLY ? { bymonthday: [monthDay] } : {}),
        });

        const ruleString = rule.toString().split('\n').find(line => line.startsWith('RRULE:'))?.replace('RRULE:', '');
        onChange?.(ruleString);

    }, [isRecurring, interval, freq, endMode, count, untilDate, selectedWeekdays, monthDay, baseStartTime, onChange]);

    return (
        <FieldGroup className="w-full rounded-lg border p-4 bg-muted/20">
            {/* The Master Switch */}
            <Field orientation="horizontal" className="flex justify-between w-full">
                <FieldContent>
                    <FieldLabel>Is the event recurring?</FieldLabel>
                    <FieldDescription>
                        Set up a repeating schedule for this reservation.
                    </FieldDescription>
                </FieldContent>
                <Switch
                    id="switch-recurring"
                    checked={isRecurring}
                    onCheckedChange={(val) => setIsRecurring(val)}
                />
            </Field>

            {/* The Hidden Settings Menu */}
            {isRecurring && (
                <div className="mt-0 flex flex-col gap-6 border-t pt-6">

                    {/* FREQUENCY ROW */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel>Repeats every</FieldLabel>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min={1}
                                value={interval}
                                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                                className="w-20"
                            />
                            <Select
                                value={freq.toString()}
                                onValueChange={(val) => setFreq(parseInt(val))}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RRule.DAILY.toString()}>days</SelectItem>
                                    <SelectItem value={RRule.WEEKLY.toString()}>weeks</SelectItem>
                                    <SelectItem value={RRule.MONTHLY.toString()}>months</SelectItem>
                                    <SelectItem value={RRule.YEARLY.toString()}>years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* DYNAMIC "REPEATS ON" ROW */}
                    {freq === RRule.WEEKLY && (
                        <div className="flex flex-col gap-2">
                            <FieldLabel>Repeats on</FieldLabel>
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map((day) => (
                                    <Button
                                        key={day.label}
                                        type="button"
                                        variant={selectedWeekdays.includes(day.value) ? "default" : "outline"}
                                        className={`h-10 w-10 rounded-full p-0 font-semibold ${selectedWeekdays.includes(day.value) ? "" : "text-muted-foreground"
                                            }`}
                                        onClick={() => toggleWeekday(day.value)}
                                    >
                                        {day.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {freq === RRule.MONTHLY && (
                        <div className="flex flex-col gap-2">
                            <FieldLabel>Repeats on</FieldLabel>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Day</span>
                                <Input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={monthDay}
                                    onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                                    className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">of the month</span>
                            </div>
                        </div>
                    )}

                    {/* END CONDITION ROW */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel>Ends</FieldLabel>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                value={endMode}
                                onValueChange={(val: "count" | "until") => setEndMode(val)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="count">After</SelectItem>
                                    <SelectItem value="until">On date</SelectItem>
                                </SelectContent>
                            </Select>

                            {endMode === "count" ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                        className="w-20"
                                    />
                                    <span className="text-sm text-muted-foreground">occurrences</span>
                                </div>
                            ) : (
                                <Input
                                    type="date"
                                    value={untilDate}
                                    onChange={(e) => setUntilDate(e.target.value)}
                                    className="w-[160px] [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            )}
                        </div>
                    </div>

                </div>
            )}
        </FieldGroup>
    );
}

interface ItemProp {
    key: string;
    value: string;
}

interface ComboboxMultipleProps {
    items: ItemProp[];
    value?: string[];
    onValueChange: (keys: string[]) => void;
}

export function ComboboxMultiple({ items, value = [], onValueChange }: ComboboxMultipleProps) {
    const anchor = useComboboxAnchor();

    const selectedItems = value
        .map(id => items.find(i => i.key === id))
        .filter((item): item is ItemProp => item !== undefined);

    const handleComboChange = (selectedObjects: ItemProp[]) => {
        const exactIds = selectedObjects.map(item => item.key);
        onValueChange(exactIds);
    };

    return (
        <Combobox
            multiple
            autoHighlight
            items={items}
            value={selectedItems}
            onValueChange={handleComboChange}
        >
            <div className="relative w-full max-w-xs">
                <ComboboxChips ref={anchor} className="w-full pr-10">
                    <ComboboxValue>
                        {(selected: ItemProp[]) => (
                            <>
                                {selected.map((item: ItemProp) => (
                                    <ComboboxChip key={item.key}>
                                        {item.value}
                                    </ComboboxChip>
                                ))}
                                <ComboboxChipsInput placeholder="Add resource..." />
                            </>
                        )}
                    </ComboboxValue>
                </ComboboxChips>

                {selectedItems.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent the combobox dropdown from toggling!
                            handleComboChange([]); // Clear the state!
                        }}
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: ItemProp) => (
                        <ComboboxItem key={item.key} value={item}>
                            {item.value}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
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
                    <Controller
                        name="resourceIds"
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <>
                                    <ComboboxMultiple
                                        {...field}
                                        onValueChange={field.onChange}
                                        items={resources?.map(r => ({ key: r.id, value: r.name })) ?? []}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </>
                            );
                        }}
                    />

                </FieldGroup>

                {/* THE LIVE CONFLICT WARNING UI */}
                <div className="min-h-[40px] transition-all">
                    {isCheckingConflicts ? (
                        <div className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Checking availability...
                        </div>
                    ) : conflictData?.has_conflicts ? (
                        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                            <strong className="block mb-2 text-base">⚠️ Resource Conflict Detected</strong>
                            <p className="mb-3">The following resources are already booked during your selected times:</p>

                            {/* A scrollable list in case there are many conflicts */}
                            <ul className="max-h-40 space-y-2 overflow-y-auto rounded bg-destructive/5 p-2 border border-destructive/20">
                                {conflictData.conflicts.map((conflict, idx) => {
                                    // Look up the human-readable resource name!
                                    const resourceName = resources.find(r => r.id === conflict.resource_id)?.name || "Unknown Resource";

                                    // Format the dates cleanly
                                    const startDate = new Date(conflict.start);
                                    const endDate = new Date(conflict.end);

                                    return (
                                        <li key={idx} className="flex flex-col gap-0.5 border-b border-destructive/10 pb-2 last:border-0 last:pb-0">
                                            <div className="font-medium">
                                                {resourceName}
                                            </div>
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
                </div>

            </FieldSet>

            <FieldSeparator />

            <FieldSet>
                <FieldLegend>Occurrences</FieldLegend>
                <FieldDescription>
                    When does the reservation happen
                </FieldDescription>

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
                        <RRuleOptions
                            value={field.value}
                            baseStartTime={startDateTime}
                            onChange={field.onChange}
                        />
                    )}
                />

                {occurrencesPreview.length > 0 && (
                    <div className="mt-4 rounded-md border bg-muted/20 p-4">
                        <h4 className="mb-3 text-sm font-medium">
                            Previewing occurrences ({occurrencesPreview.length} shown)
                        </h4>
                        <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                            {occurrencesPreview.map((date, idx) => {
                                // 1. Find all conflicts that land exactly on this occurrence's start time
                                const dateConflicts = conflictData?.conflicts?.filter(
                                    (c) => new Date(c.start).getTime() === date.getTime()
                                ) || [];

                                const hasConflict = dateConflicts.length > 0;

                                return (
                                    <li
                                        key={idx}
                                        className={`flex flex-col gap-1.5 p-2 rounded-md border transition-colors ${hasConflict
                                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                                            : "border-transparent text-muted-foreground hover:bg-muted/30"
                                            }`}
                                    >
                                        {/* Row 1: The Date and Time */}
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

                                        {/* Row 2: The Specific Resource Conflicts (Only shows if conflicts exist) */}
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
            </FieldSet>
        </FieldGroup>
    );
}
