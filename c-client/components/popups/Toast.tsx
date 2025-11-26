import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';

export type ToastType = 'success' | 'error';

export interface ToastProps {
    message: string;
    type: ToastType;
    isOpen: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type,
    isOpen,
    onClose,
    duration = 3000,
}) => {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    // if (!isOpen) return null;

    const bgColor = type === 'success'
        ? 'bg-semantic_green_light'
        : 'bg-red-500';

    return ReactDOM.createPortal(
        // <div>
            <div className="absolute bottom-8 md:bottom-16 w-full flex justify-center mx-auto z-50 animate-[slideIn_0.3s_ease-out_forwards]">
                <div
                    className={`
                    ${bgColor} 
                    rounded-2xl 
                    shadow-lg 
                    p-4 
                    min-w-[280px] 
                    max-w-[400px] 
                    flex 
                    items-center 
                    gap-3
                    backdrop-blur-sm
                `}
                >
                    
                    <p className='text-sm text-semantic_green font-medium flex-1'>{message}</p>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1 transition-colors"
                        aria-label="Close toast"
                    >
                        <Image
                            src="/images/popup_close_icon.png"
                            width={16}
                            height={16}
                            alt="close"
                            className=''
                        />
                    </button>
                </div>
            {/* </div> */}
        </div>,
        document.body
    );
};

export default Toast;