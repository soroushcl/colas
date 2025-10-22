import React from 'react';
import Image from 'next/image'; // or your preferred image component

interface CardProps {
    title: string;
    subtitle: string;
    description: string;
    cardImage: string;
    selected?: boolean;
    selectedCardImage?: string;
    onSelect?: () => void;
    onSecondarySelect?: () => void;
}

const MainCard: React.FC<CardProps> = ({ title, subtitle, description, cardImage, selected = false, selectedCardImage, onSelect, onSecondarySelect }) => {
    const handleSelect = () => {
        if (onSelect) {
            onSelect();
        }
    };
    const handleSecondarySelect = () => {
        if (onSecondarySelect) {
            onSecondarySelect();
        }
    };

    // Use selectedCardImage if provided and item is selected, otherwise use cardImage
    const imageToShow = selected && selectedCardImage ? selectedCardImage : cardImage;

    return (
        <div
            className={`w-80 md:w-96 h-[120px] flex items-center ${selected ? "pr-4 py-4" : "p-4"} rounded-3xl transition-all duration-300 ${selected ? 'bg-system_primary text-white shadow drop-shadow-md' : 'bg-gray_forground text-black border border-gray_divider overflow-hidden'
                }`}
        >
            <div className={`${selected ? "w-[120px] h-[120px]" : "w-[84px] h-[84px]"} rounded-full `}>
                <Image src={imageToShow} alt={title} width={120} height={120} className={`${selected ? "w-[60px] h-[120px] -ml-0 rounded-3xl rotate-180" : "w-[84px] h-[84px]"}`} />
            </div>
            <div className="flex-1 ml-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm">{subtitle}</p>
                <p className={`text-xs ${selected ? 'text-system_light_accent' : 'text-label_secondary'}`}>{description}</p>
            </div>
            <div className="flex flex-col gap-2 w-20 text-xs">
                <button
                    type='button'
                    onClick={handleSelect}
                    className={`py-1 px-3 transition-colors rounded-2xl ${selected
                        ? 'bg-system_visual_primary text-white border border-system_light_accent'
                        : 'bg-system_accent text-system_primary text-bold'
                        }`}
                >
                    {selected ? 'Selected' : '+ Add'}
                </button>
                <button
                    type='button'
                    onClick={handleSecondarySelect}
                    className={`py-1 px-3 border border-system_light_primary rounded-2xl ${selected
                        ? 'bg-system_visual_primary text-white'
                        : 'bg-white text-system_light_primary'}`}>
                    Ingredients
                </button>
            </div>
        </div>
    );
};

export default MainCard;