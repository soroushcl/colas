"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '@/components/inputs/largeInput/LargeInput';
// import SearchableSelect from '@/components/inputs/serchableSelectInput/SerchableSelectInput';
// import { useGoogleLogin } from '@react-oauth/google';

const Home: React.FC = observer(() => {
    const { userStore, dogStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/breed');
        // const res = await userStore.updateCustomer()
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
    useEffect(() => {
        if (dogStore.currentStep < dogStore.nameStep) {
            router.push('/register/customer');
        } else {
            setIsAuthenticated(false);
        }
    }, [router, dogStore.currentStep, dogStore.nameStep]);
    return (
        <ProcessLayout title={"What's your pup’s name?"} handleSubmit={handleSubmit} disabled={!dogStore.isDogNameValid} nextArrow mainButtonText={"Next"} img={'activity-2.png'} registeredDogs={userStore.registeredDogs}>
            <div className={`${(userStore.user.dogCount && userStore.user.dogCount > 1 ? "grid grid-cols-2 gap-2" : "flex flex-row gap-6")}`}>
                {new Array(userStore.user.dogCount).fill(0).map((dog, index) => {
                    {/* {new Array(2).fill(0).map((_, index) => { */ }
                    return <LargeInput
                        type="text"
                        placeholder={`#${index + 1} Name`}
                        value={userStore.currentRegisteringDog == index ? dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1) : index < userStore.currentRegisteringDog ? userStore.registeredDogs[index].dog.name.charAt(0).toUpperCase() + userStore.registeredDogs[index].dog.name.slice(1) : ""}
                        onChange={(e) => { dogStore.dog.name = e.target.value }}
                        key={index}
                        // isSmall={userStore.user.dogCount && (userStore.user.dogCount > 1) ? true : false}
                        isSmall={false}
                        disabled={userStore.currentRegisteringDog == index ? false : true}
                    />
                })}
            </div>
        </ProcessLayout>

    );
});
export default Home;
