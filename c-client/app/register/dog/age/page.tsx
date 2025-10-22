"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '@/components/inputs/largeInput/LargeInput';
// import { useGoogleLogin } from '@react-oauth/google';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/gender');
        // const res = await userStore.updateCustomer()
        // if (res) {
        //   console.log(res)
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
    //   useEffect(() => {
    //     if (dogStore.currentStep < dogStore.ageStep) {
    //       router.push('/register/customer');
    //     } else {
    //       setIsAuthenticated(false);
    //     }
    //   }, [router, dogStore.currentStep, dogStore.ageStep]);
    return (
        <ProcessLayout title={`When is *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* Birthday?`} subTitle={"We use this for life-stage calculation"} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <LargeInput
                type="date"
                placeholder={`Birthday`}
                // value={userStore.currentRegisteringDog == index ? dogStore.dog.name : ""}
                onChange={(e) => { dogStore.dog.age = new Date(e.target.value) }}
                isBig
            // key={index}
            />
            <p className='text-label_primary text-xl md:text-2xl font-normal pt-16'>& current weight?</p>
            <p className='text-label_secondary text-sm md:text-base font-normal pt-4 pb-16'>No worries we listen & we don&apos;t judge</p>
            <LargeInput
                type='number'
                placeholder='Pooch weight'
                rightText='lbs'
                onChange={(e) => { dogStore.dog.weight = parseFloat(e.target.value) }}
                isBig
            />
        </ProcessLayout>

    );
});
export default Home;
