import { LanguageToggle } from "./languageToggle";
import { ModeToggle } from "./modeToggle";

export default function Header() {
    return (
        <header className="p-8 flex items-center-safe justify-between">
            <span className="font-bold text-xl tracking-tight">Varaus</span>
            <div className="flex gap-2 items-center-safe" >
                <LanguageToggle />
                <ModeToggle />
            </div>
        </header>
    )
}
