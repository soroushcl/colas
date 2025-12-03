"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import React from 'react';
import RadioGroup, { Option } from '@/components/radio-button/RadioGroup';
// import { getEnumKeyByValue } from '@/utils/enumHelper';
import { protein, Recipe } from 'c-lib';
import RecipePopup from '@/components/popups/RecipePopup';
import { getEnumKeyByValue } from '@/utils/enumHelper';


const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const router = useRouter();

    const baseRecipes: Option[] = [
        {
            title: 'Hearty Beef',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Beef.png',
            selectedCardImage: '/images/recipe_Beef.png',
            value: 'Beef',
            selected: dogStore.subscription.selectedRecipes.some(
                issueKey => protein[issueKey as unknown as keyof typeof protein] === protein['beef']
            ),
            handleSecondarySelect: () => handleSecondary(dogStore.recipes[0])
        },
        {
            title: 'Juicy Chicken',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Chicken.png',
            selectedCardImage: '/images/recipe_Chicken.png',
            value: 'Chicken',
            selected: dogStore.subscription.selectedRecipes.some(
                issueKey => protein[issueKey as unknown as keyof typeof protein] === protein['chicken']
            ),
            handleSecondarySelect: () => handleSecondary(dogStore.recipes[1])
        },
        {
            title: 'Tasty Salmon',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe_Salmon.png',
            selectedCardImage: '/images/recipe_Salmon.png',
            value: 'Salmon',
            selected: dogStore.subscription.selectedRecipes.some(
                issueKey => protein[issueKey as unknown as keyof typeof protein] === protein['salmon']
            ),

            handleSecondarySelect: () => handleSecondary(dogStore.recipes[2])
        },
        // {
        //     title: 'Lean Turkey',
        //     subtitle: 'For Picky Eaters',
        //     secondarySubtitle: 'Human-Grade Beef &...',
        //     cardImage: '/images/recipe_Turkey.png',
        //     selectedCardImage: '/images/recipe_Turkey.png',
        //     value: 'Turkey',
        //     selected: false,
        //     handleSecondarySelect: () => handleSecondary(dogStore.recipes[3])
        // },
    ];


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/portion');
        // const res = await dogStore.updateCustomer()
        // if (res) {
        //     console.log(res)
        // }
    };

    const handleSelect = (selected: number) => {
        const selectedIssues = Object.values(protein).map((option, index) => {
            const isSelected = selected !== index ? dogStore.subscription.selectedRecipes.some(
                issueKey =>  protein[issueKey as unknown as keyof typeof protein] === option 
            ): !dogStore.subscription.selectedRecipes.some(
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

        dogStore.subscription.selectedRecipes = selectedIssues as unknown as protein[];
        console.log("selectedRecipes", dogStore.subscription.selectedRecipes)
    };
    const handleSecondary = (selected: Recipe) => {
        console.log("selected: ", selected)
        setIsPopupOpen(true)
        return
    }

    const handleClosePopup = () => {
        setIsPopupOpen(false)
        return
    }


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/');
        } else {
            setIsAuthenticated(false);
        }
    }, [router]);

    useEffect(() => {
        dogStore.subscription.selectedRecipes = dogStore.dog.proteins
    }, []);
    if (isAuthenticated) {
        return <p>Redirecting to home...</p>;
    }
    
    return (
        <ProcessLayout title={`*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* custom meals`} subTitle={`We have adjusted these recipes based on your pup’s needs`} handleSubmit={handleSubmit} disabled={dogStore.subscription.selectedRecipes.length === 0} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <RadioGroup type='card' options={baseRecipes} multiSelect onSelect={handleSelect} />
            {isPopupOpen && <RecipePopup
                title={`${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s Health Needs`}
                // onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                isOpen={isPopupOpen}
            />
            }
        </ProcessLayout>
    );
});
export default Home;
