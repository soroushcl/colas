"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import SubscriptionCard from '@/components/cards/Subscription';
import Image from 'next/image';
const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // try {
        //     const subscriptionData = await dogStore.createDogSubscription();
        //     if (subscriptionData) {
        //         dogStore.currentStep += 1;
        //         // Will need to update this with the next route when ready
        //         // router.push('/register/dog/next-step');
        //     }
        // } catch (error) {
        //     console.error('Failed to create subscription:', error);
        //     // You might want to add error handling here
        // }
        dogStore.registerNextDog()
        router.push('/checkout');
    };

    const handleSecondaryButtonClick = () => {
        dogStore.registerNextDog()
        router.push('/register/dog/name');
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

    const dog = userStore.registeredDogs[userStore.registeredDogs.length - 1]

    return (
        <ProcessLayout
            title={`Awesome Work!`}
            subTitle={`You've successfully registered one dog. Now let's register the next one.`}
            handleSubmit={handleSubmit}
            secondaryButtonCLick={handleSecondaryButtonClick}
            secondaryButtonText={"Register Next Dog"}
            secondary={userStore.registeredDogs.length < userStore.user.dogCount!}
            disabled={false}
            mainButtonText={userStore.registeredDogs.length + 1 < userStore.user.dogCount! ? `Skip to Checkout` : 'Checkout'}
            registeredDogs={userStore.registeredDogs}
        >
            <div className='flex flex-col items-center'>
                <Image
                    src={`/images/nutri-table-dog.svg`}
                    width={120}
                    height={120}
                    className="object-fit grow mb-[-28px] mr-[-150px] z-10"
                    alt={"Cola"}
                />
                <SubscriptionCard
                    title={`${dog.dog.name.toUpperCase()}'s BOX`}
                    subtitle={`${!dog.subscription.discounts[0] ? "20% DISCOUNT APPLIED" : dog.subscription.discounts[0].discount + "% DISCOUNT APPLIED"}`}
                    recipes={dog.subscription.selectedRecipes.toString()}
                    plan={dog.subscription.type}
                    meals={14}
                    totalPrice={dog.subscription.dailyPrice * 14}
                    discountRate={!dog.subscription.discounts[0] ? 20 : dog.subscription.discounts[0].discount}
                    isActive={true}
                />
                <div className='flex flex-col items-center justify-center pt-10'>
                    <div className='flex flex-row items-center justify-center'>
                        <Image
                            src={`/images/icons.svg`}
                            width={20}
                            height={20}
                            className="object-fit mr-1"
                            alt={"i"}
                        />
                        <p className='text-lg text-label_primary font-bold'>{userStore.registeredDogs.length}</p>
                        <p className='text-lg text-label_secondary font-normal'>/{userStore.user.dogCount}</p>
                    </div>
                    <p className='text-sm text-label_tertiary'>{"Pooch Registered"}</p>
                </div>
            </div>
        </ProcessLayout>
    );
});

export default Home; 