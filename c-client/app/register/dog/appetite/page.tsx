"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import { eatingHabit } from 'c-lib';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';

const Home: React.FC = observer(() => {
    const { dogStore,  userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const options: Option[] = [
        {
            cardImage: 'picky-eater.png',
            title: eatingHabit.picky,
            secondarySubtitle: `Not excited about food`,
            selected: dogStore.dog.eating == eatingHabit.picky,
        },
        {
            cardImage: 'good-eater.png',
            title: eatingHabit.good,
            secondarySubtitle: `As long as it's a favorite!`,
            selected: dogStore.dog.eating == eatingHabit.good,
        },
        {
            cardImage: 'great-eater.png',
            title: eatingHabit.great,
            secondarySubtitle: `Will eat anything & everything`,
            selected: dogStore.dog.eating == eatingHabit.great,
        },
    ];

    const handleSelect = (updatedOptions: typeof options) => {
        // Sync selected values back to MobX store
        const lowOption = updatedOptions.find((opt) => opt.title === eatingHabit.picky);
        if (lowOption) {
            if (lowOption.selected) {
                dogStore.dog.eating = eatingHabit.picky;
            }
        }
        const normalOption = updatedOptions.find((opt) =>  opt.title === eatingHabit.good);
        if (normalOption) {
            if (normalOption.selected) {
                dogStore.dog.eating = eatingHabit.good;
            }
        }
        const highOption = updatedOptions.find((opt) =>  opt.title === eatingHabit.great);
        if (highOption) {
            if (highOption.selected) {
                dogStore.dog.eating = eatingHabit.great;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/bcs');
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
        <ProcessLayout title={`*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* Eating Habits`} subTitle={"What does dinner time look like?"} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
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
