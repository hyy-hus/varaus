import { useReadOccurrences } from '#/api/endpoints/reservations/reservations';
import type { OccurrenceRead } from '#/api/models';
import { Calendar, type CalendarEvent } from '#/components/calendar/Calendar'
import { Temporal } from '@js-temporal/polyfill';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react';
import { z } from 'zod';

const localTimeZone = Temporal.Now.timeZoneId();

const calendarSearchSchema = z.object({
    date: z.string().optional(),
    days: z.number().catch(3).optional(), // Defaults to 3 if someone types ?days=invalid
});

export const Route = createFileRoute('/calendar/')({
    validateSearch: calendarSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const search = Route.useSearch();
    const navigate = useNavigate({ from: Route.id });

    const startDate = search.date
        ? Temporal.PlainDate.from(search.date)
        : Temporal.Now.plainDateISO(localTimeZone);

    const visibleDays = search.days || 3;

    const { data: occurrencesResponse, isLoading } = useReadOccurrences();

    const events = useMemo<CalendarEvent[]>(() => {
        if (!occurrencesResponse?.data) return [];

        if (occurrencesResponse.status !== 200) {
            console.error("API returned an error:", occurrencesResponse.data);
            return [];
        }

        return occurrencesResponse.data.map((occ: OccurrenceRead) => {
            return {
                id: occ.id,
                // Note: If your readOccurrences route doesn't return the reservation name yet,
                // it will fall back to showing the reservation UUID. 
                // You can update your backend to JOIN the reservation table later!
                name: (occ as any).reservation_name || `Res: ${occ.reservation_id.split('-')[0]}`,
                description: (occ as any).reservation_description || "",

                start: Temporal.Instant.from(occ.start_time).toZonedDateTimeISO(localTimeZone),
                end: Temporal.Instant.from(occ.end_time).toZonedDateTimeISO(localTimeZone),
            };
        });
    }, [occurrencesResponse]);

    // 7. Navigation Handlers to update the URL (which instantly re-renders the page!)
    const handleStartDateChange = (newDate: Temporal.PlainDate) => {
        navigate({
            search: (prev) => ({
                ...prev,
                date: newDate.toString(),
            }),
            // Optional: Keeps the scroll position stable when changing days
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
        <div className="p-6 max-w-[1600px] mx-auto">
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
