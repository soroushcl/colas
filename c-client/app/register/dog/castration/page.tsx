"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';
import { gender } from 'c-lib';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const options: Option[] = [
        {
            title: "Yes",
            subtitle: `${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)} is ${dogStore.dog.gender == gender.male ? "Neutered" : "Spayed"}`,
            selected: dogStore.dog.isNeutered,
        },
        {
            title: "No",
            subtitle: `${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)} isn't ${dogStore.dog.gender == gender.male ? "Neutered" : "Spayed"}`,
            selected: !dogStore.dog.isNeutered,
        },
    ];

    const handleSelect = (selected: number) => {
        // Sync selected values back to MobX store
        dogStore.dog.isNeutered = selected == 0 ? true : false;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (dogStore.dog.gender == gender.male) {
            dogStore.currentStep += 3
            router.push('/register/dog/activity');
        } else {
            dogStore.currentStep += 1
            router.push('/register/dog/pregnancy');
        }
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
        <ProcessLayout title={`Is *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* Neutered?`} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} img={'activity.png'} registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-row gap-6 md:gap-10'>
                <RadioGroup
                    onSelect={handleSelect}
                    options={options}
                    multiSelect={false}
                />
            </div>
        </ProcessLayout>
    );
});
export default Home;
