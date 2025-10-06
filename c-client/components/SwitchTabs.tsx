"use client";
import { useState, useEffect, useRef } from "react";

type TabOption = {
  label: string;
  value: string;
};

type SwitchTabsProps = {
  options: readonly TabOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export default function SwitchTabs({ options, value, onChange, className }: SwitchTabsProps) {
  const [internalValue, setInternalValue] = useState<string>(value ?? options[0]?.value);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const activeValue = value ?? internalValue;

  function handleChange(next: string) {
    setInternalValue(next);
    onChange?.(next);
  }

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = options.findIndex(option => option.value === activeValue);
    const activeButton = buttonRefs.current[activeIndex];
    
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width
      });
    }
  }, [activeValue, options]);

  return (
    <div 
      ref={containerRef}
      className={("relative inline-flex items-center bg-gray_placeholder rounded-full " + (className ?? "")).trim()}
    >
      {/* Animated background indicator */}
      <div
        className="absolute top-0 h-full bg-gray_foreground rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
      
      {options.map((option, index) => {
        const isActive = activeValue === option.value;
        return (
          <button
            key={option.value}
            ref={el => { buttonRefs.current[index] = el; }}
            type="button"
            onClick={() => handleChange(option.value)}
            className={
              "relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out " +
              (isActive 
                ? "text-system_light_primary" 
                : "text-label_tertiary hover:text-label_secondary"
              )
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}


