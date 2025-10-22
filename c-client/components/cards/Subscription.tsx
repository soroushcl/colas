import React from 'react';

interface CardProps {
    title: string;
    subtitle: string;
    recipes: string;
    plan: string;
    meals: number;
    totalPrice: number;
    discountRate: number;
    isActive: boolean;
    onToggle?: () => void;
}

const SubscriptionCard: React.FC<CardProps> = ({ title, subtitle, recipes, plan, meals, totalPrice, isActive, discountRate, onToggle }) => {

    const toggleSwitch = () => {
        if (onToggle) {
            onToggle();
        }
        console.log("toggleSwitch SubscriptionCard clicked isActive: ", isActive)
    };

    return (
        <div
            className={`w-96 h-60 flex flex-col items-center p-4 rounded-3xl border relative ${isActive ? 'bg-gray_foreground border-system_light_primary' : 'bg-gray_placeholder border-gray_divider opacity-75'
                }`}
        >
            {/* Top */}
            <div className='flex w-full justify-between'>
                {/* Left */}
                <div>
                    <h3 className={`font-semibold text-system_dark_primary ${isActive ? '' : ''}`}>{title}</h3>
                    <p className={`text-sm font-medium ${isActive ? 'text-system_light_primary' : 'text-label_secondary'}`}>{subtitle}</p>
                </div>
                {/* Switch Button - Top Right */}
                <div className='flex items-center'>
                    {onToggle && <button
                        onClick={toggleSwitch}
                        type='button'
                        className={`w-12 h-6 rounded-full border  transition-colors duration-200 ease-in-out ${isActive
                            ? 'bg-system_light_secondary border-system_secondary md:bg-system_accent md:border-system_light_primary'
                            : 'border-gray_divider bg-gray_placeholder'
                            }`}
                    >
                        <div
                            className={`w-5 h-5 rounded-full shadow-md transition-transform duration-200 ease-in-out ${isActive ? 'transform translate-x-6 bg-system_secondary md:bg-system_light_primary' : 'bg-gray_disable transform translate-x-0.5'
                                }`}
                        />
                    </button>
                    }
                </div>
            </div>

            <div className="flex-1 w-full">
                <div className='pt-3 h-full'>
                    <div className='space-y-1 flex flex-col justify-evenly h-full'>
                        <div className='flex flex-row justify-between items-center'>
                            <span className={`text-sm text-label_tertiary ${isActive ? '' : ''}`}>Recipes:</span>
                            <div className='h-px mx-4 border-t border-dotted border-gray_divider grow'></div>
                            <span className={`text-sm text-label-secondary ${isActive ? '' : ''}`}>{recipes}</span>
                        </div>
                        <div className='flex flex-row justify-between items-center'>
                            <span className={`text-sm text-label_tertiary ${isActive ? '' : ''}`}>Meal Plan:</span>
                            <div className='h-px mx-4 border-t border-dotted border-gray_divider grow'></div>
                            <span className={`text-sm text-label-secondary ${isActive ? '' : ''}`}>{plan}</span>
                        </div>
                        <div className='flex flex-row justify-between items-center'>
                            <span className={`text-sm text-label_tertiary ${isActive ? '' : ''}`}>No. of Full/Half Meals:</span>
                            <div className='h-px mx-4 border-t border-dotted border-gray_divider grow'></div>
                            <span className={`text-sm text-label-secondary ${isActive ? '' : ''}`}>{`${meals} Daily Meals`}</span>
                        </div>
                        <div className='flex flex-row justify-between items-center'>
                            <span className={`text-sm text-label_tertiary ${isActive ? '' : ''}`}>Price with:</span>
                            <div className='h-px mx-4 border-t border-dotted border-gray_divider grow'></div>
                            <div className='flex flex-row justify-between items-center gap-1'>
                                <span className={`text-xs text-system_primary font-light line-through ${isActive ? '' : ''}`}>{totalPrice.toFixed(2)}</span>
                                <span className={`text-sm font-bold ${isActive ? 'text-system_light_primary' : ' text-label-secondary'}`}>{(totalPrice * (100 - discountRate) / 100).toFixed(2)}{"$"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCard;