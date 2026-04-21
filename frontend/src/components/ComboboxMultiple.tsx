import { useComboboxAnchor, Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue } from "#/components/ui/combobox";
import { Button } from "#/components/ui/button";
import { XIcon } from "lucide-react";

export interface ItemProp {
    key: string;
    value: string;
}

export interface ComboboxMultipleProps {
    items: ItemProp[];
    value?: string[];
    onValueChange: (keys: string[]) => void;
}

export function ComboboxMultiple({ items, value = [], onValueChange }: ComboboxMultipleProps) {
    const anchor = useComboboxAnchor();

    const selectedItems = value
        .map(id => items.find(i => i.key === id))
        .filter((item): item is ItemProp => item !== undefined);

    const handleComboChange = (selectedObjects: ItemProp[]) => {
        const exactIds = selectedObjects.map(item => item.key);
        onValueChange(exactIds);
    };

    return (
        <Combobox
            multiple
            autoHighlight
            items={items}
            value={selectedItems}
            onValueChange={handleComboChange}
        >
            <div className="relative w-full">
                <ComboboxChips ref={anchor} className="w-full pr-10">
                    <ComboboxValue>
                        {(selected: ItemProp[]) => (
                            <>
                                {selected.map((item: ItemProp) => (
                                    <ComboboxChip key={item.key}>
                                        {item.value}
                                    </ComboboxChip>
                                ))}
                                <ComboboxChipsInput placeholder="Select resources..." />
                            </>
                        )}
                    </ComboboxValue>
                </ComboboxChips>

                {selectedItems.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleComboChange([]);
                        }}
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: ItemProp) => (
                        <ComboboxItem key={item.key} value={item}>
                            {item.value}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
