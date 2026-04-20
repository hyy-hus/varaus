import { useState, useEffect } from "react";
import { RRule, Frequency, type ByWeekday } from "rrule";
import type { Temporal } from "@js-temporal/polyfill";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Switch } from "#/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Button } from "#/components/ui/button";

export interface RRuleOptionsProps {
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
                if (prev.length === 1) return prev;
                return prev.filter((d) => d !== day);
            }
            return [...prev, day];
        });
    };

    useEffect(() => {
        if (!value) setIsRecurring(false);
    }, [value]);

    useEffect(() => {
        if (!isRecurring || !baseStartTime) {
            onChange?.(undefined);
            return;
        }

        const dtstart = new Date(
            baseStartTime.year, baseStartTime.month - 1, baseStartTime.day,
            baseStartTime.hour, baseStartTime.minute
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
            <Field orientation="horizontal" className="flex justify-between w-full">
                <FieldContent>
                    <FieldLabel>Is the event recurring?</FieldLabel>
                    <FieldDescription>Set up a repeating schedule for this reservation.</FieldDescription>
                </FieldContent>
                <Switch id="switch-recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
            </Field>

            {isRecurring && (
                <div className="mt-0 flex flex-col gap-6 border-t pt-6">
                    <div className="flex flex-col gap-2">
                        <FieldLabel>Repeats every</FieldLabel>
                        <div className="flex items-center gap-3">
                            <Input type="number" min={1} value={interval} onChange={(e) => setInterval(parseInt(e.target.value) || 1)} className="w-20" />
                            <Select value={freq.toString()} onValueChange={(val) => setFreq(parseInt(val))}>
                                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RRule.DAILY.toString()}>days</SelectItem>
                                    <SelectItem value={RRule.WEEKLY.toString()}>weeks</SelectItem>
                                    <SelectItem value={RRule.MONTHLY.toString()}>months</SelectItem>
                                    <SelectItem value={RRule.YEARLY.toString()}>years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {freq === RRule.WEEKLY && (
                        <div className="flex flex-col gap-2">
                            <FieldLabel>Repeats on</FieldLabel>
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map((day) => (
                                    <Button
                                        key={day.label}
                                        type="button"
                                        variant={selectedWeekdays.includes(day.value) ? "default" : "outline"}
                                        className={`h-10 w-10 rounded-full p-0 font-semibold ${selectedWeekdays.includes(day.value) ? "" : "text-muted-foreground"}`}
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
                                <Input type="number" min={1} max={31} value={monthDay} onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)} className="w-20" />
                                <span className="text-sm text-muted-foreground">of the month</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <FieldLabel>Ends</FieldLabel>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={endMode} onValueChange={(val: "count" | "until") => setEndMode(val)}>
                                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="count">After</SelectItem>
                                    <SelectItem value="until">On date</SelectItem>
                                </SelectContent>
                            </Select>

                            {endMode === "count" ? (
                                <div className="flex items-center gap-2">
                                    <Input type="number" min={1} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} className="w-20" />
                                    <span className="text-sm text-muted-foreground">occurrences</span>
                                </div>
                            ) : (
                                <Input type="date" value={untilDate} onChange={(e) => setUntilDate(e.target.value)} className="w-[160px] [&::-webkit-calendar-picker-indicator]:appearance-none" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </FieldGroup>
    );
}
