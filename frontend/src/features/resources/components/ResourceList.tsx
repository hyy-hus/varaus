import type { ResourceRead } from "#/api/models"
import { columns } from "../columns"
import { DataTable } from "../data-table"

import { useReadResources } from "#/api/endpoints/resources/resources"
import { Card, CardContent, CardHeader } from "#/components/ui/card"

export function ResourceList() {
    const { data: response, isLoading, isError } = useReadResources()

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 text-center text-muted-foreground">
                Loading resources...
            </div>
        )
    }

    if (isError || !response) {
        return (
            <div className="container mx-auto py-10 text-center text-destructive">
                Failed to load resources. Are you offline?
            </div>
        )
    }

    const resources: ResourceRead[] = (response.data as ResourceRead[])

    return (
        <Card>
            <CardHeader>
                <h1 className="font-bold text-xl" >Resources</h1>
                <p>
                    Resources are
                </p>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={resources} />
            </CardContent>
        </Card>
    )
}
