import { observer } from "mobx-react-lite";
import Image from "next/image";
import React from "react";

export interface ChipOption {
    title: string;
    selected: boolean;
}

interface MultiSelectRadioGroupProps {
    chipOptions: ChipOption[];
    onSelect: (updatedOptions: ChipOption[]) => void; // Callback with updated options
    multiSelect?: boolean; // Flag for multi-select mode
}

const RadioChips = observer(({ chipOptions, onSelect, multiSelect }: MultiSelectRadioGroupProps) => {
    console.log("Rendering RadioChips with options:", chipOptions);
    const handleSelect = (index: number) => {
        console.log("RadioChips selected index", index)
        const updatedOptions = chipOptions.map((chipOption, i) => ({
            ...chipOption,
            selected: multiSelect
                ? i === index
                    ? !chipOption.selected // Toggle selection in multi-select
                    : chipOption.selected
                : i === index, // Single select
        }));
        if (onSelect) {
            onSelect(updatedOptions); // Trigger callback with updated options
        }
    };

    return (
        <div className="flex flex-wrap justify-center gap-4">
            {chipOptions.map((chipOption, index) => (
                <div
                    key={index}
                    className={`flex flex-row items-center gap p-3 rounded-full cursor-pointer ${chipOption.selected ? "bg-system_primary" : "border shadow-sm border-system_dark_primary"
                        }`}
                    onClick={() => handleSelect(index)}
                >
                    {/* Card Image */}
                    {chipOption.selected && (
                        <Image
                            src={`/images/tick.svg`}
                            width={16}
                            height={16}
                            alt={chipOption.title}
                            className="w-4 h-4 rounded-full object-scale-down"
                        />
                    )}

                    {/* Card Content */}
                    <p className={`text-xs ${chipOption.selected ? "text-white" : "text-system_dark_primary"}`}>{chipOption.title}</p>
                </div>
            ))}
        </div>
    );
});

export default RadioChips;
