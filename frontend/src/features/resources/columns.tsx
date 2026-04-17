import type { ResourceRead } from "#/api/models"
import { Button } from "#/components/ui/button"
import { Checkbox } from "#/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "#/components/ui/dropdown-menu"
import type { ColumnDef } from "@tanstack/react-table"
import { Copy, Edit, MoreHorizontal } from "lucide-react"
import { DataTableColumnHeader } from "./data-table-column-header"
import { toast } from "sonner"
import { Link } from "@tanstack/react-router"
import { Badge } from "#/components/ui/badge"

export const columns: ColumnDef<ResourceRead>[] = [
    {
        id: "select",
        size: 40,
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        size: 250,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        )
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ getValue }) => (
            <div className="max-w-md overflow-x-clip text-ellipsis">
                {(getValue() as string) ?? ""}
            </div>
        )
    },
    {
        accessorKey: "is_active",
        size: 100,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ getValue }) => {
            const isActive = getValue() as boolean;

            return (
                <div className="flex w-[100px] items-center">
                    {isActive ? (
                        <Badge variant="default">Active</Badge>
                    ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                            Inactive
                        </Badge>
                    )}
                </div>
            )
        }
    },
    {
        id: "actions",
        size: 40,
        cell: ({ row }) => {
            const resource = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                            <Link
                                to="/resources/$resourceId/update"
                                params={{ resourceId: resource.id }}
                                className="cursor-pointer flex items-center"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Resource
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(resource.id)
                                toast.success("Resource ID copied to clipboard")
                            }}
                            className="cursor-pointer flex items-center"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]


