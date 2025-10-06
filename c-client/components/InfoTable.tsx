"use client";

import Image from "next/image";
import React from "react";

type RowType = "badge" | "value" | "text";

export interface InfoTableRow {
  label: string;
  value?: string | React.ReactNode;
  type?: RowType;
  onClick?: () => void;
  labelIcon?: string;
}

interface InfoTableProps {
  title?: string;
  rows: InfoTableRow[];
}

export default function InfoTable({ title, rows }: InfoTableProps) {
  return (
    <div className="mb-4">
      {title && <h3 className="text-sm text-label_secondary mb-3">{title}</h3>}
      <div className="bg-gray_foreground shadow-md rounded-xl p-4 space-y-4 border border-gray_divider">
        {rows.map((row, index) => {
          const type: RowType = row.type ?? "value";
          return (
            <div key={`${row.label}-${index}`} className="flex flex-col cursor-pointer">
              <div

                className="flex items-center justify-between"
                onClick={row.onClick}
              >
                <div className="flex items-center gap-3">
                  {row.labelIcon && (
                    <span className="inline-flex items-center justify-center">
                      <Image 
                        src={row.labelIcon} 
                        alt={`${row.label} icon`} 
                        width={24} 
                        height={24} 
                        className="object-contain w-[24px] h-[24px]"
                      />
                    </span>
                  )}
                  <span className="text-label_secondary">{row.label}</span>
                </div>

                {type === "badge" && (
                  <span className="bg-system_secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {row.value as React.ReactNode}
                  </span>
                )}

                {type === "value" && (
                  <div className="flex items-center gap-2">
                    {row.value !== undefined && row.value !== null && row.value !== "" && (
                      <span className="text-system_light_primary font-medium">{row.value}</span>
                    )}
                    <Image src="/images/icons4.png" alt="Table Dog" width={24} height={24} className='object-contain w-[24px] h-[24px]' />
                  </div>
                )}

                {type === "text" && (
                  <span className="text-system_light_primary font-medium">{row.value}</span>
                )}
              </div>
              {index !== rows.length - 1 && (
                <div className="h-px bg-gray_divider mt-2" />
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}


