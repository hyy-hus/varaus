import { CreateReservationForm } from '#/features/reservations/CreateReservationForm';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reservations/create')({
    staticData: {
        breadcrumb: 'reservations.createTitle'
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <CreateReservationForm />
        </div>)
}
