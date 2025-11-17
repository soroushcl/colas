'use client';
import { observer } from 'mobx-react-lite';
import Image from "next/image";

interface ButtonProps {
    enabled: boolean;
    text: string;
    nextArrow?: boolean;
    onSubmit?: () => void;
}

const MainButton: React.FC<ButtonProps> = observer(({ enabled, text, nextArrow = false, onSubmit }) => {
    return (
        <>
            <div
                className='flex flex-col justify-center'
            >
                <button
                    className='flex items-center justify-center gap-1 w-screen md:w-96 h-14 md:rounded-2xl shadow-sm md:shadow-3xl bg-system_primary active:shadow-none disabled:shadow-none disabled:bg-gray_disable'
                    disabled={!enabled}
                    type="submit"
                    onClick={onSubmit}
                >
                    <p className='text-visual_light_amber text-xl font-bold'>
                        {text}
                    </p>
                    {nextArrow && <Image
                        // className={styles.icon}
                        src="/images/next-arrow.svg"
                        width={32}
                        height={16}
                        alt="Next Arrow"
                    />}
                    {/* </div> */}
                </button>
            </div>
        </>
    );
});

export default MainButton;