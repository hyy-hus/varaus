import { createFileRoute } from '@tanstack/react-router'
import { EditResourceForm } from '#/features/resources/components/UpdateResourceForm'

import { useReadResource } from '#/api/endpoints/resources/resources'
import type { ResourceRead } from '#/api/models'

export const Route = createFileRoute('/resources/$resourceId/update')({
    staticData: {
        breadcrumb: 'resources.editTitle'
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { resourceId } = Route.useParams()

    const { data: response, isLoading, isError } = useReadResource(resourceId)

    if (isLoading) {
        return <div className="p-4 text-muted-foreground">Loading resource details...</div>
    }

    if (isError || !response) {
        return <div className="p-4 text-red-500">Failed to load resource.</div>
    }

    const resourceData = response.data as ResourceRead

    return (
        <div className="max-w-2xl">
            <EditResourceForm
                resourceId={resourceId}
                initialData={resourceData}
            />
        </div>
    )
}
