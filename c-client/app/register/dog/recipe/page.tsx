"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import React from 'react';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';
// import { getEnumKeyByValue } from '@/utils/enumHelper';
import { protein } from 'c-lib';


const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const baseRecipes: Option[] = [
        {
            title: 'Hearty Beef',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Beef.png',
            selectedCardImage: '/images/Beef-half-h.png',
            value: 'Beef',
            selected: true
        },
        {
            title: 'Juicy Chicken',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Chicken.png',
            selectedCardImage: '/images/Chicken-half-h.png',
            value: 'Chicken',
            selected: false
        },
        {
            title: 'Tasty Salmon',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Salmon.png',
            selectedCardImage: '/images/Salmon-half-h.png',
            value: 'Salmon',
            selected: true
        },
        {
            title: 'Lean Turkey',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Turkey.png',
            selectedCardImage: '/images/Turkey-half-h.png',
            value: 'Turkey',
            selected: false
        },
    ];

    const [recipes, setRecipes] = useState<Option[]>(baseRecipes);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/portion');
        // const res = await dogStore.updateCustomer()
        // if (res) {
        //     console.log(res)
        // }
    };

    const handleSelect = (updatedOptions: Option[]) => {
        const selectedRecipes = updatedOptions
            .filter(option => option.selected)
            .map(option => option.value)
            .filter((v): v is string => !!v) as unknown as protein[];

        setRecipes(updatedOptions);
        dogStore.subscription.selectedRecipes = selectedRecipes as unknown as protein[];
        console.log("selectedRecipes", dogStore.subscription.selectedRecipes)
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/');
        } else {
            setIsAuthenticated(false);
        }
    }, [router]);

    useEffect(() => {
        const proteinValues = new Set(
            (dogStore.dog.proteins || [])
                .map(key => (protein as unknown as Record<string, string>)[key as unknown as string])
                .filter((v): v is string => !!v)
                .map(v => v.toLowerCase() === 'beef' ? 'beef' : v.toLowerCase())
        );
        const initialized = baseRecipes.map(r => ({
            ...r,
            selected: r.value ? proteinValues.has(r.value) : false
        }));
        setRecipes(initialized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
        <ProcessLayout title={`*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* custom meals`} subTitle={`We have adjusted these recipes based on your pup’s needs`} handleSubmit={handleSubmit} disabled={false} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <RadioGroup type='card' options={recipes} multiSelect onSelect={handleSelect}/>
        </ProcessLayout>
    );
});
export default Home;
