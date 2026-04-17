import { Globe } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
    const { i18n } = useTranslation()

    const isActive = (lng: string) => i18n.resolvedLanguage === lng

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Globe className="h-[1.2rem] w-[1.2rem] transition-all" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => i18n.changeLanguage("en")}
                    className={isActive("en") ? "font-bold bg-accent" : ""}
                >
                    English
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => i18n.changeLanguage("fi")}
                    className={isActive("fi") ? "font-bold bg-accent" : ""}
                >
                    Suomi
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => i18n.changeLanguage("sv")}
                    className={isActive("sv") ? "font-bold bg-accent" : ""}
                >
                    Svenska
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
