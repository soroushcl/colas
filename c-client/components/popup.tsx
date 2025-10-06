import Image from 'next/image';
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface PopupProps {
  title: string;
  content: ReactNode;
  onSubmit?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen: boolean;
}

const Popup: React.FC<PopupProps> = ({
  title,
  content,
  onSubmit,
  onAccept,
  onReject,
  onOpen,
  onClose,
  isOpen,
}) => {
  useEffect(() => {
    if (isOpen) onOpen?.();
    return () => onClose?.();
  }, [isOpen, onOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      // onClick={onClose}
      className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-end justify-center md:items-center z-50"
    >
      <div
        onClick={onOpen}
        className="bg-gray_foreground rounded-t-lg md:rounded-lg shadow-lg p-6 w-full md:w-[440px] relative"
      >
        <div className='flex flex-col justify-between gap-2'>
          <div className='flex flex-row justify-between'>
            <span className="text-sm font-normal">{title}</span>
            <button
              onClick={onClose}
              className="bg-none px py"
            >
              <Image
                src="/images/close.svg"
                width={24}
                height={24}
                alt="close"
                className=''
              />
            </button>
          </div>
          <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
          <div className="text-lg mb-6 mt-2">{content}</div>
          <div className="flex justify-between">
            {onSubmit && (
              <button
                onClick={onSubmit}
                className="border border-system_primary bg-system_accent font-bold text-xl text-system_primary w-40 h-14 px-4 py-2 rounded-2xl"
              >
                Submit
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                className="border border-system_primary bg-system_accent font-bold text-xl text-system_primary w-40 h-14 px-4 py-2 rounded-2xl"
              >
                Yes
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="border border-system_primary bg-system_accent font-bold text-xl text-system_primary w-40 h-14 px-4 py-2 rounded-2xl"
              >
                No
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body // Attach the popup to the body
  );
};

export default Popup;