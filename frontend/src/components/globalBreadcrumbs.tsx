import React from "react"
import { Link, useMatches } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function GlobalBreadcrumbs() {
    const { t } = useTranslation()

    const matches = useMatches()

    const breadcrumbMatches = matches.filter((match) => match.staticData?.breadcrumb)

    if (breadcrumbMatches.length === 0) return null

    return (
        <>
            <Breadcrumb className="px-8">
                <BreadcrumbList>
                    {breadcrumbMatches.map((match, index) => {
                        const isLast = index === breadcrumbMatches.length - 1

                        const titleKey = match.staticData.breadcrumb as string
                        const title = t(titleKey)

                        return (
                            <React.Fragment key={match.id}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="text-muted-foreground" >{title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to={match.pathname}>{title}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>

                                {!isLast && <BreadcrumbSeparator />}
                            </React.Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </>
    )
}
