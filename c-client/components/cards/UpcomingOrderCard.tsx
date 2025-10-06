import Image from 'next/image';
import React from 'react';

type UpcomingOrderCardProps = {
  date: string;
  summary: string;
  recipients: string;
  status: string;
  onClick?: () => void;
};

const UpcomingOrderCard: React.FC<UpcomingOrderCardProps> = ({ date, summary, recipients, status, onClick }) => {
  return (
    <div className="bg-gray_foreground shadow-md rounded-2xl p-4 flex items-center justify-between border border-gray_divider cursor-pointer" onClick={onClick}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-label_primary text-sm">{date}</span>
          <span className="text-label_tertiary text-xs">{summary}</span>
        </div>
        <span className="text-sm text-label_tertiary">For:</span>
        <span className="text-sm text-label_secondary"> {recipients}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-system_light_secondary text-system_secondary px-2 py-1 rounded-full text-xs font-normal">
          {status}
        </span>
        <Image src="/images/chevrons2.png" alt="Table Dog" width={24} height={24} className='object-contain w-[24px] h-[24px]' />
      </div>
    </div>
  );
};

export default UpcomingOrderCard;


