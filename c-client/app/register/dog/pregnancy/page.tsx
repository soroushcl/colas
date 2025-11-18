"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const options: Option[] = [
        {
            title: "Yes",
            subtitle: `${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)} is Pregnant`,
            selected: dogStore.dog.isPregnant,
        },
        {
            title: "No",
            subtitle: `${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)} isn't Pregnant`,
            selected: !dogStore.dog.isPregnant,
        },
    ];

    const handleSelect = (selected: number) => {
        dogStore.dog.isPregnant = selected == 0 ? true : false;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/nursing');
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
        <ProcessLayout title={`Is *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* Pregnant?`} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} img={'activity.png'} registeredDogs={userStore.registeredDogs}>
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
