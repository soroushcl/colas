"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
// import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
// import SearchableSelect from '@/components/inputs/serchableSelectInput/SerchableSelectInput';
// import { useGoogleLogin } from '@react-oauth/google';

const Home: React.FC = observer(() => {
    const { userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await userStore.updateCustomer()
        if (res) {
            router.push('/register/dog/name');
            console.log(res)
        }
    };

    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         router.push('/');
    //     } else {
    //         setIsAuthenticated(false);
    //     }
    // }, [router]);
    // if (isAuthenticated) {
    //     return <p>Redirecting to home...</p>;
    // }
    // useEffect(() => {
    //     if (userStore.currentStep < userStore.dogCountStep) {
    //         router.push('/register/customer');
    //     } else {
    //         setIsAuthenticated(false);
    //     }
    // }, [router, userStore.currentStep, userStore.dogCountStep]);
    return (
        <ProcessLayout title={"How many dogs do you have?"} subTitle={"You can register up to 4 dog"} handleSubmit={handleSubmit} disabled={!userStore.isCustomerDogCountValid} nextArrow mainButtonText={"Next"} img={'activity.png'}>
            <div className='flex flex-row gap-6 md:gap-10'>
                {[1, 2, 3, 4].map(dogCount => {
                    return <button
                        type='button'
                        key={dogCount}
                        onClick={() => { userStore.user.dogCount = dogCount }}
                        className={`h-16 w-16 rounded-2xl text-xl shadow font-bold border border-gray_divider ${(userStore.user.dogCount !== dogCount) ? "bg-gray_forground text-system_primary" : "bg-system_primary text-system_accent"}`}
                    >
                        {dogCount}
                    </button>
                })}
            </div>
        </ProcessLayout>

    );
});
export default Home;
