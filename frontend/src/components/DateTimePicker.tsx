import { useState, useEffect, useCallback } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { CalendarIcon } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { Calendar } from "#/components/ui/calendar";
import { Button } from "#/components/ui/button";

interface DateTimePickerProps {
    value?: Temporal.PlainDateTime;
    onChange?: (value?: Temporal.PlainDateTime) => void;
    dateLabel?: string;
    timeLabel?: string;
}

export function DateTimePicker({
    value,
    onChange,
    dateLabel = "Date",
    timeLabel = "Start time"
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false);

    const [dateStr, setDateStr] = useState<string>("");
    const [timeStr, setTimeStr] = useState<string>("");

    useEffect(() => {
        if (value) {
            setDateStr(value.toPlainDate().toString());
            setTimeStr(value.toPlainTime().toString().slice(0, 5));
        } else {
            setDateStr("");
            setTimeStr("");
        }
    }, [value]);

    const triggerOnChange = useCallback((newDateStr: string, newTimeStr: string) => {
        if (!newDateStr) {
            onChange?.(undefined);
            return;
        }
        try {
            const timeToUse = newTimeStr || "00:00";
            const newDateTime = Temporal.PlainDateTime.from(`${newDateStr}T${timeToUse}`);
            onChange?.(newDateTime);
        } catch (e) {
        }
    }, [onChange]);

    const handleDateChange = (newDateStr: string) => {
        setDateStr(newDateStr);
        triggerOnChange(newDateStr, timeStr);
    };

    const handleTimeChange = (newTimeStr: string) => {
        setTimeStr(newTimeStr);
        triggerOnChange(dateStr, newTimeStr);
    };

    const handleCalendarSelect = (d?: Date) => {
        if (d) {
            const pd = Temporal.PlainDate.from({
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate()
            });
            handleDateChange(pd.toString());
        } else {
            handleDateChange("");
        }
        setOpen(false);
    };

    const getJsDate = (isoStr: string) => {
        if (!isoStr) return undefined;
        try {
            const pd = Temporal.PlainDate.from(isoStr);
            return new Date(pd.year, pd.month - 1, pd.day);
        } catch {
            return undefined;
        }
    };

    return (
        <FieldGroup className="max-w-md flex-row items-end gap-4">
            <Field className="w-48">
                <FieldLabel>{dateLabel}</FieldLabel>
                <div className="relative w-full">
                    <Input
                        type="date"
                        value={dateStr}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="flex w-full pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground rounded-l-none"
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={getJsDate(dateStr)}
                                defaultMonth={getJsDate(dateStr)}
                                onSelect={handleCalendarSelect}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </Field>

            <Field className="w-32">
                <FieldLabel>{timeLabel}</FieldLabel>
                <Input
                    type="time"
                    value={timeStr}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            </Field>
        </FieldGroup>
    );
}
