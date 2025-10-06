"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';
import RadioChips, { ChipOption } from '@/components/radio-button/RadioChips';
import { allergy } from 'c-lib';
import { getEnumKeyByValue } from '@/utils/enumHelper';

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const options: Option[] = [
        {
            title: "Yes",
            secondarySubtitle: `we want to avoid...`,
            selected: dogStore.dog.isAllergic,
        },
        {
            title: "No",
            secondarySubtitle: `Not any known allergies!`,
            selected: !dogStore.dog.isAllergic,
        },
    ];

    const chipOptions: ChipOption[] = Object.values(allergy).map(option => {
        const isSelected = dogStore.dog.allergies.some(
            issueKey => allergy[issueKey as unknown as keyof typeof allergy] === option // Compare using enum value
        );
        return {
            title: option, // Use enum value (display text)
            selected: isSelected,
        };
    });

    const handleSelect = (updatedOptions: typeof options) => {
        const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
        if (isNursingOption) {
            dogStore.dog.isAllergic = isNursingOption.selected;
        }
    };

    const handleHealthSelect = (updatedOptions: ChipOption[]) => {
        const selectedIssues = updatedOptions
            .filter(option => option.selected)
            .map(option => getEnumKeyByValue(allergy, option.title))
            .filter((key): key is keyof typeof allergy => !!key);

        dogStore.dog.allergies = selectedIssues as unknown as allergy[];
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/eating');
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
        <ProcessLayout title={`Food Allergies`} subTitle={`Does *${dogStore.dog.name}* Have Any Food Allergies?`} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} img={!dogStore.dog.isAllergic ? `sad.svg` : undefined} registeredDogs={userStore.registeredDogs}>
            <div className='flex flex-col align-center items-center grow gap-10'>
                <RadioGroup
                    options={options}
                    onSelect={handleSelect}
                    multiSelect={false}
                />
                {
                    dogStore.dog.isAllergic &&
                    <RadioChips chipOptions={chipOptions} onSelect={handleHealthSelect} multiSelect={true} />
                }
            </div>
        </ProcessLayout>
    );
});
export default Home;
