import { CreateResourceForm } from '#/features/resources/components/CreateResourceForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/resources/create')({
    staticData: {
        breadcrumb: 'resources.createTitle'
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <CreateResourceForm />
        </div>)
}
