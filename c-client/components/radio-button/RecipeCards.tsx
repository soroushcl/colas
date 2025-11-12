import Image from "next/image";
import React, { useState } from "react";

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
}


const RecipeCards: React.FC<MultiSelectRadioGroupProps> = ({
    options,
    total,
}) => {
    const [salmonCount, setSalmonCount] = useState(options.filter(o => o.title == 'Tasty Salmon')[0].value || 0)
    const [chickenCount, setChickenCount] = useState(options.filter(o => o.title == 'Juicy Chicken')[0].value || 0)
    const [beefCount, setBeefCount] = useState(options.filter(o => o.title == 'Hearty Beef')[0].value || 0)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <div className="rounded-2xl border-gray_divider border-[0.5px] bg-system_accent px-2 py-[0.5px]">
                    <span className={`font-felix_bold ${chickenCount+salmonCount+beefCount == total ? "system_light_primary" :"text-semantic_red"}`}>{chickenCount+salmonCount+beefCount} </span>
                    <span className="text-system_disable_primary">/{total}</span>
                </div>
                <p className="text-sm text-label_secondary">{`You have to choose ${total} meals`}</p>
            </div>
            < div className="flex flex-col gap-6 pb-4" >
                {
                    options.map((option, index) => (
                        <div key={index} >
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
                                                onClick={() => option.title == 'Tasty Salmon' ? setSalmonCount(salmonCount - 1) : option.title == 'Juicy Chicken' ? setChickenCount(chickenCount - 1) : setBeefCount(beefCount - 1)}
                                                disabled={!((option.title == 'Tasty Salmon' && salmonCount) || (option.title == 'Juicy Chicken' && chickenCount) || (beefCount))}
                                                className={`flex justify-center items-center rounded-full w-[22px] h-[22px] text-white text-xl bg-system_light_primary disabled:bg-gray_disable p-[1px]`}
                                            >-</button>
                                            <span className={`w-[32px] flex justify-center text-sm font-felix_bold border-b-2 border-dotted ${5 > 3 ? "border-system_light_primary text-system_light_primary" : "border-gray_disabled text-label_tertiary"}`}>{option.title == 'Tasty Salmon' ? salmonCount : option.title == 'Juicy Chicken' ? chickenCount : beefCount}</span>
                                            <button
                                                type='button'
                                                onClick={() => option.title == 'Tasty Salmon' ? setSalmonCount(salmonCount + 1) : option.title == 'Juicy Chicken' ? setChickenCount(chickenCount + 1) : setBeefCount(beefCount + 1)}
                                                className={`flex justify-center items-center rounded-full w-[22px] h-[22px] text-white text-xl bg-system_light_primary disabled:bg-gray_disable p-[1px]`}
                                                disabled={!((option.title == 'Tasty Salmon' && salmonCount < total) || (option.title == 'Juicy Chicken' && chickenCount < total) || (beefCount < total))}
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
                    ))}
            </div>
        </div>
    );

}
export default RecipeCards;
