import Image from 'next/image';
import React from 'react';
import ReactDOM from 'react-dom';

export interface PopupProps {
    title: string;
    onSubmit?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    isOpen: boolean;
}

const RecipePopup: React.FC<PopupProps> = ({
    title,
    // onSubmit,
    // onOpen,
    onClose,
    isOpen,
}) => {
    // useEffect(() => {
    //     if (isOpen) onOpen?.();
    //     return () => onClose?.();
    // }, [isOpen, onOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            // onClick={onClose}
            className="fixed inset-0 w-screen h-screen bg-black bg-opacity-20 flex items-end justify-center md:items-center z-50"
        >
            <div
                // onClick={onOpen}
                className="bg-gray_foreground rounded-t-2xl md:rounded-2xl shadow-lg p-6 pb-2 md:pb-6 w-full md:w-[890px] relative overflow-hidden"
            >
                <div className='flex flex-col justify-between'>
                    <div className='flex flex-row justify-between px-4'>
                        <span className="text-sm font-normal">{title}</span>
                        <button
                            onClick={onClose}
                            className="bg-none px py"
                        >
                            <Image
                                src="/images/popup_close_icon.png"
                                width={24}
                                height={24}
                                alt="close"
                                className=''
                            />
                        </button>
                    </div>
                    <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider mt-2' />
                    <div className='flex'>
                        <Image
                            src="/images/recipe-popup-left.png"
                            width={300}
                            height={640}
                            alt="close"
                            className='hidden md:flex w-[300px] h-[640px] -ml-[32px]'
                        />
                        <div className='flex flex-col justify-between grow'>
                            <div className='px-6'>
                                <p className='text-system_visual_primary text-lg font-bold pt-4'>FULL INGREDIENT LIST</p>
                                <p className='text-label_secondary text-sm font-medium'>
                                    Grass-Fed Ground Beef, Grass-Fed Beef Liver, Free Run Egg, Salmon Oil, Sweet Potato, Haricot Beans, Kale, Carrot, Blueberry, Ground Almond, Calcium and Phosphorus Minerals, Sea Salt
                                </p>
                                <p className='text-system_visual_primary text-lg font-bold pt-6'>VITAMINS & MINERAL</p>
                                <p className='text-label_secondary text-sm'>
                                    Vitamins & minerals supplied from natural sources: Calcium, Phosphorus, Magnesium, Iron, Copper, Zinc, Manganese, Iodine, Selenium, Sodium, Vitamins A, D3, E, K, C, Thiamine (B1), Riboflavin (B2), Niacin (B3), Pantothenic acid (B5), Pyridoxine (B6), Folic acid (B9), B12, Biotin and Choline.
                                </p>
                                <p className='text-system_visual_primary text-lg font-bold pt-6'>GUARANTEED ANALYSIS</p>
                                <div className='flex py-8 md:py-0'>
                                    <div className='flex flex-col grow gap-3 pt-4'>
                                        <div className='w-full flex justify-between items-center gap-2'>
                                            <span className='text-label_secondary '>Digestible Protein</span>
                                            <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                            <span className='text-label_primary font-medium'>18%</span>
                                        </div>
                                        <div className='w-full flex justify-between items-center gap-2'>
                                            <span className='text-label_secondary'>Crude Protein</span>
                                            <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                            <span className='text-label_primary'>8.9%</span>
                                        </div>
                                        <div className='w-full flex justify-between items-center gap-2'>
                                            <span className='text-label_secondary'>Crude Fat</span>
                                            <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                            <span className='text-label_primary'>Min 9%</span>
                                        </div>
                                        <div className='w-full flex justify-between items-center gap-2'>
                                            <span className='text-label_secondary'>Crude Fiber</span>
                                            <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                            <span className='text-label_primary'>Max 2%</span>
                                        </div>
                                        <div className='w-full flex justify-between items-center gap-2'>
                                            <span className='text-label_secondary'>Moisture</span>
                                            <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                            <span className='text-label_primary'>Max76%</span>
                                        </div>
                                        <div className='w-full flex justify-between items-center gap-2'>
                                            <span className='text-label_secondary'>Calories</span>
                                            <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                            <span className='text-label_primary'>445</span>
                                        </div>
                                    </div>
                                    <Image
                                        src="/images/recipe-popup-box.png"
                                        width={256}
                                        height={256}
                                        alt="close"
                                        className='hidden md:flex w-[256px] h-[256px]'
                                    />
                                </div>
                            </div>
                            <div className='flex justify-evenly items-center bottom-0 h-[84px] w-full bg-system_dark_primary gap-4 md:gap-0 px-4'>
                                <Image
                                    src="/images/recipe-popup-logo.png"
                                    width={48}
                                    height={48}
                                    alt="close"
                                    className='w-[48px] h-[48px]'
                                />
                                <p className='text-xs text-system_accent md:w-[512px]'>
                                    Cola’s Kitchen’s fresh food for dogs is formulated to meet or exceed the nutritional requirements established by the
                                    <span> AAFCO, FEDIAF, NRC & WSAVA</span>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body // Attach the popup to the body
    );
};

export default RecipePopup;