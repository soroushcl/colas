'use client'
import Image from "next/image";
import React from "react";
import MainCard from "../cards/MainCard";

export interface Option {
  title: string;
  subtitle?: string;
  secondarySubtitle?: string;
  cardImage?: string;
  selectedCardImage?: string;
  value?: string;
  amount?: number;
  selected: boolean;
  handlePrimarySelect?: () => void;
  handleSecondarySelect?: () => void;
}

interface MultiSelectRadioGroupProps {
  options: Option[];
  onSelect?: (updatedOptions: number) => void; // Callback with updated options
  multiSelect?: boolean; // Flag for multi-select mode
  type?: string;
}

const RadioGroup: React.FC<MultiSelectRadioGroupProps> = ({
  options,
  onSelect,
  multiSelect = false,
  type = 'default',
}) => {
  const handleSelect = (index: number) => {
    // console.log("index", index)
    // const updatedOptions = options.map((option, i) => ({
    //   ...option,
    //   selected: multiSelect
    //     ? i === index
    //       ? !option.selected // Toggle selection in multi-select
    //       : option.selected
    //     : i === index, // Single select
    // }));
    // console.log("updatedOptions", updatedOptions)
    if (onSelect) {
      onSelect(index); // Trigger callback with updated options
    }
  };

  if (type !== "card") {
    return (
      < div className="w-[340px] md:w-[384px] flex flex-col gap-6" >
        {
          options.map((option, index) => (

            <div
              key={index}
              className={`flex items-center ${!option.cardImage ? "gap-4" : ""} pe-4 border rounded-xl cursor-pointer ${option.selected ? "shadow-xs border-system_primary bg-system_accent" : "shadow-sm border-gray_divider bg-gray_forground"
                }`}
              onClick={() => handleSelect(index)}
            >
              {/* Card Image */}
              {option.cardImage && (
                <Image
                  src={`/images/${option.cardImage}`}
                  width={96}
                  height={96}
                  alt={option.title}
                  className="w-[96px] h-[96px] object-scale-down p-1"
                />
              )}

              {/* Card Content */}
              <div className={`flex flex-col flex-grow gap-1 ${!option.cardImage ? "p-4" : "py-4 pl-1"}`}>
                <h3 className={`font-roca font-semibold text-lg ${option.selected ? "text-system_primary" : "text-system_dark_primary"}`}>{option.title}</h3>
                {option.subtitle && (
                  <p className={`text-sm mb-2 ${option.selected ? "text-system_primary" : "text-label_primary"}`}>{option.subtitle}</p>
                )}
                {option.secondarySubtitle && (
                  <p className={`text-xs ${option.selected ? "text-system_primary" : "text-label_secondary"}`}>{option.secondarySubtitle}</p>
                )}
              </div>

              {/* Selected Tick Icon */}
              <div
                className={`w-5 h-5 flex items-center justify-center rounded-full ${option.selected ? "border-3 border-system_primary" : "border-2 border-gray_icon"
                  }`}
              >
                {option.selected && (
                  <Image
                    src={`/images/selected.svg`}
                    width={20}
                    height={20}
                    alt={option.title}
                    className="w-5 h-5 rounded-full object-scale-down"
                  />
                )}
              </div>
            </div>
          ))
        }
      </div >
    );

  } else {
    return (
      < div className="flex flex-col gap-6" >
        {
          options.map((option, index) => (
            <div key={index} >
              <MainCard
                title={option.title}
                subtitle={option.subtitle!}
                description={option.secondarySubtitle!}
                cardImage={option.cardImage!}
                selected={option.selected}
                selectedCardImage={option.selectedCardImage}
                onPrimarySelect={() => handleSelect(index)}
                onSecondarySelect={option.handleSecondarySelect}
              />
            </div>
          ))}
      </div>
    )
  }
}
export default RadioGroup;
