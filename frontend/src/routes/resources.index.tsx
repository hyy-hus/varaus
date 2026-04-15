import { useReadResources } from '#/api/endpoints/resources/resources';
import { createFileRoute } from '@tanstack/react-router'
import { Plus, AlertCircle } from 'lucide-react';

// shadcn-ui imports (adjust the paths based on your setup, usually @/components/...)
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
        <div className="max-w-4xl mx-auto">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Resource
                </Button>
            </div>

            {/* Table Area */}
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
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
                                    <TableCell className="text-muted-foreground">
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
            </div>
        </div>
    );
}
