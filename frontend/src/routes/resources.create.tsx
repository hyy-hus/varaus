import { CreateResourceForm } from '#/components/forms/createResource'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/resources/create')({
    component: RouteComponent,
})

function RouteComponent() {
    return (<div>
        <CreateResourceForm />
    </div>)
}
