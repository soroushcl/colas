"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import { shape } from 'c-lib';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const options: Option[] = [
        {
            cardImage: 'under.svg',
            title: 'Under Weight',
            subtitle: 'Visible ribs & spine',
            secondarySubtitle: `Time to gain some healthy weight`,
            selected: dogStore.dog.shape == shape.underweight,
        },
        {
            cardImage: 'fit.svg',
            title: 'Ideal Weight',
            subtitle: 'Nice waistline & belly tuck',
            secondarySubtitle: `We will maintain this weight!`,
            selected: dogStore.dog.shape == shape.fit,
        },
        {
            cardImage: 'over.svg',
            title: 'Over Weight',
            subtitle: 'Need pressure to feel the ribs',
            secondarySubtitle: `A healthy weight-loss plan is due`,
            selected: dogStore.dog.shape == shape.overweight,
        },
    ];

    const handleSelect = (selected: number) => {
        // Sync selected values back to MobX store
        if (selected == 0) {
            dogStore.dog.shape = shape.underweight;
        }
        if (selected == 1) {
            dogStore.dog.shape = shape.fit;
        }
        if (selected == 2) {
            dogStore.dog.shape = shape.overweight;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/protein');
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
        <ProcessLayout title={`What's *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* body condition?`} subTitle={"This will stay between us, don't worry!"} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
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
