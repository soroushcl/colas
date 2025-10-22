"use client";
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

interface HorizontalWeightSelectorProps {
    value: number;
    onChange: (weight: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const HorizontalWeightSelector: React.FC<HorizontalWeightSelectorProps> = ({
    value,
    onChange,
    min = 5,
    max = 200,
    step = 0.5
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, value: 0 });

    // Generate weight values
    const weights: number[] = [];
    for (let i = min; i <= max; i += step) {
        weights.push((i * 10) / 10); // Round to 1 decimal place
    }

    // Calculate position based on value
    const getPositionFromValue = (val: number) => {
        const index = weights.findIndex(w => w >= val);
        return index >= 0 ? index : weights.length - 1;
    };

    const getValueFromPosition = (position: number) => {
        return weights[Math.max(0, Math.min(weights.length - 1, position))];
    };

    // Handle mouse/touch events
    const handleStart = (clientX: number) => {
        setIsDragging(true);
        setDragStart({ x: clientX, value });
    };

    const handleMove = (clientX: number) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = clientX - dragStart.x;
        const pixelsPerStep = rect.width / weights.length;
        const stepsMoved = Math.round(deltaX / pixelsPerStep);
        const newPosition = getPositionFromValue(dragStart.value) + stepsMoved;
        const newValue = getValueFromPosition(newPosition);

        onChange(newValue);
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        // e.preventDefault();
        handleStart(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        // e.preventDefault();
        handleStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    // Add global event listeners when dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragStart, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    // const currentPosition = getPositionFromValue(value);
    // const indicatorPosition = (currentPosition / (weights.length - 1)) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto relative">
            {/* Container */}
            <div
                ref={containerRef}
                className="relative h-24 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Horizontal ruler */}
                <div className="h-32 flex items-center w-[250px] overflow-x-scroll">
                    {weights.map((weight, index) => {
                        const isMajorTick = weight % 5 === 0; // Every whole number
                        const isMinorTick = !isMajorTick && (weight ) % 2 === 0; // Every 0.5

                        return (
                            <div
                                key={weight}
                                className="flex flex-col items-center justify-center "
                                style={{
                                    left: `${(index / (weights.length - 1)) * 100}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                {/* Number labels for major ticks */}
                                {isMajorTick && (
                                    <div className="text-sm text-gray-800 font-semibold">
                                        {weight}
                                    </div>
                                )}
                                {/* Tick mark */}
                                <div
                                    className={`${isMajorTick
                                        ? 'w-1 h-8 bg-gray-800'
                                        : isMinorTick
                                            ? 'w-1 h-6 bg-purple-300'
                                            : 'w-1 h-4 bg-purple-200'
                                        }`}
                                />


                            </div>
                        );
                    })}
                </div>



            </div>

            {/* Weight display box */}
            <div className="mt-8 flex justify-center">
                <div className="w-[166px] bg-system_accent rounded-xl px-8 py-4 shadow-lg text-center">
                    <span className="text-system_light_primary font-normal text-2xl">
                        {value} lbs
                    </span>
                </div>
            </div>
            {/* Center indicator line */}
            <Image
                src={`/images/weight_arrow.png`}
                width={20}
                height={20}
                className="object-fit absolute top-0 left-1/2 w-[10px] h-[100px] z-20"
                alt={"Cola"}
            />

        </div>
    );
};

export default HorizontalWeightSelector;
