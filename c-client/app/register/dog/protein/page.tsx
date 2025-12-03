"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import { protein } from 'c-lib';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';
import { getEnumKeyByValue } from '@/utils/enumHelper';
// import CheckoutLayout from '@/components/layout/CheckoutLayout';
import Header from '@/components/header/Header';
import Image from 'next/image';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const options: Option[] = Object.values(protein).map(option => {
        const isSelected = dogStore.dog.proteins.some(
            issueKey => protein[issueKey as unknown as keyof typeof protein] === option
        )
        return {
            cardImage: `${option}.png`,
            title: option,
            subtitle: `${option == 'Beef' ? "A classic favorite" : option == 'Chicken' ? "Gentle on the tummy" : option == 'Salmon' ? "Packed with Omega-3s" : "Lean, simple & clean"}`,
            selected: isSelected,
        }
    })

    const handleSelect = (selected: number) => {
        
        const selectedIssues = Object.values(protein).map((option, index) => {
            const isSelected = selected !== index ? dogStore.dog.proteins.some(
                issueKey =>  protein[issueKey as unknown as keyof typeof protein] === option 
            ): !dogStore.dog.proteins.some(
                issueKey =>  protein[issueKey as unknown as keyof typeof protein] === option 
            )
            return {
                selected: isSelected,
                title: option
            }
        })
            .filter(option => option.selected)
            .map(option => getEnumKeyByValue(protein, option.title))
            .filter((key): key is keyof typeof protein => !!key);

        dogStore.dog.proteins = selectedIssues as unknown as protein[];
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // router.push('/register/dog/nutrition');
        setLoading(true)

        // Start both the API call and the 5-second timer simultaneously
        const [res] = await Promise.all([
            dogStore.registerDog(userStore.user.id),
            new Promise(resolve => setTimeout(resolve, 5000))
        ]);

        if (res) {
            router.push('/register/dog/report');
            console.log(res)
            setLoading(false)
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
                                        <div className='w-full h-[42vh] md:h-[38vh] bg-system_dark_primary text-system_accent font-normal text-center flex flex-col items-center justify-center'>
                                            <p className='text-3xl mb-4'>All done!</p>
                                            <p className='text-sm md:text-2xl '>Preparing the perfect fresh meal plan for your pup...</p>
                                        </div>
                                        <div className='w-full absolute top-[27vh] md:top-[22vh]'>
                                            <Image
                                                src={`/images/large_bowl.png`}
                                                width={788}
                                                height={788}
                                                className="object-fill w-[32vh] h-[32vh] mx-auto "
                                                alt={"Cola"} />
                                        </div>
                                        <div className='w-full h-[42vh] md:h-[38vh] text-center flex flex-col items-center justify-end gap-4 bg-system_accent md:bg-gray_background'>
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
        <ProcessLayout title={`*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* favorite proteins`} subTitle={`You can choose up to 3 proteins`} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-row gap-6 md:gap-10'>
                <RadioGroup
                    options={options}
                    onSelect={handleSelect}
                    multiSelect={true}
                />
            </div>
        </ProcessLayout>
    );
});
export default Home;
