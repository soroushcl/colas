"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '@/components/inputs/largeInput/LargeInput';

const Home: React.FC = observer(() => {
    const { userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await userStore.forgotPassword()
        if (res) {
            setSuccess(true)
        }
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
    return (
        <ProcessLayout title={"I forgot my password"} handleSubmit={handleSubmit} disabled={success ? true : false} mainButtonText={"Submit"}>
            {success && <div className='flex gap-1' data-testid='successful-message'>
                <span className='text-lg'>
                    {"We sent you the reset password to"}
                </span>
                <span className='text-system_light_primary text-lg font-bold underline decoration-solid' data-testid='successful-email'>
                    {userStore.user.email}
                </span>
            </div>}
            <LargeInput error={userStore.emailError} type="email" placeholder="Email" value={userStore.user.email} onChange={(e) => { userStore.user.email = e.target.value }} autoComplete="email" disabled={success ? true : false} />
        </ProcessLayout>
    );


});
export default Home;
