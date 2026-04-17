// import { ResourceList } from '#/features/resources/components/ResourceList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reservations/')({
    staticData: {
        breadcrumb: 'reservations.title'
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            { /* <ResourceList /> */}
            List reservations here
        </div>)
}

