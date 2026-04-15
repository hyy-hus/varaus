import { useReadResources } from '#/api/endpoints/resources/resources';
import { createFileRoute } from '@tanstack/react-router'
import { Plus, AlertCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';

export const Route = createFileRoute('/resources/')({
    component: ResourcesPage,
})

function ResourcesPage() {
    const { data: response, isLoading, isError } = useReadResources();

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="rounded-md border">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load resources. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>List all of the resources in the system</CardDescription>
                <CardAction>
                    <Button>
                        <Plus />
                        New Resource
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className='text-right' >Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.isArray(response?.data) && response.data.length > 0 ? (
                            response.data.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">
                                        {resource.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground max-w-md overflow-x-clip text-ellipsis">
                                        {resource.description || (
                                            <span className="italic">No description</span>
                                        )}
                                    </TableCell>
                                    <TableCell className='text-right' >
                                        <Badge
                                            variant={resource.is_active ? "default" : "secondary"}
                                        >
                                            {resource.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : Array.isArray(response?.data) && response.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No resources found. Create one to get started!
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-destructive">
                                    Data format error.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
