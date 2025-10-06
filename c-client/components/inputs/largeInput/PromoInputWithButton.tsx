import React, { useState } from "react";
import LargeInput from "./LargeInput";
import Image from "next/image";

interface PromoInputWithButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onApply: () => void;
  onCancel: () => void;
  error?: string;
  value: string;
  st?: string;
  setValue: (v: string) => void;
}

const PromoInputWithButton: React.FC<PromoInputWithButtonProps> = ({
  onApply,
  onCancel,
  error,
  value,
  st,
  setValue,
  ...rest
}) => {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    onApply();
  };

  const handleCancel = () => {
    setApplied(false);
    onCancel();
  };

  return (
    <div className="flex justify-between relative h-24 w-full md:w-[236px] mx-auto">
      <LargeInput
        {...rest}
        value={value}
        onChange={e => setValue(e.target.value)}
        error={error}
        disabled={applied}
        className="pr-20 w-full" // add padding for button
        isBig
        st={st}
      />
      <div className="absolute right-8 md:right-2 top-12 -translate-y-9">
        {applied ? (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-red-500"
            aria-label="Cancel"
          >
            <Image
              src="/images/close.svg"
              width={32}
              height={32}
              alt="close"
              className=''
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            className={`text-xs font-bold px-4 py-2 rounded-3xl border ${value ? "bg-system_light_secondary text-system_secondary border-system_secondary" : "text-white bg-gray_divider"} ${st == 'green' ? "text-gray_divider bg-[#5F7866] border-none" : ""}`}
            disabled={!value}
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

export default PromoInputWithButton;