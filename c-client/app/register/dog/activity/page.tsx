"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import { activityLevel } from 'c-lib';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const options: Option[] = [
        {
            cardImage: 'low.svg',
            title: "Low",
            secondarySubtitle: `Sleepy Guy`,
            selected: dogStore.dog.activityLevel == activityLevel.low,
        },
        {
            cardImage: 'activity.png',
            title: "Normal",
            secondarySubtitle: `Fetches The Paper`,
            selected: dogStore.dog.activityLevel == activityLevel.normal,
        },
        {
            cardImage: 'high.svg',
            title: "High",
            secondarySubtitle: `Won’t Fall Asleep`,
            selected: dogStore.dog.activityLevel == activityLevel.high,
        },
    ];

    const handleSelect = (updatedOptions: typeof options) => {
        // Sync selected values back to MobX store
        const lowOption = updatedOptions.find((opt) => opt.title === "Low");
        if (lowOption) {
            if (lowOption.selected) {
                dogStore.dog.activityLevel = activityLevel.low;
            }
        }
        const normalOption = updatedOptions.find((opt) => opt.title === "Normal");
        if (normalOption) {
            if (normalOption.selected) {
                dogStore.dog.activityLevel = activityLevel.normal;
            }
        }
        const highOption = updatedOptions.find((opt) => opt.title === "High");
        if (highOption) {
            if (highOption.selected) {
                dogStore.dog.activityLevel = activityLevel.high;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/health');
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
        <ProcessLayout title={`How active is *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}*?`} subTitle={"Just like us, an athlete has different needs than a laidback dog"} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-row gap-6 md:gap-10'>
                <RadioGroup
                    options={options}
                    onSelect={handleSelect}
                    multiSelect={false}
                />
            </div>
        </ProcessLayout>
    );
});
export default Home;
