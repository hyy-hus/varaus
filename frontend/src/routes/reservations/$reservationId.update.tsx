import { createFileRoute } from '@tanstack/react-router'
import { EditResourceForm } from '#/features/resources/components/UpdateResourceForm'

import { useReadResource } from '#/api/endpoints/resources/resources'
import type { ResourceRead } from '#/api/models'

export const Route = createFileRoute('/reservations/$reservationId/update')({
    staticData: {
        breadcrumb: 'resources.editTitle'
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { reservationId } = Route.useParams()

    const { data: response, isLoading, isError } = useReadResource(reservationId)

    if (isLoading) {
        return <div className="p-4 text-muted-foreground">Loading reservation details...</div>
    }

    if (isError || !response) {
        return <div className="p-4 text-red-500">Failed to load reservation.</div>
    }

    const reservationData = response.data as ResourceRead

    return (
        <div className="max-w-2xl">
            {/*
            <EditResourceForm
                resourceId={reservationId}
                initialData={reservationData}
            />
            */}
            Edit form here
        </div>
    )
}
