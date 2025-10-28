import { FormEventHandler } from "react";
import MainButton from "../buttons/MainButton";
import SecondaryButton from "../buttons/SecondaryButton";
import Image from "next/image";
import Header from "../header/Header";
import { Dog, Recipe, Subscription } from "c-lib";

interface ProcessLayoutProps {
    children: React.ReactNode;
    title: string;
    subTitle?: string;
    mainButtonText?: string;
    handleSubmit: FormEventHandler<HTMLFormElement>;
    secondary?: boolean;
    secondaryButtonCLick?: () => void;
    secondaryButtonText?: string;
    disabled: boolean;
    img?: string;
    nextArrow?: boolean;
    secondaryIcon?: boolean;
    isPayment?: boolean;
    registeredDogs?: { dog: Dog, recipes: Recipe[], subscription: Subscription }[]
}

export default function ProcessLayout({
    children,
    title,
    subTitle,
    handleSubmit,
    disabled,
    secondary = false,
    img = "",
    nextArrow = false,
    secondaryButtonCLick,
    secondaryButtonText,
    mainButtonText = "Next",
    secondaryIcon,
    isPayment,
    registeredDogs,
}: ProcessLayoutProps) {
    return (
        <>
            <Header registeredDogs={registeredDogs && registeredDogs.length > 0 ? registeredDogs : undefined} />

            <div className={`${isPayment ? "max-w-[640px] overflow-x-hidden" : "max-w-2xl"} my-0 md:my-10 mx-auto bg-gray_background p-0 w-full md:rounded-3xl fill-gray_background md:shadow-md md:drop-shadow-md flex flex-col flex-1 max-h-full`}>
                
                <form onSubmit={handleSubmit} className={`flex flex-col justify-between items-center grow ${isPayment ? "md:pt-0" : "md:py-14"} max-h-full`} >
                    <div className='my-0 mx-0 w-full flex flex-col justify-between grow max-h-full'>
                        <div className="flex flex-col justify-evenly items-center pt-4">
                            {renderTitle(title)}
                            {subTitle && <p className="text-label_secondary text-center text-sm md:text-base max-w-96 pt-4">{subTitle}</p>}
                        </div>
                        <div className={`${isPayment ? "w-full md:max-w-2xl" : "max-w-80 md:max-w-96"} my-0 mx-auto bg-gray_background md:pb-11 py-0 pt-12 px-0 grow w-full max-h-full relative flex flex-col items-center gap`}>

                            {children}
                            {img && <Image
                                src={`/images/${img}`}
                                width={200}
                                height={200}
                                className="object-scale-down grow"
                                alt={"Cola"}
                            />}
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 md:gap-6 items-center">
                        {secondary && <SecondaryButton text={secondaryButtonText || "Login With Google"} onClick={secondaryButtonCLick} icon={secondaryIcon} />}
                        {!isPayment && <MainButton enabled={!disabled} text={mainButtonText} nextArrow={nextArrow} />}
                    </div>
                </form>
            </div>
        </>

    );
}
export const renderTitle = (title: string) => {
    if (!title) return null;

    // Split title by a placeholder for dynamic content (e.g., `*`)
    const parts = title.split('*');

    return (
        <p className="text-label_primary leading-10 font-normal text-center text-xl md:text-3xl md:leading-10 font-roca">
            {parts.map((part, index) => (
                <span
                    key={index}
                    className={
                        index % 2 === 1
                            ? "text-system_light_primary font-bold" // Style for dynamic parts
                            : undefined // Default style
                    }
                >
                    {part}
                </span>
            ))}
        </p>
    );
};