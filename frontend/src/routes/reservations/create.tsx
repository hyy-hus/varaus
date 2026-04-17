import { CreateResourceForm } from '#/features/resources/components/CreateResourceForm'
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
            Create a new
        </div>)
}
