import { Order, protein } from 'c-lib';
import Image from 'next/image';
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';

export interface PopupProps {
    title: string;
    onSubmit?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    onBack?: () => void;
    orders: { dogName: string, status: string, portions: string, selectedRecipes: string[], shippingDate: Date, id: string }[];
    isOpen: boolean;
}

const UpcomingOrderPopup: React.FC<PopupProps> = ({
    title,
    onSubmit,
    // onOpen,
    onClose,
    onBack,
    isOpen,
    orders,
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
                className="bg-gray_foreground rounded-t-2xl md:rounded-2xl shadow-lg p-6 pb-2 md:pb-6 w-full md:w-[440px] relative"
            >
                <div className='flex flex-col justify-between gap-2'>
                    <div className='flex flex-row justify-between'>
                        {onBack && <button
                            onClick={onBack}
                            className="bg-none px py"
                        >
                            <Image
                                src="/images/popup_back_icon.png"
                                width={24}
                                height={24}
                                alt="close"
                                className=''
                            />
                        </button>}
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
                    <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                    <div className="text-lg mb-0 mt-2 flex flex-col gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className='border-[0.5px] border-gray_divider rounded-2xl p-4 flex flex-col gap-2'>
                                <div className='flex flex-row justify-between border-b-[0.5px] border-gray_divider pb-2'>
                                    <div className='text-system_primary font-roca'>{order.dogName}</div>
                                    <div className='bg-system_light_secondary text-system_secondary px-2 py-1 rounded-2xl text-xs '>{order.status}</div>
                                </div>
                                <div className='flex flex-row justify-between border-b-[0.5px] border-gray_divider pb-2'>
                                    <div className='text-label_secondary text-sm'>{"Portions:"}</div>
                                    <div className='text-system_light_primary text-base'>{order.portions}</div>
                                </div>
                                <div className='flex flex-row justify-between border-b-[0.5px] border-gray_divider pb-2'>
                                    <div className='text-label_secondary text-sm'>{"Recipes:"}</div>
                                    <div className='text-system_light_primary text-base'>{order.selectedRecipes.map((r: number | string) => {
                                        return r == 1 ? ' Beef' : r == 2 ? ' Chicken' : r == 3 ? ' Salmon' : r == 4 ? ' Turkey' : ' ' + r
                                    }).join(', ')}</div>
                                </div>
                                <div className='flex flex-row justify-between'>
                                    <div className='text-label_secondary text-sm'>{"Delivery date:"}</div>
                                    <div className='text-system_light_primary text-sm'>{new Date(order.shippingDate!).toDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="w-full flex justify-center items-center">
                        {onSubmit && (
                            <button
                                onClick={onSubmit}
                                className="border border-system_primary bg-system_primary text-visual_light_amber shadow-md font-bold text-xl text-system_primary w-full h-14 px-4 py-2 rounded-2xl mb-4"
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body // Attach the popup to the body
    );
};

export default UpcomingOrderPopup;