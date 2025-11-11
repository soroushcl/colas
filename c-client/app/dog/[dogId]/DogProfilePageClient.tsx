"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Link from "next/link";
import InfoTable from "../../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
import Image from "next/image";
import { useStores } from "@/stores/StoreContext";
import DogPopup from "@/components/popups/DogPopup";
import SearchableSelect from "@/components/inputs/serchableSelectInput/SerchableSelectInput";
import RadioGroup, { Option } from "@/components/radio-button/RadioGroup";
import { activityLevel, allergy, gender, healthIssue, protein, subscriptionType } from "c-lib";
import CustomNumberComponent from "@/components/CustomNumberComponent";
import FetchApi from "@/services/api";
import LargeInput from "@/components/inputs/largeInput/LargeInput";
import RadioChips, { ChipOption } from "@/components/radio-button/RadioChips";
import { getEnumKeyByValue } from "@/utils/enumHelper";

interface DogProfilePageClientProps {
  dogId: string;
}

export function DogProfilePageClient({ dogId }: DogProfilePageClientProps) {
  const { userStore, dogStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isResumeSubscriptionPopupOpen, setIsResumeSubscriptionPopupOpen] = useState(false);
  const [isPortionPopupOpen, setIsPortionPopupOpen] = useState(false);
  const [isFrequencyPopupOpen, setIsFrequencyPopupOpen] = useState(false);
  const [isRecipePopupOpen, setIsRecipePopupOpen] = useState(false);
  const [isBreedPopupOpen, setIsBreedPopupOpen] = useState(false);
  const [isAgePopupOpen, setIsAgePopupOpen] = useState(false);
  const [isGenderPopupOpen, setIsGenderPopupOpen] = useState(false);
  const [isNeuteredPopupOpen, setIsNeuteredPopupOpen] = useState(false);
  const [isActivityPopupOpen, setIsActivityPopupOpen] = useState(false);
  const [isAllergyPopupOpen, setIsAllergyPopupOpen] = useState(false);
  const [isHealthPopupOpen, setIsHealthPopupOpen] = useState(false);
  const router = useRouter();
  const registeredDog = userStore.registeredDogs.filter((r: { dog: { id: string; }; }) => r.dog.id == dogId)[0]
  const recipes = registeredDog.activeOrders[0].detail.selectedRecipes.map((r: number | string) => {
    // Handle both old format (numbers) and new format (protein enum strings)
    if (typeof r === 'number') {
      // Old format: numbers
      return r == 1 ? ' Beef' : r == 2 ? ' Chicken' : r == 3 ? ' Salmon' : r == 4 ? ' Turkey' : ' ' + r
    } else {
      // New format: protein enum strings
      return ' ' + r
    }
  })
  const recipe = recipes.toString().substring(0, recipes.toString().length)
  const [dogData] = useState({
    name: registeredDog.dog.name.charAt(0).toUpperCase() + registeredDog.dog.name.slice(1),
    breed: registeredDog.dog.breed,
    age: new Date(registeredDog.dog.age).toDateString(),
    gender: registeredDog.dog.gender,
    neutered: registeredDog.dog.isNeutered,
    activity: registeredDog.dog.activityLevel,
    isAllergic: registeredDog.dog.isAllergic,
    allergies: registeredDog.dog.allergies,
    hasHealthIssue: registeredDog.dog.hasHealthIssue,
    healthIssue: registeredDog.dog.healthIssue,
    status: registeredDog.subscription.status,
    portions: registeredDog.activeOrders[0].detail.type,
    frequency: `${registeredDog.activeOrders[0].detail.recurring / 7} Week${registeredDog.activeOrders[0].detail.recurring > 7 ? "s" : ""}`,
    recipe: recipe,
    favoriteProtein: registeredDog.dog.proteins,
    price: `$${(registeredDog.activeOrders[0].detail.dailyPrice * registeredDog.activeOrders[0].detail.recurring).toFixed(2)} + Tax`
  });
  console.log("dogData", registeredDog.activeOrders[0].detail.selectedRecipes, dogData)
  console.log("registeredDog", registeredDog)

  const [deliveryFrequency, setDeliveryFrequency] = useState(registeredDog.activeOrders[0].detail.recurring / 7);

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
  const [recipess, setRecipess] = useState<Option[]>(baseRecipes);
  const handleRecipeSelect = (updatedOptions: Option[]) => {
    const selectedRecipes = updatedOptions
      .filter(option => option.selected)
      .map(option => option.value)
      .filter((v): v is string => !!v) as unknown as protein[];

    setRecipess(updatedOptions);
    dogStore.subscription.selectedRecipes = selectedRecipes as unknown as protein[];
    console.log("selectedRecipes", dogStore.subscription.selectedRecipes)
  };

  const [breeds, setBreeds] = useState<string[]>([]);

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

  const options: Option[] = [
    {
      title: "Yes",
      subtitle: `${dogData.name} is ${dogStore.dog.gender == gender.male ? "Neutered" : "Spayed"}`,
      selected: dogStore.dog.isNeutered,
    },
    {
      title: "No",
      subtitle: `${dogData.name} isn't ${dogStore.dog.gender == gender.male ? "Neutered" : "Spayed"}`,
      selected: !dogStore.dog.isNeutered,
    },
  ];

  const handleSelect = (updatedOptions: typeof options) => {
    // Sync selected values back to MobX store
    const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
    if (isNursingOption) {
      dogStore.dog.isNeutered = isNursingOption.selected;
    }
  };

  const activityOptions: Option[] = [
    {
      cardImage: 'activity-low.svg',
      title: "Low",
      secondarySubtitle: `Sleepy Guy`,
      selected: dogData.activity == activityLevel.low,
    },
    {
      cardImage: 'activity-medium.svg',
      title: "Normal",
      secondarySubtitle: `Fetches The Paper`,
      selected: dogData.activity == activityLevel.normal,
    },
    {
      cardImage: 'activity-high.svg',
      title: "High",
      secondarySubtitle: `Won’t Fall Asleep`,
      selected: dogData.activity == activityLevel.high,
    },
  ];

  const handleActivitySelect = (updatedOptions: typeof options) => {
    // Sync selected values back to MobX store
    const lowOption = updatedOptions.find((opt) => opt.title === "Low");
    if (lowOption) {
      if (lowOption.selected) {
        dogData.activity = activityLevel.low;
      }
    }
    const normalOption = updatedOptions.find((opt) => opt.title === "Normal");
    if (normalOption) {
      if (normalOption.selected) {
        dogData.activity = activityLevel.normal;
      }
    }
    const highOption = updatedOptions.find((opt) => opt.title === "High");
    if (highOption) {
      if (highOption.selected) {
        dogData.activity = activityLevel.high;
      }
    }
  };

  const allergyOptions: Option[] = [
    {
      title: "Yes",
      secondarySubtitle: `we want to avoid...`,
      selected: dogData.isAllergic,
    },
    {
      title: "No",
      secondarySubtitle: `Not any known allergies!`,
      selected: !dogData.isAllergic,
    },
  ];

  const chipOptions: ChipOption[] = dogData.isAllergic ? Object.values(allergy).map(option => {
    const isSelected = dogData.allergies && dogData.allergies.some(
      issueKey => allergy[issueKey as unknown as keyof typeof allergy] === option // Compare using enum value
    );
    return {
      title: option, // Use enum value (display text)
      selected: isSelected,
    };
  }) : [];

  const handleAllergySelect = (updatedOptions: typeof options) => {
    const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
    if (isNursingOption) {
      dogData.isAllergic = isNursingOption.selected;
    }
  };

  const handleHealthSelect = (updatedOptions: ChipOption[]) => {
    const selectedIssues = updatedOptions
      .filter(option => option.selected)
      .map(option => getEnumKeyByValue(allergy, option.title))
      .filter((key): key is keyof typeof allergy => !!key);

    dogData.allergies = selectedIssues as unknown as allergy[];
  };

  const healthIssueOptions: Option[] = [
    {
      title: "Yes",
      secondarySubtitle: `We're dealing with...`,
      selected: dogData.hasHealthIssue,
    },
    {
      title: "No",
      secondarySubtitle: `A poster child for health!`,
      selected: !dogData.hasHealthIssue,
    },
  ];

  const healthIssueChipOptions: ChipOption[] = dogData.hasHealthIssue ? Object.values(healthIssue).map(option => {
    const isSelected = dogData.healthIssue && dogData.healthIssue.some(
      issueKey => healthIssue[issueKey as unknown as keyof typeof healthIssue] === option // Compare using enum value
    );
    return {
      title: option, // Use enum value (display text)
      selected: isSelected,
    };
  }) : [];

  const handleHealthIssueSelect = (updatedOptions: typeof options) => {
    const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
    if (isNursingOption) {
      dogData.hasHealthIssue = isNursingOption.selected;
    }
  };

  const handleHealthIssuesSelect = (updatedOptions: ChipOption[]) => {
    const selectedIssues = updatedOptions
      .filter(option => option.selected)
      .map(option => getEnumKeyByValue(healthIssue, option.title))
      .filter((key): key is keyof typeof healthIssue => !!key);

    dogData.healthIssue = selectedIssues as unknown as healthIssue[];
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
  const handlePortionSelect = (updatedOptions: Option[]) => {
    const selected = updatedOptions.filter(op => {
      return op.selected
    })
    dogStore.subscription.type = selected[0].title as unknown as subscriptionType;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  // const subscribe = () => {
  //   console.log("subscribed")
  // }

  return (
    <ProcessLayout title={`*${dogData.name}*'s profile`} handleSubmit={(e) => { e.preventDefault(); setIsResumeSubscriptionPopupOpen(true); }} disabled={false} hasSubmit isPayment mainButtonText="Resume" nextArrow>

      <div className="w-full px-4 py-6 space-y-6 mb-8">
        <DogPopup
          title="Recipes"
          content={
            <RadioGroup type='card' options={recipess} multiSelect onSelect={handleRecipeSelect} />
          }
          onClose={() => setIsRecipePopupOpen(false)}
          onSubmit={() => setIsRecipePopupOpen(false)}
          isOpen={isRecipePopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsAllergyPopupOpen(false)}
          onSubmit={() => setIsAllergyPopupOpen(false)}
          isOpen={isAllergyPopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsHealthPopupOpen(false)}
          onSubmit={() => setIsHealthPopupOpen(false)}
          isOpen={isHealthPopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsActivityPopupOpen(false)}
          onSubmit={() => setIsActivityPopupOpen(false)}
          isOpen={isActivityPopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsNeuteredPopupOpen(false)}
          onSubmit={() => setIsNeuteredPopupOpen(false)}
          isOpen={isNeuteredPopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsGenderPopupOpen(false)}
          onSubmit={() => setIsGenderPopupOpen(false)}
          isOpen={isGenderPopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsAgePopupOpen(false)}
          onSubmit={() => setIsAgePopupOpen(false)}
          isOpen={isAgePopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsBreedPopupOpen(false)}
          onSubmit={() => setIsBreedPopupOpen(false)}
          isOpen={isBreedPopupOpen}
        />
        <DogPopup
          title="Change your delivery cycle:"
          content={
            <div className='w-full flex flex-col gap-4'>
              {
                <div className='flex flex-col gap-4 text-center pb-8 justify-center items-center'>
                  <div className="w-[216px] h-[112px] rounded-3xl bg-system_accent shadow-xs border-[0.5px] border-gray_divider p-4 flex flex-col justify-center">
                    <span className="text-xs text-label_tertiary">$46.32/WEEK</span>
                    <div>
                      <span className="text-lg font-felix_bold text-system_primary">$44.32</span>
                      <span className="text-sm text-system_primary">/WEEK</span>
                    </div>
                    <p className="text-system_dark_primary text-sm">{'Longer range, Lower price'}</p>
                  </div>
                  <div>
                    <p className="text-label_tertiary text-xs">{'Delivery every.....weeks'}</p>
                    <CustomNumberComponent value={deliveryFrequency} setValue={setDeliveryFrequency} minValue={1} maxValue={12} />
                  </div>
                  <p className='text-label_secondary text-sm'>{'Adjusting delivery frequency will change how much food you receive!'}</p>
                </div>
              }

            </div>
          }
          onClose={() => setIsFrequencyPopupOpen(false)}
          onSubmit={() => setIsFrequencyPopupOpen(false)}
          isOpen={isFrequencyPopupOpen}
        />
        <DogPopup
          title="Subscribe"
          content={
            <div className='w-full flex flex-col gap-4 pb-32'>
              <p className="font-roca text-xl text-system_light_primary">RESUME SUBSCRIPTION</p>
              <div className="text-label_primary text-sm">
                <span>Welcome back “name”. Your subscription will be resumed at </span>
                <span className="font-felix_bold">$302.69</span>
                <span> + tax charged every </span>
                <span className="font-felix_bold">2</span>
                <span> weeks. You can make changes to your meal selection after your sub is resumed.</span>
              </div>
              <p className="text-label_primary text-sm">When would you like your next box delivery? Please choose from the lis below:</p>
              <SearchableSelect
                options={[
                  'WEEK OF OCTOBER 28, 2024',
                  'WEEK OF OCTOBER 28, 2024',
                  'WEEK OF OCTOBER 28, 2024',
                  'WEEK OF OCTOBER 28, 2024',
                ]}
                onSelect={function (value: string): void {
                  throw new Error("Function not implemented.");
                }}
                placeholder="CHOOSE YOUR NEXT DELIVERY"
              ></SearchableSelect>
              <div className="text-xs">
                <span>By resuming your subscription, you agree to our </span>
                <span className="font-felix_bold text-semantic_blue cursor-pointer" onClick={() => window.location.href = '/'}>Terms of use.</span>
              </div>
            </div>
          }
          onClose={() => setIsResumeSubscriptionPopupOpen(false)}
          onSubmit={() => setIsResumeSubscriptionPopupOpen(false)}
          isOpen={isResumeSubscriptionPopupOpen}
        />
        <DogPopup
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
          onClose={() => setIsPortionPopupOpen(false)}
          onSubmit={() => setIsPortionPopupOpen(false)}
          isOpen={isPortionPopupOpen}
        />
        {/* Dog Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-[96px] h-[96px] rounded-full flex items-center justify-center">
              {/* Dog placeholder - Dalmatian-like pattern */}
              <Image src="/images/dog_avatar_register.png" alt="Table Dog" width={120} height={120} className='object-contain w-[96px] h-[96px]' />
            </div>
            {/* Edit Icon Overlay */}
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-system_primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-[#000000] text-center font-light">{`Upload your pup's photo to get featured on Insta!`}</p>

        {/* Subscriptions Section */}
        <h3 className="text-sm text-label_tertiary mb-3">Subscriptions:</h3>
        {dogData.favoriteProtein && <InfoTable
          rows={[
            { label: "Status", value: dogData.status, type: "badge" },
            { label: "Portions", value: dogData.portions, type: "value", onClick: () => setIsPortionPopupOpen(true) },
            { label: "Frequency", value: dogData.frequency, type: "value", onClick: () => setIsFrequencyPopupOpen(true) },
            { label: "Recipe", value: dogData.recipe, type: "value", onClick: () => setIsRecipePopupOpen(true) },
            { label: "Favorite protein", value: dogData.favoriteProtein, type: "value" },
            { label: "Price:", value: dogData.price, type: "text" }
          ]}
        />
        }
        {!dogData.favoriteProtein && <InfoTable
          rows={[
            { label: "Status", value: dogData.status, type: "badge" },
            { label: "Portions", value: dogData.portions, type: "value", onClick: () => setIsPortionPopupOpen(true) },
            { label: "Frequency", value: dogData.frequency, type: "value", onClick: () => setIsFrequencyPopupOpen(true) },
            { label: "Recipe", value: dogData.recipe, type: "value", onClick: () => setIsRecipePopupOpen(true) },
            { label: "Price:", value: dogData.price, type: "text" }
          ]}
        />
        }

        {/* Persona Section */}
        <h3 className="text-sm text-label_tertiary mb-3">Persona</h3>
        <InfoTable
          rows={[
            { label: "Name", value: dogData.name, type: "text" },
            { label: "Breed", value: dogData.breed, type: "value", onClick: () => setIsBreedPopupOpen(true) },
            { label: "Age", value: dogData.age, type: "value", onClick: () => setIsAgePopupOpen(true) },
            { label: "Gender", value: dogData.gender, type: "value", onClick: () => setIsGenderPopupOpen(true) },
            { label: "Neutered", value: dogData.neutered ? "Yes" : "No", type: "value", onClick: () => setIsNeuteredPopupOpen(true) },
            { label: "Activity level", value: dogData.activity, type: "value", onClick: () => setIsActivityPopupOpen(true) },
            { label: "Food allergies", value: dogData.allergies, type: "value", onClick: () => setIsAllergyPopupOpen(true) },
            { label: "Health issues", value: dogData.healthIssue, type: "value", onClick: () => setIsHealthPopupOpen(true) },
          ]}
        />
        {/* Sticky purchase bar */}
        {/* <div className="fixed bottom-0 left-0 right-0 z-30 md:relative md:w-full cursor-pointer" onClick={subscribe}>
          <div className="md:px-4">
            <div className="bg-system_primary shadow-[0_-4px_12px_rgba(0,0,0,0.1)] md:rounded-2xl">
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-white">
                <span className="">Purchase:</span>
                <div className="flex items-center gap-2">
                  <span className="line-through">311.23$</span>
                  <span className="font-bold">{dogData.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </ProcessLayout>
  );
}
