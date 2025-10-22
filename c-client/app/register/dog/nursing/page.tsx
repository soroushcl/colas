"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const options: Option[] = [
        {
            title: "Yes",
            subtitle: `*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* is Nursing`,
            selected: dogStore.dog.isNursing,
        },
        {
            title: "No",
            subtitle: `*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* isn't Nursing`,
            selected: !dogStore.dog.isNursing,
        },
    ];

    const handleSelect = (updatedOptions: typeof options) => {
        // Sync selected values back to MobX store
        const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
        if (isNursingOption) {
            dogStore.dog.isNursing = isNursingOption.selected;
        }
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/activity');
        // const res = await dogStore.updateCustomer()
        // if (res) {
        //     console.log(res)
        // }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/');
        } else {
            setIsAuthenticated(false);
        }
    }, [router]);
    if (isAuthenticated) {
        return <p>Redirecting to home...</p>;
    }
    // useEffect(() => {
    //     if (dogStore.currentStep < dogStore.genderStep) {
    //         router.push('/register/customer');
    //     } else {
    //         setIsAuthenticated(false);
    //     }
    // }, [router, dogStore.currentStep, dogStore.genderStep]);
    return (
        <ProcessLayout
            title={`Is *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* Nursing?`}
            handleSubmit={handleSubmit}
            disabled={false}
            nextArrow mainButtonText={"Next"}
            img={!dogStore.dog.isNursing ? 'activity.png' : undefined}
            registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-col align-center items-center grow gap-10'>
                <RadioGroup
                    options={options}
                    onSelect={handleSelect}
                    multiSelect={false}
                />
                {dogStore.dog.isNursing &&
                    <div className='my-0 mx-0 w-full flex flex-col justify-between grow max-h-full'>
                        <div className="flex flex-col justify-evenly items-center">
                            <p className="text-label_primary leading-10 font-normal text-center text-lg md:text-2xl md:leading-10 ">{'How many puppies?'}</p>
                            <p className="text-label_secondary text-center text-sm md:text-base max-w-96">{'Use + or - to select the number of puppies'}</p>
                        </div>
                        <div className='my-0 mx-auto bg-gray_background md:pb-11 py-4 md:pt-8 px-0 grow w-full max-h-full relative flex flex-row justify-center items-center gap-6'>
                            <button type='button' onClick={() => dogStore.dog.nursingPuppies -= 1} disabled={!(dogStore.dog.nursingPuppies > 0)} className={`rounded-full w-10 h-10 text-white text-4xl bg-system_primary disabled:bg-gray_disable`}>-</button>
                            <span className={`w-12 flex justify-center text-3xl font-bold border-b-2 border-dotted ${dogStore.dog.nursingPuppies > 0 ? "border-system_primary text-system_primary" : "border-gray_disabled text-label_tertiary"}`}>{dogStore.dog.nursingPuppies}</span>
                            <button type='button' onClick={() => dogStore.dog.nursingPuppies += 1} className={`rounded-full w-10 h-10 text-white text-4xl bg-system_primary disabled:bg-gray_disable`}>+</button>
                        </div>
                    </div>
                }
            </div>
        </ProcessLayout>
    );
});
export default Home;
