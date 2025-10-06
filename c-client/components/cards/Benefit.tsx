import Image from 'next/image';
import React from 'react';

interface CardProps {
    title: string;
    subtitle: string;
    icon: string;
    m_icon: string;
    index?: number;
}

const Benefit: React.FC<CardProps> = ({ title, subtitle, icon, m_icon }) => {


    return (
        <div className='flex flex-col items-center justify-start gap-2 min-w-[96px] min-h-[120px] md:w-[220px] md:h-[248px] md:bg-[#FAFCF71A] md:rounded-3xl p-4'>
            <Image src={m_icon} alt={title} width={48} height={48} className='md:hidden'/>
            <Image src={icon} alt={title} width={88} height={88} className='hidden md:flex md:w-[88px] md:h-[88px]'/>
            <p className='text-xs md:text-xl text-center md:text-system_accent grow flex items-center'>{title}</p>
            <p className='text-xs md:text-sm text-center hidden md:flex justify-center md:text-gray_foreground'>{subtitle}</p>
        </div>
    );
};

export default Benefit;