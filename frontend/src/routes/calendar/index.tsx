import { useReadOccurrences } from '#/api/endpoints/reservations/reservations';
import { useReadResources } from '#/api/endpoints/resources/resources';
import type { OccurrenceWithReservationRead } from '#/api/models';
import { Calendar, type CalendarEvent } from '#/components/calendar/Calendar'
import { ComboboxMultiple } from '#/components/ComboboxMultiple';
import { Card, CardContent, CardHeader } from '#/components/ui/card';
import { Temporal } from '@js-temporal/polyfill';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react';
import { z } from 'zod';

const localTimeZone = Temporal.Now.timeZoneId();

const calendarSearchSchema = z.object({
    date: z.string().optional(),
    days: z.number().catch(3).optional(), // Defaults to 3 if someone types ?days=invalid
    resources: z.union([z.string(), z.array(z.string())])
        .transform(val => Array.isArray(val) ? val : [val])
        .optional(),
});

export const Route = createFileRoute('/calendar/')({
    validateSearch: calendarSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const search = Route.useSearch();
    const navigate = useNavigate({ from: Route.id });

    const { data: resourcesResponse } = useReadResources();

    const comboboxItems = useMemo(() => {
        if (resourcesResponse?.status === 200) {
            return resourcesResponse.data.map((r) => ({
                key: r.id,
                value: r.name
            }));
        }
        return [];
    }, [resourcesResponse]);

    const startDate = search.date
        ? Temporal.PlainDate.from(search.date)
        : Temporal.Now.plainDateISO(localTimeZone);

    const visibleDays = search.days || 3;
    const selectedResources = search.resources || [];

    const windowStart = startDate.toZonedDateTime({ timeZone: localTimeZone, plainTime: '00:00:00' });
    const windowEnd = windowStart.add({ days: visibleDays });

    const { data: occurrencesResponse, isLoading } = useReadOccurrences({
        start: windowStart.toInstant().toString(),
        end: windowEnd.toInstant().toString(),
        resource_ids: selectedResources.length > 0 ? selectedResources : undefined
    });

    const events = useMemo<CalendarEvent[]>(() => {
        if (!occurrencesResponse?.data) return [];

        if (occurrencesResponse.status !== 200) {
            console.error("API returned an error:", occurrencesResponse.data);
            return [];
        }

        return occurrencesResponse.data.map((occ: OccurrenceWithReservationRead) => {
            return {
                id: occ.id,
                name: occ.reservation_name,
                description: (occ as any).reservation_description || "",

                start: Temporal.Instant.from(occ.start_time).toZonedDateTimeISO(localTimeZone),
                end: Temporal.Instant.from(occ.end_time).toZonedDateTimeISO(localTimeZone),
            };
        });
    }, [occurrencesResponse]);

    const handleStartDateChange = (newDate: Temporal.PlainDate) => {
        navigate({
            search: (prev) => ({
                ...prev,
                date: newDate.toString(),
            }),
            resetScroll: false
        });
    };

    const handleVisibleDaysChange = (newDays: number) => {
        navigate({
            search: (prev) => ({
                ...prev,
                days: newDays,
            }),
            resetScroll: false
        });
    };

    const handleResourcesChange = (newResources: string[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                resources: newResources.length > 0 ? newResources : undefined,
            }),
            resetScroll: false
        });
    };

    const handleEventDrop = (eventId: string, newStart: Temporal.ZonedDateTime, newEnd: Temporal.ZonedDateTime) => {
        console.log(`Dropped Event ${eventId} to new times:`, newStart.toString(), newEnd.toString());

        // This is where you will eventually call your patch/update mutation!
        // updateOccurrenceMutation.mutate({
        //     occurrenceId: eventId,
        //     data: {
        //         start_time: newStart.toInstant().toString(),
        //         end_time: newEnd.toInstant().toString()
        //     }
        // });
    };

    return (
        <div className="flex flex-col gap-4 p-6 max-w-[1600px] mx-auto">
            <Card>
                <CardHeader>
                    <label className="text-sm font-medium text-muted-foreground">Filter by Resources</label>
                </CardHeader>
                <CardContent>
                    <ComboboxMultiple
                        items={comboboxItems}
                        value={selectedResources}
                        onValueChange={handleResourcesChange}
                    />
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">
                    Loading calendar data...
                </div>
            ) : (
                <Calendar
                    events={events}
                    startDate={startDate}
                    visibleDays={visibleDays}
                    onStartDateChange={handleStartDateChange}
                    onVisibleDaysChange={handleVisibleDaysChange}
                    onEventDrop={handleEventDrop}
                />
            )}
        </div>
    );
}
