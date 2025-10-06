"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import { gender } from 'c-lib';
import Image from 'next/image';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/neutered');
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
        <ProcessLayout title={`Select *${dogStore.dog.name}* Gender`} subTitle={"Dogs have different caloric needs based on their gender"} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-row gap-6 md:gap-10'>
                {[0, 1].map(dogGender => {
                    return <div
                        className='flex flex-col items-center gap-2 cursor-pointer'
                        key={dogGender}
                        onClick={() => dogGender == 1 ? dogStore.dog.gender = gender.male : dogStore.dog.gender = gender.female}
                    >
                        <Image
                            src={`/images/${(dogGender == 0) ? (dogStore.dog.gender == gender.female) ? "selected-female.svg" : "female.svg" : (dogStore.dog.gender == gender.male) ? "selected-male.svg" : "male.svg"}`}
                            width={200}
                            height={200}
                            className="object-fit grow"
                            alt={"Cola"}
                        />
                        <button
                            type='button'

                            className={``}
                        >
                            <div className='flex flex-row gap-2 text-label_primary text-xl items-center'>

                                <div
                                    className={`w-5 h-5 flex items-center justify-center rounded-full ${((dogStore.dog.gender == gender.male && dogGender == 1) || (dogStore.dog.gender == gender.female && dogGender == 0)) ? "border-3 border-system_primary" : "border-2 border-gray_icon"
                                        }`}
                                >
                                    {((dogStore.dog.gender == gender.male && dogGender == 1) || (dogStore.dog.gender == gender.female && dogGender == 0)) && (
                                        <Image
                                            src={`/images/selected.svg`}
                                            width={20}
                                            height={20}
                                            alt={'tick'}
                                            className="w-5 h-5 rounded-full object-scale-down"
                                        />
                                    )}
                                </div>
                                {dogGender == 1 ? "Boy" : "Girl"}
                            </div>
                        </button>
                    </div>
                })
                }
            </div>
        </ProcessLayout>
    );
});
export default Home;
