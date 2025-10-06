"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import { subscriptionType } from 'c-lib';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';
import Image from 'next/image';
import Header from '@/components/header/Header';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const options: Option[] = Object.values(subscriptionType).map(option => {
        const isSelected = dogStore.subscription.type === option
        return {
            cardImage: `${option}.png`,
            title: option,
            subtitle: `${option == 'Full' ? "Full daily portions" : option == 'Half' ? "Half daily portions." : option == 'Topper' ? "Quarter daily portions." : "Lean, simple & clean"}`,
            secondarySubtitle: `${option == 'Full' ? "No need to add anything else." : option == 'Half' ? "Mix with old diet to provide boost!" : option == 'Topper' ? "Perfect to enhance current diet." : "Lean, simple & clean"}`,
            selected: isSelected,
        }
    })

    const handleSelect = (updatedOptions: Option[]) => {
        const selected = updatedOptions.filter(op => {
            return op.selected
        })
        dogStore.subscription.type = selected[0].title as unknown as subscriptionType;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        const subscriptionData = await dogStore.createDogSubscription();
        console.log("here")
        if (subscriptionData) {
            setLoading(false)
            dogStore.currentStep += 1;
            router.push('/register/dog/subscription');
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

    if (loading) {
        return (
            <>
                <Header />
                <div className='w-full m-0 bg-gray_background md:bg-[url(/images/2.png)] p-0 fill-gray_background flex flex-col flex-1 max-h-full'>
                    <div className='my-0 mx-0 w-full flex flex-col justify-between grow max-h-full'>
                        <div className='w-full my-0 mx-auto p-0 grow w-full h-full relative flex flex-col items-center gap'>
                            <div className={`w-full md:max-w-[700px] my-0 mx-auto bg-system_accent md:bg-gray_background md:my-8 py-0 px-0 grow w-full max-h-full relative flex flex-col items-center gap md:rounded-3xl  overflow-hidden`}>
                                <div className='flex flex-col w-full h-full grow'>
                                    <div className='grow flex flex-col'>
                                        <div className='w-full h-[44vh] md:h-[38vh] bg-system_dark_primary text-system_accent font-normal text-center pt-24'>
                                            <p className='text-3xl mb-4'>All done!</p>
                                            <p className='text-sm md:text-2xl '>Preparing the perfect fresh meal plan for your pup...</p>
                                        </div>
                                        <div className='w-full absolute top-[27vh] md:top-[22vh]'>
                                            <Image
                                                src={`/images/large_bowl.png`}
                                                width={344}
                                                height={344}
                                                className="object-fill w-[316px] h-[316px] md:w-[344px] md:h-[344px] mx-auto "
                                                alt={"Cola"} />
                                        </div>
                                        <div className='w-full h-[44vh] md:h-[38vh] text-center pt-48 flex flex-col items-center justify-between bg-system_accent md:bg-gray_background'>
                                            <p className='max-w-[400px] text-base md:text-2xl text-system_dark_primary font-normal mx-auto'>Pooch parents report their dogs are no longer picky eaters after using our services!</p>
                                            <div className='w-full flex flex-col items-center'>
                                                <Image
                                                    src={`/images/loading_dog.gif`}
                                                    width={64}
                                                    height={32}
                                                    className="object-fill w-[64px] h-[32px] rotate-x-180"
                                                    alt={"Cola"} />
                                                <p className='max-w-[400px] text-sm text-label_secondary font-light mx-auto'>Analyzing Progress..</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-[6vh] bg-system_primary'>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // useEffect(() => {
    //     if (dogStore.currentStep < dogStore.genderStep) {
    //         router.push('/register/customer');
    //     } else {
    //         setIsAuthenticated(false);
    //     }
    // }, [router, dogStore.currentStep, dogStore.genderStep]);
    return (
        <ProcessLayout title={`*${dogStore.dog.name}'s* favorite proteins`} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-row gap-6 md:gap-10'>
                <RadioGroup
                    options={options}
                    onSelect={handleSelect}
                />
            </div>
        </ProcessLayout>
    );
});
export default Home;
