import { Temporal } from '@js-temporal/polyfill';

export const localTimeZone = Temporal.Now.timeZoneId();
export const ROWS = 24 * 4;

export interface Reservation {
    id: number;
    name: string;
    description: string;
    start: Temporal.ZonedDateTime;
    end: Temporal.ZonedDateTime;
    isContinuedFromPreviousDay?: boolean;
    isContinuedInNextDay?: boolean;
}

export type PositionedReservation = Reservation & {
    widthPercent: number;
    leftOffsetPercent: number;
};

export function processCluster(cluster: Reservation[]): PositionedReservation[] {
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

export function packReservations(reservations: Reservation[]): PositionedReservation[] {
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

export function splitReservationsIntoDays(
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
