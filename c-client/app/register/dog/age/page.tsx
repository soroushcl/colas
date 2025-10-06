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
        <ProcessLayout title={`When is *${dogStore.dog.name}* Birthday?`} subTitle={"We use this for life-stage calculation"} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <LargeInput
                type="date"
                placeholder={`Birthday`}
                // value={userStore.currentRegisteringDog == index ? dogStore.dog.name : ""}
                onChange={(e) => { dogStore.dog.age = new Date(e.target.value) }}
            // key={index}
            />
        </ProcessLayout>

    );
});
export default Home;
