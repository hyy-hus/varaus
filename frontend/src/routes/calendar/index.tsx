import { createFileRoute } from '@tanstack/react-router'
import { Temporal } from '@js-temporal/polyfill'
import { Card, CardContent, CardHeader } from '#/components/ui/card';
import { ScrollArea } from '#/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { Button } from '#/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ClipboardPasteIcon, Clock, Command, CopyIcon, Option } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '#/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '#/components/ui/hover-card';
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from '#/components/ui/context-menu';

export const Route = createFileRoute('/calendar/')({
    staticData: {
        breadcrumb: 'calendar.title'
    },
    component: RouteComponent,
})

interface Reservation {
    name: string;
    description: string;
    start: Temporal.ZonedDateTime;
    end: Temporal.ZonedDateTime;
    isContinuedFromPreviousDay?: boolean;
    isContinuedInNextDay?: boolean;
}

const localTimeZone = Temporal.Now.timeZoneId();
const ROWS = 24 * 4;

function HourColumn() {
    const ROWS = 24 * 4;
    return (
        <div className='grid'
            style={{
                gridTemplateRows: `repeat(${ROWS}, calc(var(--spacing) * 4))`,
            }}
        >
            {Array.from({ length: 24 }).map((_, hourId) => {
                return (
                    <div
                        key={`hour-${hourId}`}
                        id={`hour-${hourId}`}
                        className='px-2 py-1 text-center text-muted-foreground text-xs border border-l-0 border-b-0 first:border-t-0'
                        style={{
                            gridRow: `${(hourId * 4) + 1} / span 4`
                        }}
                    >
                        {String(hourId).padStart(2, '0')}:00
                    </div>
                )
            })}
        </div>
    )
}

type PositionedReservation = Reservation & {
    widthPercent: number;
    leftOffsetPercent: number;
};

function processCluster(cluster: Reservation[]): PositionedReservation[] {
    const tracks: number[] = [];
    const eventTracks: { event: Reservation; trackIndex: number }[] = [];

    for (const res of cluster) {
        let trackIndex = tracks.findIndex(trackEnd => trackEnd <= res.start.epochMilliseconds);

        if (trackIndex === -1) {
            trackIndex = tracks.length;
            tracks.push(res.end.epochMilliseconds);
        } else {
            tracks[trackIndex] = res.end.epochMilliseconds;
        }

        eventTracks.push({ event: res, trackIndex });
    }

    const totalColumns = tracks.length;

    return eventTracks.map(({ event, trackIndex }) => ({
        ...event,
        widthPercent: 100 / totalColumns,
        leftOffsetPercent: (100 / totalColumns) * trackIndex,
    }));
}

function packReservations(reservations: Reservation[]): PositionedReservation[] {
    if (reservations.length === 0) return [];

    const sorted = [...reservations].sort((a, b) => {
        if (a.start.epochMilliseconds === b.start.epochMilliseconds) {
            return a.end.epochMilliseconds - b.end.epochMilliseconds;
        }
        return a.start.epochMilliseconds - b.start.epochMilliseconds;
    });

    const positioned: PositionedReservation[] = [];
    let currentCluster: Reservation[] = [];
    let clusterEndTime = 0;

    for (const res of sorted) {
        if (currentCluster.length > 0 && res.start.epochMilliseconds >= clusterEndTime) {
            positioned.push(...processCluster(currentCluster));
            currentCluster = [];
            clusterEndTime = 0;
        }
        currentCluster.push(res);
        clusterEndTime = Math.max(clusterEndTime, res.end.epochMilliseconds);
    }

    if (currentCluster.length > 0) {
        positioned.push(...processCluster(currentCluster));
    }

    return positioned;
}

interface ColumnProps {
    reservations: Reservation[];
}

function Column({ reservations }: ColumnProps) {

    const packedReservations = packReservations(reservations);

    const [currentDropTarget, setCurrentDropTarget] = useState<number | null>(null);

    return (
        <div className='grid relative not-last:border-r'
            onDragLeave={() => setCurrentDropTarget(null)}
            style={{
                gridTemplateRows: `repeat(${ROWS}, calc(var(--spacing) * 4))`,
            }}
        >
            {Array.from({ length: ROWS }).map((_, rowId) => {
                return (
                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                            <div
                                onDragEnter={() => setCurrentDropTarget(rowId)}
                                className='not-first:nth-[2n+1]:border-t nth-[4n+3]:border-accent hover:bg-emerald-700/20'
                                style={{
                                    backgroundColor: currentDropTarget === rowId ? 'red' : ''
                                }}
                                key={rowId}
                            >
                            </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem>
                                <ClipboardPasteIcon />
                                Paste
                                <ContextMenuShortcut>
                                    Ctrl + V
                                </ContextMenuShortcut>
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                )
            })}

            {packedReservations.map((res, index) => {
                const startRow = (res.start.hour * 4) + Math.floor(res.start.minute / 15) + 1;
                let endRow = (res.end.hour * 4) + Math.floor(res.end.minute / 15) + 1;

                if (res.end.hour === 0 && res.end.minute === 0 && res.start.epochMilliseconds < res.end.epochMilliseconds) {
                    endRow = 97;
                }

                const timeString = `${String(res.start.hour).padStart(2, '0')}:${String(res.start.minute).padStart(2, '0')} - ${String(res.end.hour).padStart(2, '0')}:${String(res.end.minute).padStart(2, '0')}`;

                return (
                    <HoverCard key={`event-${index}`}>
                        <ContextMenu>
                            <ContextMenuTrigger asChild>
                                <HoverCardTrigger asChild>
                                    <div
                                        draggable="true"
                                        className={`absolute h-full cursor-pointer hover:brightness-110 transition-all bg-primary border border-emerald-50 dark:border-emerald-950 text-white p-1 text-xs shadow-sm overflow-hidden flex flex-col
                        ${res.isContinuedFromPreviousDay ? 'rounded-t-none border-t-0 border-t-dashed border-t-white/50' : 'rounded-t-md'}
                        ${res.isContinuedInNextDay ? 'rounded-b-none border-b-0 border-b-dashed border-b-white/50 opacity-90' : 'rounded-b-md'}
                    `}
                                        style={{
                                            gridRow: `${startRow} / ${endRow}`,
                                            gridColumn: '1 / -1',
                                            left: `${res.leftOffsetPercent}%`,
                                            width: `${res.widthPercent}%`,
                                            borderLeftWidth: res.leftOffsetPercent > 0 ? '2px' : '0px',
                                            borderLeftColor: 'transparent',
                                            backgroundClip: 'padding-box'
                                        }}
                                    >
                                        <span className="font-bold truncate">{res.name}</span>

                                        {endRow - startRow > 2 && (
                                            <span className="opacity-90 truncate">{res.description}</span>
                                        )}
                                    </div>
                                </HoverCardTrigger>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuGroup>
                                    <ContextMenuItem>
                                        Open reservation
                                    </ContextMenuItem>
                                    <ContextMenuItem>
                                        <CopyIcon />
                                        Copy
                                        <ContextMenuShortcut className='flex gap-1'>
                                            Ctrl + C
                                        </ContextMenuShortcut>
                                    </ContextMenuItem>
                                    <ContextMenuItem>Copy reservation ID</ContextMenuItem>
                                    <ContextMenuItem>Copy link to reservation</ContextMenuItem>
                                </ContextMenuGroup>
                                <ContextMenuSeparator />
                                <ContextMenuGroup>
                                    <ContextMenuLabel>Management</ContextMenuLabel>
                                    <ContextMenuItem>
                                        Status
                                    </ContextMenuItem>
                                    <ContextMenuItem className='text-destructive' >
                                        Cancel event
                                    </ContextMenuItem>

                                </ContextMenuGroup>
                            </ContextMenuContent>
                        </ContextMenu>

                        <HoverCardContent
                            className="w-80 z-50"
                            side="right"
                            align="end"
                        >
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">{res.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {res.description || "No description provided."}
                                </p>
                                <div className="flex items-center pt-2 text-xs text-muted-foreground">
                                    <Clock className="mr-2 h-3 w-3" />
                                    <span className="font-medium text-foreground">
                                        {timeString}
                                    </span>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                )
            })}
        </div>
    )
}

function CurrentTimeLine() {
    const [now, setNow] = useState(() => Temporal.Now.zonedDateTimeISO(localTimeZone));

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Temporal.Now.zonedDateTimeISO(localTimeZone));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const minutesSinceMidnight = (now.hour * 60) + now.minute;
    const percentageDown = (minutesSinceMidnight / 1440) * 100;

    return (
        <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{
                top: `${percentageDown}%`,
                transform: 'translateY(-50%)'
            }}
        >
            <div className="w-2 h-2 rounded-full bg-rose-500 absolute -left-1" />

            <div className="w-full h-[2px] bg-rose-500/80" />
        </div>
    );
}

function splitReservationsIntoDays(
    reservations: Reservation[],
    days: Temporal.PlainDate[],
    timeZone: string
) {
    return days.map(day => {
        const dayStart = day.toZonedDateTime({ timeZone });
        const dayEnd = dayStart.add({ days: 1 });

        const chunks: Reservation[] = [];

        for (const res of reservations) {
            if (res.start.epochMilliseconds < dayEnd.epochMilliseconds &&
                res.end.epochMilliseconds > dayStart.epochMilliseconds) {

                const chunkStart = res.start.epochMilliseconds < dayStart.epochMilliseconds
                    ? dayStart
                    : res.start;

                const chunkEnd = res.end.epochMilliseconds > dayEnd.epochMilliseconds
                    ? dayEnd
                    : res.end;

                chunks.push({
                    ...res,
                    start: chunkStart,
                    end: chunkEnd,
                    isContinuedFromPreviousDay: res.start.epochMilliseconds < dayStart.epochMilliseconds,
                    isContinuedInNextDay: res.end.epochMilliseconds > dayEnd.epochMilliseconds
                });
            }
        }

        return {
            date: day,
            reservations: chunks
        };
    });
}

function RouteComponent() {
    const reservations: Reservation[] = [
        {
            name: "Reservation A",
            description: "On track #1",
            start: Temporal.Instant.from("2026-04-17T06:00:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T10:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation B",
            description: "On track #2",
            start: Temporal.Instant.from("2026-04-17T09:00:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T14:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation C",
            description: "On track #1",
            start: Temporal.Instant.from("2026-04-17T11:00:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T12:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation D",
            description: "On track #1",
            start: Temporal.Instant.from("2026-04-17T15:00:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T16:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation E",
            description: "On track #2 ",
            start: Temporal.Instant.from("2026-04-17T15:15:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T16:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation F",
            description: "On track #3",
            start: Temporal.Instant.from("2026-04-17T15:30:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T16:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation G",
            description: "Alone, but right after D-E cluster",
            start: Temporal.Instant.from("2026-04-17T16:00:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-17T17:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
        {
            name: "Reservation H",
            description: "Crosses day lines!",
            start: Temporal.Instant.from("2026-04-17T20:00:00Z").toZonedDateTimeISO(localTimeZone),
            end: Temporal.Instant.from("2026-04-18T04:00:00Z").toZonedDateTimeISO(localTimeZone),
        },
    ];

    function getCurrentDate() {
        return Temporal.Now.plainDateISO(localTimeZone);
    }

    const [startDate, setStartDate] = useState(getCurrentDate());
    const [visibleDays, setVisibleDays] = useState(3);

    const targetDays = Array.from({ length: visibleDays }).map((_, i) => {
        return startDate.add({ days: i });
    });

    const columnsData = splitReservationsIntoDays(reservations, targetDays, localTimeZone);

    function focusCurrentDay() {
        setStartDate(getCurrentDate());
    }

    function focusCurrentHour(style: 'auto' | 'smooth' | 'instant' = 'instant') {
        const currentHour = Temporal.Now.zonedDateTimeISO(localTimeZone).hour;
        const targetHour = Math.max(0, currentHour - 1);

        const element = document.getElementById(`hour-${targetHour}`);

        if (element) {
            element.scrollIntoView({
                behavior: style,
                block: 'start'
            })
        }

    }

    useEffect(focusCurrentHour, []);

    function focusNow() {
        focusCurrentDay();
        focusCurrentHour('smooth');
    }

    const formatDayHeader = (date: Temporal.PlainDate) => {
        return new Date(date.toString()).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    return (
        <Card>
            <CardHeader>
                <div className='flex justify-between items-center'>
                    <h1 className='text-xl font-bold'>Calendar</h1>

                    <div className='flex gap-2 items-center'>
                        <Select value={String(visibleDays)}
                            onValueChange={(val) => {
                                const newVisibleDays = Number(val);
                                setVisibleDays(newVisibleDays);

                                if (newVisibleDays === 5 || newVisibleDays === 7) {
                                    setStartDate(prev => {
                                        const daysToSubtract = prev.dayOfWeek - 1;
                                        return prev.subtract({ days: daysToSubtract });
                                    });
                                }
                            }}
                        >
                            <SelectTrigger className='w-full max-w-48'>
                                <SelectValue placeholder="Select amount of days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Individual days</SelectLabel>
                                    <SelectItem value="1">1 day</SelectItem>
                                    <SelectItem value="3">3 days</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Whole week</SelectLabel>
                                    <SelectItem value="5">Work week</SelectItem>
                                    <SelectItem value="7">Full week</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline"
                            onClick={() => setStartDate(prev => {
                                if (visibleDays === 5 || visibleDays === 7) {
                                    const currentMonday = prev.subtract({ days: prev.dayOfWeek - 1 });
                                    return currentMonday.subtract({ days: 7 });
                                }
                                return prev.subtract({ days: visibleDays });
                            })}
                        >
                            <ChevronsLeft />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setStartDate(prev => prev.subtract({ days: 1 }))}>
                            <ChevronLeft />
                        </Button>
                        <Button className='inline-flex' variant="outline" onClick={() => focusNow()}>
                            Now
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setStartDate(prev => prev.add({ days: 1 }))}>
                            <ChevronRight />
                        </Button>
                        <Button size="sm" variant="outline"
                            onClick={() => setStartDate(prev => {
                                if (visibleDays === 5 || visibleDays === 7) {
                                    const currentMonday = prev.subtract({ days: prev.dayOfWeek - 1 });
                                    return currentMonday.add({ days: 7 });
                                }
                                return prev.add({ days: visibleDays });
                            })}
                        >
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>

            </CardHeader>
            <CardContent>
                <ScrollArea className='border rounded-md h-150' >
                    <div
                        className='sticky top-0 z-30 grid bg-muted border-b shadow-sm'
                        style={{ gridTemplateColumns: `50px repeat(${visibleDays}, 1fr)` }}
                    >
                        <div className="border-r text-center text-xs flex items-center py-2 justify-center text-muted-foreground bg-muted">
                            time
                        </div>

                        {targetDays.map(day => (
                            <div key={`header-${day.toString()}`} className="py-2 text-center text-sm not-last:border-r bg-muted">
                                {formatDayHeader(day)}
                            </div>
                        ))}
                    </div>

                    <div className='grid relative'
                        style={{
                            gridTemplateColumns: `50px repeat(${visibleDays},1fr)`
                        }}
                    >
                        <HourColumn />

                        {columnsData.map((dayData) => (
                            <Column
                                key={dayData.date.toString()}
                                reservations={dayData.reservations}
                            />
                        ))}

                        <CurrentTimeLine />
                    </div>

                </ScrollArea>
            </CardContent>
        </Card >
    )
}
