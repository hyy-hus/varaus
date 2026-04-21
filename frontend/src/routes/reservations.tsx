import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reservations')({
    staticData: {
        breadcrumb: 'reservations.title'
    },
    component: () => <Outlet />
})
