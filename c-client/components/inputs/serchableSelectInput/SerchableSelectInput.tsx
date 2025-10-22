import React, { useState, useRef } from "react";
import LargeInput from "../largeInput/LargeInput";
import './style.css'
// import Image from "next/image";

interface SearchableSelectProps {
  options: string[];
  selected?: string;
  placeholder?: string;
  isSmall?: boolean;
  isBig?: boolean;
  id?: string;
  onSelect: (value: string) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  selected,
  placeholder = "Select an option",
  isSmall,
  isBig,
  id,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState(selected ? selected : "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setSearchTerm(value); // Show the selected value in the input
    setIsOpen(false); // Close the dropdown
    setHighlightedIndex(-1); // Reset highlighted index
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Use setTimeout to allow click events to fire before closing
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reset highlighted index when search term changes
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  return (
    <div
      className="relative"
      ref={containerRef}
      onBlur={handleBlur}
    >
      {/* Input Field */}
      <LargeInput
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-10"
        hasImage
        isSmall={isSmall}
        isBig={isBig}
        id={id}
      />
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-[76px] left-0 right-0 z-50 mt-1">
          <ul className="bg-white border rounded-2xl border-gray_divider shadow-lg max-h-60 overflow-y-auto scrollbar-custom">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className={`h-12 px-3 py-2 text-label_primary flex items-center cursor-pointer border-gray_divider first:border-none border-t ${
                    index === highlightedIndex 
                      ? 'bg-blue-100' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  tabIndex={0}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};



export default SearchableSelect;
