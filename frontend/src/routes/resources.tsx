import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/resources')({
    staticData: {
        breadcrumb: 'resources.title'
    },
    component: () => <Outlet />
})
