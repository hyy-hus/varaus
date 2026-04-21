import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { ClipboardPasteIcon, Clock, CopyIcon } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '#/components/ui/hover-card';
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from '#/components/ui/context-menu';

// Import from your new utils file!
import { localTimeZone, ROWS, packReservations, type Reservation, type PositionedReservation } from '@/lib/calendar-utils';

export function HourColumn() {
    return (
        <div className='grid' style={{ gridTemplateRows: `repeat(${ROWS}, calc(var(--spacing) * 4))` }}>
            {Array.from({ length: 24 }).map((_, hourId) => {
                return (
                    <div
                        key={`hour-${hourId}`}
                        id={`hour-${hourId}`}
                        className='px-2 py-1 text-center text-muted-foreground text-xs border border-l-0 border-b-0 first:border-t-0'
                        style={{ gridRow: `${(hourId * 4) + 1} / span 4` }}
                    >
                        {String(hourId).padStart(2, '0')}:00
                    </div>
                )
            })}
        </div>
    )
}

export function Slot({ rowId, colId }: { rowId: number, colId: number }) {
    const { ref, isDropTarget } = useDroppable({
        id: `slot-${colId}-${rowId}`,
        data: { colId, rowId }
    });

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div
                    ref={ref}
                    className={`not-first:nth-[2n+1]:border-t nth-[4n+3]:border-accent hover:bg-primary/20 ${isDropTarget ? 'bg-primary/30' : ''}`}
                    key={rowId}
                />
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem>
                    <ClipboardPasteIcon className="mr-2 h-4 w-4" />
                    Paste
                    <ContextMenuShortcut>Ctrl + V</ContextMenuShortcut>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

interface EventCardProps {
    res: PositionedReservation;
    startRow: number;
    endRow: number;
}

export function EventCard({ res, startRow, endRow }: EventCardProps) {
    const timeString = `${String(res.start.hour).padStart(2, '0')}:${String(res.start.minute).padStart(2, '0')} - ${String(res.end.hour).padStart(2, '0')}:${String(res.end.minute).padStart(2, '0')}`;
    const uniqueDragId = `${res.id}_chunk_${res.start.epochMilliseconds}`;

    const { ref, isDragging } = useDraggable({
        id: uniqueDragId
    });

    return (
        <HoverCard key={`event-${res.name}`}>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <HoverCardTrigger asChild>
                        <div
                            ref={ref}
                            className={`absolute h-full transition-colors hover:brightness-110 cursor-grab active:cursor-grabbing bg-primary border border-emerald-50 dark:border-emerald-950 text-white p-1 text-xs shadow-sm overflow-hidden flex flex-col
                                ${res.isContinuedFromPreviousDay ? 'rounded-t-none border-t-0 border-t-dashed border-t-white/50' : 'rounded-t-md'}
                                ${res.isContinuedInNextDay ? 'rounded-b-none border-b-0 border-b-dashed border-b-white/50 opacity-90' : 'rounded-b-md'}
                                ${isDragging ? 'opacity-40 z-50' : 'z-10'}
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
                        <ContextMenuItem>Open reservation</ContextMenuItem>
                        <ContextMenuItem>
                            <CopyIcon className="mr-2 h-4 w-4" />
                            Copy
                            <ContextMenuShortcut className='flex gap-1'>Ctrl + C</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem>Copy reservation ID</ContextMenuItem>
                        <ContextMenuItem>Copy link to reservation</ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                        <ContextMenuLabel>Management</ContextMenuLabel>
                        <ContextMenuItem>Status</ContextMenuItem>
                        <ContextMenuItem className='text-destructive' >Cancel event</ContextMenuItem>
                    </ContextMenuGroup>
                </ContextMenuContent>
            </ContextMenu>

            {!isDragging && (
                <HoverCardContent className="w-80 z-50" side="right" align="end">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{res.name}</h4>
                        <p className="text-sm text-muted-foreground">
                            {res.description || "No description provided."}
                        </p>
                        <div className="flex items-center pt-2 text-xs text-muted-foreground">
                            <Clock className="mr-2 h-3 w-3" />
                            <span className="font-medium text-foreground">{timeString}</span>
                        </div>
                    </div>
                </HoverCardContent>
            )}
        </HoverCard>
    )
}

interface ColumnProps {
    reservations: Reservation[];
    columnId: number;
}

export function Column({ reservations, columnId }: ColumnProps) {
    const packedReservations = packReservations(reservations);

    return (
        <div className='grid relative not-last:border-r'
            style={{ gridTemplateRows: `repeat(${ROWS}, calc(var(--spacing) * 4))` }}
        >
            {Array.from({ length: ROWS }).map((_, rowId) => (
                <Slot key={rowId} rowId={rowId} colId={columnId} />
            ))}

            {packedReservations.map((res) => {
                const startRow = (res.start.hour * 4) + Math.floor(res.start.minute / 15) + 1;
                let endRow = (res.end.hour * 4) + Math.floor(res.end.minute / 15) + 1;

                if (res.end.hour === 0 && res.end.minute === 0 && res.start.epochMilliseconds < res.end.epochMilliseconds) {
                    endRow = 97;
                }

                return <EventCard key={res.id} res={res} startRow={startRow} endRow={endRow} />
            })}
        </div>
    )
}

export function CurrentTimeLine() {
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
