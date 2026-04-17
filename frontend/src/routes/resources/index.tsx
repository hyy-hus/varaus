import { ResourceList } from '#/features/resources/components/ResourceList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/resources/')({
    staticData: {
        breadcrumb: 'resources.title'
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <ResourceList />
        </div>)
}

