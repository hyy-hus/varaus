import { Calendar } from '#/components/calendar/Calendar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calendar/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Calendar />
    )
}
