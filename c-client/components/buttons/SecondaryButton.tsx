'use client';
import { observer } from 'mobx-react-lite';
import Image from "next/image";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    icon?: boolean;
    secondaryText?: string;
    st?: string;
}

const SecondaryButton: React.FC<ButtonProps> = observer(({ text, icon, secondaryText, st, ...rest }) => {
    return (
        <>
            <div
                className={`${st === 'green' ? "w-full h-[72px]" : "w-80"} w-80 md:w-96 flex flex-col justify-center mx-auto`}
            >
                <button
                    {...rest}
                    type='button'
                    // className='h-14 flex items-center justify-center gap-2 rounded-2xl bg-system_light_secondary border border-system_dark_secondary'
                    className={`h-14 flex items-center  gap-2 rounded-2xl ${st === 'green' ? "bg-system_accent justify-between" : "bg-system_light_secondary justify-center"} p-4`}
                >
                    {icon && <Image
                        src={`/images/google-logo.png`}
                        width={18}
                        height={18}
                        alt="Icon"
                    />}
                    <p className={`${st === 'green' ? "text-label_secondary" : "text-system_dark_secondary"}  text-base font-medium`}>
                        {text}
                    </p>
                    {secondaryText && <div className='flex justify-end grow gap-4 items-center'>
                        <p className={`text-base font-bold ${st === 'green' ? "text-system_light_primary" : "text-system_dark_secondary"}`}>
                            {secondaryText}
                        </p>
                        <Image
                            className='flex w-[8px] h-[16px] object-cover'
                            src={`${st === 'green' ? "/images/chevron.png" : "/images/google-logo.png"}`}
                            width={16}
                            height={16}
                            alt="Icon"

                        />
                    </div>}
                </button>
            </div>
        </>
    );
});

export default SecondaryButton;