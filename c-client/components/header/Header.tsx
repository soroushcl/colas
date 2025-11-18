'use client'
import { activityLevel, allergy, Dog, gender, healthIssue, protein, Recipe, Subscription, subscriptionType } from 'c-lib';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import DogPopup from '../popups/DogPopup';
import SearchableSelect from '../inputs/serchableSelectInput/SerchableSelectInput';
import FetchApi from '@/services/api';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '../inputs/largeInput/LargeInput';
import RadioGroup, { Option } from '../radio-button/RadioGroup';
import RadioChips, { ChipOption } from '../radio-button/RadioChips';
import { getEnumKeyByValue } from '@/utils/enumHelper';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
    registeredDogs?: { dog: Dog, recipes: Recipe[], subscription: Subscription }[]
}
export default function Header({
    registeredDogs,
}: HeaderProps) {
    const { dogStore } = useStores();
    const [breeds, setBreeds] = useState<string[]>([]);
    const [isPopupOpen, setPopupOpen] = useState(false)
    const [isEditPopupOpen, setEditPopupOpen] = useState(false)
    const [isDogParamPopupOpen, setIsDogParamPopupOpen] = useState(false)
    const [editDogPopupIndex,] = useState(0)
    const [editDogParamPopupIndex, setEditDogParamPopupIndex] = useState(0)
    const handleOpenPopup = () => setPopupOpen(true);
    const router = useRouter();

    const options: Option[] = [
        {
            title: "Yes",
            subtitle: `*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* is ${dogStore.dog.gender == gender.male ? "Neutered" : "Spayed"}`,
            selected: dogStore.dog.isNeutered,
        },
        {
            title: "No",
            subtitle: `*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* isn't ${dogStore.dog.gender == gender.male ? "Neutered" : "Spayed"}`,
            selected: !dogStore.dog.isNeutered,
        },
    ];

    const handleSelect = (selected: number) => {
        // Sync selected values back to MobX store
        dogStore.dog.isNeutered = selected == 0 ? true : false
    };

    const activityOptions: Option[] = [
        {
            cardImage: 'low.svg',
            title: "Low",
            secondarySubtitle: `Sleepy Guy`,
            selected: dogStore.dog.activityLevel == activityLevel.low,
        },
        {
            cardImage: 'activity.png',
            title: "Normal",
            secondarySubtitle: `Fetches The Paper`,
            selected: dogStore.dog.activityLevel == activityLevel.normal,
        },
        {
            cardImage: 'high.svg',
            title: "High",
            secondarySubtitle: `Won’t Fall Asleep`,
            selected: dogStore.dog.activityLevel == activityLevel.high,
        },
    ];

    const handleActivitySelect = (selected: number) => {
        // Sync selected values back to MobX store

        dogStore.dog.activityLevel = selected == 0 ? activityLevel.low : selected == 1 ? activityLevel.normal : activityLevel.high;
    };

    const allergyOptions: Option[] = [
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

    const handleAllergySelect = (selected: number) => {
        dogStore.dog.isAllergic = selected == 0 ? true : false
    };

    const handleHealthSelect = (updatedOptions: ChipOption[]) => {
        const selectedIssues = updatedOptions
            .filter(option => option.selected)
            .map(option => getEnumKeyByValue(allergy, option.title))
            .filter((key): key is keyof typeof allergy => !!key);

        dogStore.dog.allergies = selectedIssues as unknown as allergy[];
    };

    const healthIssueOptions: Option[] = [
        {
            title: "Yes",
            secondarySubtitle: `We're dealing with...`,
            selected: dogStore.dog.hasHealthIssue,
        },
        {
            title: "No",
            secondarySubtitle: `A poster child for health!`,
            selected: !dogStore.dog.hasHealthIssue,
        },
    ];

    const healthIssueChipOptions: ChipOption[] = Object.values(healthIssue).map(option => {
        const isSelected = dogStore.dog.healthIssue.some(
            issueKey => healthIssue[issueKey as unknown as keyof typeof healthIssue] === option // Compare using enum value
        );
        return {
            title: option, // Use enum value (display text)
            selected: isSelected,
        };
    });

    const handleHealthIssueSelect = (selected: number) => {
        dogStore.dog.hasHealthIssue = selected == 0 ? true : false
    };

    const handleHealthIssuesSelect = (updatedOptions: ChipOption[]) => {
        const selectedIssues = updatedOptions
            .filter(option => option.selected)
            .map(option => getEnumKeyByValue(healthIssue, option.title))
            .filter((key): key is keyof typeof healthIssue => !!key);

        dogStore.dog.healthIssue = selectedIssues as unknown as healthIssue[];
    };

    const proteinOptions: Option[] = Object.values(protein).map(option => {
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

    const handleProteinSelect = (selected: number) => {
        const selectedIssues = Object.values(protein).map((option, index) => {
            const isSelected = dogStore.dog.proteins.some(
                issueKey => selected !== index ? protein[issueKey as unknown as keyof typeof protein] === option : protein[issueKey as unknown as keyof typeof protein] !== option
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


    const portionOptions: Option[] = Object.values(subscriptionType).map(option => {
        const isSelected = dogStore.subscription.type === option
        return {
            cardImage: `${option}.png`,
            title: option,
            subtitle: `${option == 'Full' ? "Full daily portions" : option == 'Half' ? "Half daily portions." : option == 'Topper' ? "Quarter daily portions." : "Lean, simple & clean"}`,
            secondarySubtitle: `${option == 'Full' ? "No need to add anything else." : option == 'Half' ? "Mix with old diet to provide boost!" : option == 'Topper' ? "Perfect to enhance current diet." : "Lean, simple & clean"}`,
            selected: isSelected,
        }
    })

    const handlePortionSelect = (selected: number) => {
        dogStore.subscription.type = selected == 0 ? subscriptionType.full : selected == 1 ? subscriptionType.half : subscriptionType.topper
    };

    const baseRecipes: Option[] = [
        {
            title: 'Juicy Chicken',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe.png',
            selectedCardImage: '/images/selected_recipe.png',
            value: 'chicken',
            selected: false
        },
        {
            title: 'Tasty Salmon',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe.png',
            selectedCardImage: '/images/selected_recipe.png',
            value: 'salmon',
            selected: false
        },
        {
            title: 'Hearty Beef',
            subtitle: 'For Picky Eaters',
            secondarySubtitle: 'Human-Grade Beef &...',
            cardImage: '/images/recipe.png',
            selectedCardImage: '/images/selected_recipe.png',
            value: 'beef',
            selected: false
        },
        // {
        //     title: 'Tasty Turkey',
        //     subtitle: 'For Picky Eaters',
        //     secondarySubtitle: 'Human-Grade Beef &...',
        //     cardImage: '/images/recipe.png',
        //     selectedCardImage: '/images/selected_recipe.png',
        //     value: 'turkey',
        //     selected: false
        // },
    ];

    const [recipes, ] = useState<Option[]>(baseRecipes);

    const handleRecipeSelect = (selected: number) => {
        const selectedRecipes = Object.values(protein).map((option, index) => {
            const isSelected = dogStore.dog.proteins.some(
                issueKey => selected !== index ? protein[issueKey as unknown as keyof typeof protein] === option : protein[issueKey as unknown as keyof typeof protein] !== option
            )
            return {
                selected: isSelected,
                title: option
            }
        })
            .filter(option => option.selected)
            .map(option => option.title)
            .filter((v): v is protein => !!v) as unknown as protein[];

        dogStore.subscription.selectedRecipes = selectedRecipes as unknown as protein[];
        console.log("selectedRecipes", dogStore.subscription.selectedRecipes)
    };

    // Fetch breeds from API
    useEffect(() => {
        const fetchBreeds = async () => {
            try {
                // setLoading(true);
                // setError(null);
                const api = new FetchApi();
                const response = await api.getBreeds();

                if (response.success) {
                    const breedNames = response.payload.breeds.map((breed: { name: string }) => breed.name);
                    setBreeds(breedNames);
                } else {
                    // setError('Failed to fetch breeds');
                }
            } catch (err) {
                console.error('Error fetching breeds:', err);
                // setError('Failed to fetch breeds');
            } finally {
                // setLoading(false);
            }
        };

        fetchBreeds();
    }, []);

    const handleOpenEditPopup = (index: number) => {
        console.log('Open Edit Popup clicked', index);
        setEditPopupOpen(true)
        setPopupOpen(false)

    };

    const handleOpenDogParamPopup = (index: number) => {
        console.log('Open Dog Param Popup clicked', index);
        setIsDogParamPopupOpen(true)
        setEditPopupOpen(false)
        setEditDogParamPopupIndex(index)
    };

    const handleBackEditPopup = () => {
        // console.log('Back Dog Param Popup clicked');
        setIsDogParamPopupOpen(false)
        setEditPopupOpen(false)
        setPopupOpen(true)
        setEditDogParamPopupIndex(0)
    };

    const handleBackDogParamPopup = () => {
        // console.log('Back Dog Param Popup clicked');
        setIsDogParamPopupOpen(false)
        setEditPopupOpen(true)
        setEditDogParamPopupIndex(0)
    };

    const handleClosePopup = () => {
        setPopupOpen(false);
        setIsDogParamPopupOpen(false)
        setEditPopupOpen(false)
    }

    const handleBack = () => {
        router.back();
    }

    const pathname = usePathname();

    return (
        <div className='relative'>
            <div className='relative py-0 md:px-4 bg-gray_background flex justify-center h-[48px] md:h-[88px] items-center gap-2.5 md:shadow-header md:backdrop-blur-xl'>
                <div className='relative mx-auto h-full w-full md:max-w-2xl flex items-center justify-center'>

                    {(pathname !== '/register/dog/subscription' && pathname !== '/register/dog/portion') && <button onClick={handleBack} className='absolute top-[16px] md:top-[32px] left-[24px] md:left-[24px]'>
                        <div
                            className='hidden md:flex px-4 gap-1 h-[24px] rounded-full border border-gray_divider justify-evenly items-center cursor-pointer'
                            onClick={() => setPopupOpen(true)}
                        >
                            <Image
                                src="/images/back-chevron-desktop.png"
                                width={6}
                                height={10}
                                alt="Chevron Left"
                                className='w-[6px] h-[10px]'
                            />
                            <p className='text-sm text-system_light_primary'>back</p>
                        </div>
                        <Image
                            src="/images/back-chevron.png"
                            width={32}
                            height={32}
                            alt="Chevron Left"
                            className='flex md:hidden w-[32px] h-[32px]'
                        />
                    </button>
                    }
                    <Image
                        src="/images/logo.png"
                        width={60}
                        height={20}
                        sizes="100vw"
                        alt="Logo"
                        className='w-[60px] h-[20px]'
                    />
                    {registeredDogs && <div
                        className='absolute top-[12px] md:top-[32px] right-[24px] md:right-[32px] px-4 gap-1 h-[24px] rounded-full bg-system_secondary flex justify-evenly items-center cursor-pointer'
                        onClick={() => setPopupOpen(true)}
                    >
                        <p className='text-sm text-system_accent'>{registeredDogs[0].dog.name.charAt(0).toUpperCase() + registeredDogs[0].dog.name.slice(1)}</p>
                        <Image
                            src="/images/chevrons4.png"
                            width={10}
                            height={10}
                            alt="Chevron"
                            className='object-cover h-[6px] w-[10px]'
                        />
                    </div>}
                </div>
            </div>

            {registeredDogs && <DogPopup
                title="Choose Pooch"
                content={<div className='w-full flex flex-col gap-4'>
                    {
                        registeredDogs.map((r, index) => {
                            return (
                                <div className='flex justify-between rounded-2xl bg-white border border-gray_divider p-4 shadow-lg' key={"dog-" + index}>
                                    <div>
                                        <p className='text-lg text-system_dark_primary font-bold'>{r.dog.name.charAt(0).toUpperCase() + r.dog.name.slice(1)}</p>
                                        <p className='text-sm text-system_dark_primary'>{r.dog.breed + ", " + r.dog.gender + ", ..."}</p>
                                    </div>
                                    <button onClick={() => handleOpenEditPopup(index)}>
                                        <Image
                                            src="/images/icons5.png"
                                            width={24}
                                            height={24}
                                            alt="Picture of the author"
                                            className='object-cover h-[24px] w-[24px]'
                                        />
                                    </button>
                                </div>
                            )
                        })
                    }

                </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                isOpen={isPopupOpen}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackEditPopup}
                title="Summary"
                content={
                    <div className='w-full flex flex-col gap-2'>
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Breed</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.breed}</p>
                                <button onClick={() => handleOpenDogParamPopup(1)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Age</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.age.toString()}</p>
                                <button onClick={() => handleOpenDogParamPopup(2)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Gender</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.gender}</p>
                                <button onClick={() => handleOpenDogParamPopup(3)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.gender == gender.female ? "Neutered" : "Spayed"}</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.isNeutered ? "Yes" : "No"}</p>
                                <button onClick={() => handleOpenDogParamPopup(4)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Activity level</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.activityLevel}</p>
                                <button onClick={() => handleOpenDogParamPopup(5)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Allergic food</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.allergies}</p>
                                <button onClick={() => handleOpenDogParamPopup(6)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Health issue</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.healthIssue}</p>
                                <button onClick={() => handleOpenDogParamPopup(7)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Favorite protein</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].dog.proteins}</p>
                                <button onClick={() => handleOpenDogParamPopup(8)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Meal portions</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].subscription.type}</p>
                                <button onClick={() => handleOpenDogParamPopup(9)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                        <div className='h-[0.5px] w-full stroke-[0.5px] bg-gray_divider' />
                        <div className='flex justify-between py-2 '>
                            <div>
                                <p className='text-base text-system_dark_primary font-medium'>Recipe</p>
                            </div>
                            <div className='flex gap-2'>
                                <p className='text-base text-system_light_primary font-medium'>{registeredDogs[editDogPopupIndex].subscription.selectedRecipes}</p>
                                <button onClick={() => handleOpenDogParamPopup(10)}>
                                    <Image
                                        src="/images/icons5.png"
                                        width={24}
                                        height={24}
                                        alt="Picture of the author"
                                        className='object-cover h-[24px] w-[24px]'
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                isOpen={isEditPopupOpen}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Breed"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <SearchableSelect
                                options={breeds}
                                placeholder="Breed"
                                onSelect={(value) => {
                                    // setSelectedOption(value);
                                    dogStore.dog.breed = value
                                    console.log("Selected:", value);
                                }}
                            />
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 1}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Age"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <LargeInput
                                type="date"
                                placeholder={`Birthday`}
                                // value={userStore.currentRegisteringDog == index ? dogStore.dog.name : ""}
                                onChange={(e) => { dogStore.dog.age = new Date(e.target.value) }}
                            // key={index}
                            />
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 2}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Gender"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
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
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 3}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Neutered"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <div className='flex flex-row gap-6 md:gap-10'>
                                <RadioGroup
                                    options={options}
                                    onSelect={handleSelect}
                                    multiSelect={false}
                                />
                            </div>
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 4}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Activity"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <div className='flex flex-row gap-6 md:gap-10'>
                                <RadioGroup
                                    options={activityOptions}
                                    onSelect={handleActivitySelect}
                                    multiSelect={false}
                                />
                            </div>
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 5}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Allergy"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <div className='flex flex-col align-center items-center grow gap-10'>
                                <RadioGroup
                                    options={allergyOptions}
                                    onSelect={handleAllergySelect}
                                    multiSelect={false}
                                />
                                {
                                    dogStore.dog.isAllergic &&
                                    <RadioChips chipOptions={chipOptions} onSelect={handleHealthSelect} multiSelect={true} />
                                }
                            </div>
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 6}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Health"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <div className='flex flex-col align-center items-center grow gap-10'>
                                <RadioGroup
                                    options={healthIssueOptions}
                                    onSelect={handleHealthIssueSelect}
                                    multiSelect={false}
                                />
                                {
                                    dogStore.dog.hasHealthIssue &&
                                    <RadioChips chipOptions={healthIssueChipOptions} onSelect={handleHealthIssuesSelect} multiSelect={true} />
                                }
                            </div>
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 7}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Favorite Protein"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <div className='flex flex-row gap-6 md:gap-10'>
                                <RadioGroup
                                    options={proteinOptions}
                                    onSelect={handleProteinSelect}
                                    multiSelect={true}
                                />
                            </div>
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 8}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Meal Portion"
                content={
                    <div className='w-full flex flex-col gap-4'>
                        {
                            <div className='flex flex-row gap-6 md:gap-10'>
                                <RadioGroup
                                    options={portionOptions}
                                    onSelect={handlePortionSelect}
                                    multiSelect={true}
                                />
                            </div>
                        }

                    </div>
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 9}
            />
            }
            {registeredDogs && <DogPopup
                onBack={handleBackDogParamPopup}
                title="Recipes"
                content={
                    <RadioGroup type='card' options={recipes} multiSelect onSelect={handleRecipeSelect} />
                }
                onOpen={handleOpenPopup}
                onClose={handleClosePopup}
                onSubmit={handleClosePopup}
                isOpen={isDogParamPopupOpen && editDogParamPopupIndex == 10}
            />
            }
        </div>
    );
};