import Image from 'next/image';
import React, { ReactNode, useState } from 'react';
import ReactDOM from 'react-dom';
import MainButton from '../buttons/MainButton';

export interface PopupProps {
    title: string;
    content: ReactNode;
    onSubmit?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    onBack?: () => void;
    isOpen: boolean;
    // isLoading?: boolean;
    disabled?: boolean;
}


const DogPopup: React.FC<PopupProps> = ({
    title,
    content,
    onSubmit,
    // onOpen,
    onClose,
    onBack,
    isOpen,
    // isLoading = false,
    disabled,
}) => {

    const [isLoading, setIsLoading] = useState(false)
    const handleSubmit = () => {
        setIsLoading(true)
        if (onSubmit) onSubmit()
    }
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            // onClick={onClose}
            className="fixed inset-0 w-screen h-screen bg-black bg-opacity-20 flex items-end justify-center md:items-center z-50"
        >


            {/* {!isLoading && */}
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
                    <div className="text-lg mb-0 mt-2">{content}</div>
                    <div className="w-full flex justify-center items-center">
                        {onSubmit && (
                            <MainButton
                                onSubmit={handleSubmit}
                                enabled={!disabled}
                                text="Submit"
                            // className="border border-system_primary bg-system_primary text-visual_light_amber shadow-md font-bold text-xl text-system_primary w-full h-14 px-4 py-2 rounded-2xl mb-4"
                            />
                        )}
                    </div>
                </div>
            </div>
            {/* } */}
            {isLoading &&
                <div className='absolute w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center'>
                    <div
                        // onClick={onOpen}
                        className="bg-gray_foreground rounded-2xl shadow-lg p-6 w-[240px] flex flex-col justify-center items-center gap-2"
                    >
                        <div className='relative grid h-12 w-12 '>
                            <div className='absolute inset-0 m-4 rounded-full border-4 border-transparent border-r-[#25b09b] animate-[spin_0.5s_linear_infinite]' />
                            <div className='absolute inset-0 m-2 rounded-full border-4 border-transparent border-r-[#25b09b] animate-[spin_1s_linear_infinite]' />
                            <div className='absolute inset-0 m-0.8 rounded-full border-4 border-transparent border-r-[#25b09b] animate-[spin_1.5s_linear_infinite]' />
                        </div>
                        <p className='text-sm text-label_secondary'>Please wait</p>
                        <p className='text-xs text-label_tertiary'>Fetching data...</p>
                    </div>
                </div>
            }
        </div>,
        document.body // Attach the popup to the body
    );
};

export default DogPopup;