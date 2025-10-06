'use client';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    testid?: string;
    error?: string;
    hasImage?: boolean;
    isSmall?: boolean;
    isBig?: boolean;
    st?: string;
}

const LargeInput: React.FC<InputProps> = observer(({ testid, error, hasImage, isSmall, isBig, st, ...rest }) => {
    return (
        <>
            <div className={`relative h-24 ${isBig ? "w-full" : ""} ${isSmall ? "w-1/2" : ""} mx-0`}>
                <input
                    {...rest}
                    className={`w-full mx-auto ${st == 'green' ? "bg-[#4E6755] text-gray_divider focus:text-gray_divider disabled:text-gray_divider border-none" : "bg-gray_foreground"} fill-gray_foreground border border-gray_disable text-label_primary text-xl rounded-2xl py-4 px-6 placeholder:text-label_secondary outline-none stroke-[0.5px]
                                focus:border-system_primary focus:text-label_primary focus:outline-none transition
                                invalid:border-semantic_red invalid:text-semantic_red
                                disabled:border-gray_disabled disabled:text-label_secondary
                                peer 
                                `}
                    data-testid={testid}
                // required={required}
                />
                <p
                    className={`absolute left-5 top-[-11px] text-sm ${st == 'green' ? "hidden" : "bg-gray_foreground"} transition-all px-1 rounded-2xl
                        ${rest.value ? "opacity-100 top-[-11px] text-sm visible text-system_primary border-system_primary" : "opacity-0 top-5 text-xl"}
                        peer-focus:text-system_primary
                        peer-invalid:text-semantic_red
                        `}
                // peer-focus:opacity-100 peer-focus:top-[-11px] peer-focus:text-sm peer-focus:visible peer-focus:text-system_primary
                // peer-placeholder-shown:top-5 peer-placeholder-shown:text-xl peer-placeholder-shown:invisible peer-placeholder-shown:opacity-0
                // ${error? "text-semantic_red": "text-system_primary"}
                >
                    {rest.title ? rest.title : rest.placeholder}
                </p>
                {hasImage && <Image
                    src="/images/search.svg"
                    width={24}
                    height={24}
                    alt="search"
                    className="absolute right-4 top-[18px]"
                />}
                {error && <p className='text-semantic_red text-xs pl-6 pt-1' data-testid='error-text'>
                    {error}
                </p>}
            </div>
        </>
    );
});

export default LargeInput;