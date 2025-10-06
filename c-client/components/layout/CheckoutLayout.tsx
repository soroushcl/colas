import { FormEventHandler } from "react";
// import MainButton from "../buttons/MainButton";
// import SecondaryButton from "../buttons/SecondaryButton";
import Image from "next/image";
import Header from "../header/Header";

interface CheckoutLayoutProps {
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
}

export default function CheckoutLayout({
    children,
    title,
    subTitle,
    handleSubmit,
    // disabled,
    // secondary = false,
    img = "",
    // nextArrow = false,
    // secondaryButtonCLick,
    // secondaryButtonText,
    // mainButtonText = "Next",
    // secondaryIcon,
}: CheckoutLayoutProps) {
    return (
        <>
            <Header/>
            <div className='w-full m-0 bg-gray_background md:bg-[url(/images/2.png)] p-0 fill-gray_background flex flex-col flex-1 max-h-full'>
                <form onSubmit={handleSubmit} className='flex flex-col justify-between items-center grow md:py-14 max-h-full' >
                    <div className='my-0 mx-0 w-full flex flex-col justify-between grow max-h-full'>
                        <div className="flex flex-col justify-evenly items-center text-base text-2xl gap-4">
                            {renderTitle(title)}
                            {subTitle && <p className="text-label_secondary text-center text-sm md:text-base max-w-96">{subTitle}</p>}
                        </div>
                        <div className='w-full my-0 mx-auto md:pb-11 py-4 md:pt-8 px-0 grow w-full max-h-full relative flex flex-col items-center gap'>
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
                    {/* <div className="flex flex-col gap-8 md:gap-6 items-center">
                    {secondary && <SecondaryButton text={secondaryButtonText || "Login With Google"} onClick={secondaryButtonCLick} icon={secondaryIcon} />}
                    <MainButton enabled={!disabled} text={mainButtonText} nextArrow={nextArrow} />
                </div> */}
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
        <p className="text-label_primary leading-10 font-normal text-center text-3xl md:text-4xl md:leading-10">
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