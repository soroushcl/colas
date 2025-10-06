"use client"
import React from 'react';
import Image from 'next/image';

type ReviewProps = {
    title: string;
    rating: number; // 1-5
    text: string;
    author: string;
    avatarSrc?: string;
    selected?: boolean;
};

const Review: React.FC<ReviewProps> = ({ title, rating, text, author, avatarSrc, selected }) => {
    const safeRating = Math.max(1, Math.min(5, rating));

    return (
        <div className={`flex flex-col justify-between flex-shrink-0 w-[300px] md:w-[320px] h-[380px] md:h-[400px] rounded-2xl border border-system_primary shadow p-6 relative items-center transition-transform duration-300 ${selected ? 'scale-x-[1] scale-y-[1] bg-system_light_accent md:bg-system_light_accent' : 'bg-gray-foreground md:bg-[#FAFCF71A] scale-x-[0.9] scale-y-[0.9]'}`}>
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden border border-system_dark_secondary bg-white flex items-center justify-center">
                {avatarSrc ? (
                    <Image src={avatarSrc} alt="Reviewer avatar" width={63} height={63} className="object-cover w-[64px] h-[64px]" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🐶</div>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className={`text-sm md:text-sm tracking-wide text-label_secondary ${selected?"":"md:text-system_accent"}`}>{title.toUpperCase()}</p>
                <div className="mt-2 flex items-center justify-center gap-1" aria-label={`Rating ${safeRating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span className='text-system_secondary text-2xl' key={i}>{i < safeRating ? '★' : '☆'}</span>
                    ))}
                </div>
            </div>

            <p className={`mt-4 text-sm leading-6 text-label_primary md:text-gray_divider ${selected?"md:text-label_secondary":"md:text-gray_background"}`}>
                {text}
            </p>

            <div className={`w-full mt-6 flex items-center justify-between text-xs text-label_secondary ${selected?"":"md:text-gray_divider"}`}>
                <span>- {author}</span>
                <div className="flex items-center gap-1">
                    <Image src="/images/google-logo.png" alt="Google" width={16} height={16} />
                    <span>Google Reviews</span>
                </div>
            </div>
        </div>
    );
};

export default Review;


