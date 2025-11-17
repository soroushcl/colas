'use client'
import Image from "next/image";
import React, { useState, useEffect } from "react";

export interface Option {
    title: string;
    subtitle?: string;
    secondarySubtitle?: string;
    cardImage: string;
    selectedCardImage?: string;
    value?: number;
    selected: boolean;
    handlePrimarySelect?: () => void;
    handleSecondarySelect?: () => void;
}

interface MultiSelectRadioGroupProps {
    options: Option[];
    total: number;
    onValueChange?: (optionTitle: string, newValue: number) => void;
}


const RecipeCards: React.FC<MultiSelectRadioGroupProps> = ({
    options,
    total,
    onValueChange,
}) => {
    const [recipeValues, setRecipeValues] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        options.forEach(option => {
            initial[option.title] = option.value || 0;
        });
        return initial;
    });

    // Sync with props when they change
    useEffect(() => {
        const newValues: Record<string, number> = {};
        options.forEach(option => {
            newValues[option.title] = option.value || 0;
        });
        setRecipeValues(newValues);
    }, [options]);

    const getTotal = () => {
        return Object.values(recipeValues).reduce((sum, val) => sum + val, 0);
    };

    const updateValue = (title: string, delta: number) => {
        const currentValue = recipeValues[title] || 0;
        const newValue = Math.max(0, Math.min(total, currentValue + delta));
        const totalWithoutThis = getTotal() - currentValue;
        const finalValue = Math.min(newValue, total - totalWithoutThis);
        
        setRecipeValues(prev => ({
            ...prev,
            [title]: finalValue
        }));

        if (onValueChange) {
            onValueChange(title, finalValue);
        }
    };

    const salmonCount = recipeValues['Tasty Salmon'] || 0;
    const chickenCount = recipeValues['Juicy Chicken'] || 0;
    const beefCount = recipeValues['Hearty Beef'] || 0;
    const totalCount = salmonCount + chickenCount + beefCount;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <div className="rounded-2xl border-gray_divider border-[0.5px] bg-system_accent px-2 py-[0.5px]">
                    <span className={`font-felix_bold ${totalCount == total ? "system_light_primary" : "text-semantic_red"}`}>{totalCount} </span>
                    <span className="text-system_disable_primary">/{total}</span>
                </div>
                <p className="text-sm text-label_secondary">{`You have to choose ${total} meals`}</p>
            </div>
            <div className="flex flex-col gap-6 pb-4">
                {
                    options.map((option, index) => {
                        const currentValue = recipeValues[option.title] || 0;
                        const totalOtherValues = totalCount - currentValue;
                        const canIncrease = totalOtherValues < total;
                        const canDecrease = currentValue > 0;

                        return (
                            <div key={index}>
                                <div
                                    className={`w-80 md:w-96 h-[120px] overflow-hidden flex items-center p-2 rounded-3xl transition-all duration-300 bg-gray_foreground text-black border border-gray_divider overflow-hidden`}
                                >
                                    <Image src={option.cardImage} alt={option.title} width={140} height={140} className={`w-[84px] h-[84px]`} />
                                    <div className="flex-1 ml-1 md:ml-4 h-full flex flex-col justify-evenly">
                                        <h3 className="font-roca text-lg font-semibold text-system_dark_primary">{option.title}</h3>
                                        <p className="text-sm text-label_secondary">{option.subtitle}</p>
                                        <p className={`font-felix_light text-xs text-label_secondary`}>{option.secondarySubtitle}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-[86px] text-xs h-full justify-evenly">
                                        <div className='my-0 mx-0 w-full flex flex-col justify-between max-h-full'>
                                            <div className='my-0 mx-auto bg-gray_background p-0 grow w-full max-h-full relative flex flex-row justify-center items-center gap-1'>
                                                <button
                                                    type='button'
                                                    onClick={() => updateValue(option.title, -1)}
                                                    disabled={!canDecrease}
                                                    className={`flex justify-center items-center rounded-full w-[22px] h-[22px] text-white text-xl bg-system_light_primary disabled:bg-gray_disable p-[1px]`}
                                                >-</button>
                                                <span className={`w-[32px] flex justify-center text-sm font-felix_bold border-b-2 border-dotted ${currentValue > 0 ? "border-system_light_primary text-system_light_primary" : "border-gray_disabled text-label_tertiary"}`}>{currentValue}</span>
                                                <button
                                                    type='button'
                                                    onClick={() => updateValue(option.title, 1)}
                                                    disabled={!canIncrease}
                                                    className={`flex justify-center items-center rounded-full w-[22px] h-[22px] text-white text-xl bg-system_light_primary disabled:bg-gray_disable p-[1px]`}
                                                >+</button>
                                            </div>
                                        </div>
                                        <button
                                            type='button'
                                            // onClick={handleSecondarySelect}
                                            className={`py-1 border border-system_secondary rounded-2xl bg-system_light_secondary text-system_dark_secondary`}>
                                            Ingredients
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );

}
export default RecipeCards;
