

interface CustomNumberProps {
    value: number;
    setValue: (value: number) => void;
    minValue: number;
    maxValue: number;
}

export default function CustomNumberComponent({ value, setValue, minValue, maxValue }: CustomNumberProps) {
    const handleDecrement = () => {
        if (value > minValue) {
            setValue(value - 1);
        }
    }
    const handleIncrement = () => {
        if (value < maxValue) {
            setValue(value + 1);
        }
    }
    return (
        <div className='my-0 mx-0 w-full flex flex-col justify-between grow max-h-full'>
            <div className='my-0 mx-auto bg-gray_background md:pb-11 py-4 md:pt-8 px-0 grow w-full max-h-full relative flex flex-row justify-center items-center gap-6'>
                <button type='button' onClick={handleDecrement} disabled={!(value > minValue)} className={`rounded-full w-10 h-10 text-white text-4xl bg-system_primary disabled:bg-gray_disable`}>-</button>
                <span className={`w-12 flex justify-center text-3xl font-bold border-b-2 border-dotted ${value > minValue ? "border-system_primary text-system_primary" : "border-gray_disabled text-label_tertiary"}`}>{value}</span>
                <button type='button' onClick={handleIncrement} className={`rounded-full w-10 h-10 text-white text-4xl bg-system_primary disabled:bg-gray_disable`} disabled={!(value < maxValue)}>+</button>
            </div>
        </div>
    );
}
