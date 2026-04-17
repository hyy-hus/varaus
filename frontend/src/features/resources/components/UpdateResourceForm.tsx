import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResourceFormFields } from "./ResourceFormFields"
import type { ResourceRead } from "#/api/models";
import { useDeleteResource, useUpdateResource } from "#/api/endpoints/resources/resources";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { resourceSchema, type ResourceFormValues } from "../schema";
import { useEffect } from "react";
import { toast } from "sonner";

type EditResourceFormProps = {
    resourceId: string;
    initialData: ResourceRead
}

export function EditResourceForm({ resourceId, initialData }: EditResourceFormProps) {
    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        mode: "onChange",
        defaultValues: {
            ...initialData,
            description: initialData.description ?? "", // replace nulls with ""
        }
    })

    const updateMutation = useUpdateResource()
    const deleteMutation = useDeleteResource()

    const watchedData = form.watch()

    useEffect(() => {
        if (!form.formState.isDirty) return;
        if (!form.formState.isValid) return;

        const timeoutId = setTimeout(() => {
            updateMutation.mutate(
                {
                    resourceId: resourceId,
                    data: watchedData as ResourceFormValues
                },
                {
                    onSuccess: () => {
                        toast.success("Changes saved automatically", {
                            position: "bottom-right",
                            duration: 2000,
                        });
                        form.reset(watchedData)
                    },
                    onError: (error) => {
                        console.error("Auto-save failed:", error)
                        toast.error("Failed to save changes. Are you offline?")
                    }
                },
            )
        }, 750)

        return () => clearTimeout(timeoutId)
    }, [watchedData, form.formState.isDirty, form.formState.isValid, resourceId, form])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Resource</CardTitle>
                <CardDescription>
                    Changes to the name and description are saved automatically.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="edit-resource-form">
                    <ResourceFormFields control={form.control} />
                </form>
            </CardContent>
            <CardFooter className="justify-between">
                <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                        // In a real app, you'd wrap this in a Shadcn AlertDialog to confirm deletion!
                        if (window.confirm("Are you sure you want to delete this resource?")) {
                            deleteMutation.mutate(
                                { resourceId: resourceId },
                                { onSuccess: () => toast.success("Resource deleted") }
                            )
                        }
                    }}
                >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>

                {/* Optional visual indicator so they know the network request is happening */}
                <span className="text-sm text-muted-foreground">
                    {updateMutation.isPending ? "Saving..." : "All changes saved"}
                </span>
            </CardFooter>
        </Card>
    )
}
