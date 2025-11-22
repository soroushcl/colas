"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
// import Link from "next/link";
import InfoTable from "../../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
import Image from "next/image";
import { useStores } from "@/stores/StoreContext";
import DogPopup from "@/components/popups/DogPopup";
import SearchableSelect from "@/components/inputs/serchableSelectInput/SerchableSelectInput";
import RadioGroup, { Option } from "@/components/radio-button/RadioGroup";
import { activityLevel, allergy, gender, healthIssue, protein, subscriptionInfo, subscriptionStatus, subscriptionType } from "c-lib";
import CustomNumberComponent from "@/components/CustomNumberComponent";
import FetchApi from "@/services/api";
import LargeInput from "@/components/inputs/largeInput/LargeInput";
import RadioChips, { ChipOption } from "@/components/radio-button/RadioChips";
import { getEnumKeyByValue } from "@/utils/enumHelper";
import RecipeCards from "@/components/radio-button/RecipeCards";
import { observer } from "mobx-react-lite";

interface DogProfilePageClientProps {
  dogId: string;
}

const nextWeeksCalculator = (weeks?: number) => {
  if (!weeks) {
    weeks = 28
  }
  const now = new Date();
  // if (date) now = date;
  const t = now.getDay();
  let diff = 0;
  diff = (7 + (1 - t)) % 7 || 7;
  let nextMonday;
  if (diff <= 4) {
    nextMonday = new Date(new Date(now.setDate(now.getDate() + diff + 7)).setHours(0, 0, 0));
  } else {
    nextMonday = new Date(new Date(now.setDate(now.getDate() + diff)).setHours(0, 0, 0));
  }
  let tempNextMonday = new Date(nextMonday);
  const result = [tempNextMonday.toLocaleString('default', { year: "numeric", month: "long", day: "numeric" }).toUpperCase()];
  for (let i = 1; i < weeks; i++) {
    tempNextMonday = new Date(tempNextMonday.getTime() + 7 * 24 * 60 * 60 * 1000)
    result.push(tempNextMonday.toLocaleString('default', { year: "numeric", month: "long", day: "numeric" }).toUpperCase())
  }
  return result;
}

export const DogProfilePageClient = observer(({ dogId }: DogProfilePageClientProps) => {
  const { userStore, dogStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isResumeSubscriptionPopupOpen, setIsResumeSubscriptionPopupOpen] = useState(false);
  const [isPortionPopupOpen, setIsPortionPopupOpen] = useState(false);
  const [isFrequencyPopupOpen, setIsFrequencyPopupOpen] = useState(false);
  const [isRecipePopupOpen, setIsRecipePopupOpen] = useState(false);
  const [isEditingDog, setIsEditingDog] = useState(false);
  const [isBreedPopupOpen, setIsBreedPopupOpen] = useState(false);
  const [isAgePopupOpen, setIsAgePopupOpen] = useState(false);
  const [isGenderPopupOpen, setIsGenderPopupOpen] = useState(false);
  const [isNeuteredPopupOpen, setIsNeuteredPopupOpen] = useState(false);
  const [isActivityPopupOpen, setIsActivityPopupOpen] = useState(false);
  const [isAllergyPopupOpen, setIsAllergyPopupOpen] = useState(false);
  const [isHealthPopupOpen, setIsHealthPopupOpen] = useState(false);
  const router = useRouter();
  const registeredDog = userStore.registeredDogs.filter((r: { dog: { id: string; }; }) => r.dog.id == dogId)[0]
  const recipes = registeredDog?.dog?.subscription?.selectedRecipes.map((r: number | string) => {
    // Handle both old format (numbers) and new format (protein enum strings)
    if (typeof r === 'number') {
      // Old format: numbers
      return r == 1 ? ' Beef' : r == 2 ? ' Chicken' : r == 3 ? ' Salmon' : r == 4 ? ' Turkey' : ' ' + r
    } else {
      // New format: protein enum strings
      return ' ' + r
    }
  })
  const [chickenAmount,] = useState(registeredDog?.subscription.info[0]?.amount || 0)
  const [salmonAmount,] = useState(registeredDog?.subscription.info[1]?.amount || 0)
  const [BeefAmount,] = useState(registeredDog?.subscription.info[2]?.amount || 0)

  const shortNextWeeks = nextWeeksCalculator(4);

  const recipe = recipes?.toString().substring(0, recipes.toString().length)
  const [deliveryFrequency, setDeliveryFrequency] = useState(registeredDog?.subscription.recurring / 7);
  const [mealType, setMealType] = useState(registeredDog?.subscription.type);
  const [dogData] = useState({
    name: registeredDog?.dog.name.charAt(0).toUpperCase() + registeredDog?.dog.name.slice(1),
    breed: registeredDog?.dog.breed,
    age: new Date(registeredDog?.dog.age).toDateString(),
    gender: (registeredDog?.dog.gender.toLowerCase() == 'female') ? gender.female : gender.male,
    activity: registeredDog?.dog.activityLevel.toLowerCase() == 'low' ? activityLevel.low : registeredDog?.dog.activityLevel.toLowerCase() == 'high' ? activityLevel.high : activityLevel.normal,
    isAllergic: registeredDog?.dog.isAllergic,
    isNeutered: registeredDog?.dog.isNeutered,
    allergies: registeredDog?.dog.allergies,
    hasHealthIssue: registeredDog?.dog.hasHealthIssue,
    healthIssue: registeredDog?.dog.healthIssue,
    status: registeredDog?.subscription.status,
    portions: registeredDog?.subscription.type,
    frequency: `${deliveryFrequency} Week${deliveryFrequency > 1 ? "s" : ""}`,
    recipe: recipe,
    favoriteProtein: registeredDog?.dog.proteins,
    price: `$${(registeredDog?.subscription.dailyPrice * registeredDog?.subscription.recurring).toFixed(2)} + Tax`
  });
  console.log("dogData", dogData)
  console.log("registeredDog", registeredDog)

  const weeklyPrice = registeredDog?.subscription.weeklyPrices!.filter(p => p.week == registeredDog?.subscription.recurring / 7)[0].price.toFixed(2)
  const [selectedNextWeek, setSelectedNextWeek] = useState('');
  const api = new FetchApi();

  const baseRecipes: Option[] = useMemo(() => [
    {
      title: 'Juicy Chicken',
      subtitle: 'For Picky Eaters',
      secondarySubtitle: 'Human-Grade Beef &...',
      cardImage: '/images/recipe.png',
      selectedCardImage: '/images/selected_recipe.png',
      amount: registeredDog?.subscription.info[0]?.amount || 0,
      value: 'chicken',
      selected: false
    },
    {
      title: 'Tasty Salmon',
      subtitle: 'For Picky Eaters',
      secondarySubtitle: 'Human-Grade Beef &...',
      cardImage: '/images/recipe.png',
      selectedCardImage: '/images/selected_recipe.png',
      amount: registeredDog?.subscription.info[1]?.amount || 0,
      value: 'salmon',
      selected: false
    },
    {
      title: 'Hearty Beef',
      subtitle: 'For Picky Eaters',
      secondarySubtitle: 'Human-Grade Beef &...',
      cardImage: '/images/recipe.png',
      selectedCardImage: '/images/selected_recipe.png',
      amount: registeredDog?.subscription.info[2]?.amount || 0,
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
  ], [registeredDog?.subscription.info]);



  const [breeds, setBreeds] = useState<string[]>([]);
  const [breed, setBreed] = useState(dogData.breed);
  const [age, setAge] = useState(dogData.age);
  const [gen, setGender] = useState(dogData.gender);
  const [isNeutered, setIsNeutered] = useState(dogData.isNeutered);
  const [activity, setActivity] = useState(dogData.activity);
  const [isAllergic, setIsAllergic] = useState(dogData.isAllergic);
  const [allergies, setAllergies] = useState(dogData.allergies);
  const [hasIssue, setHasIssue] = useState(dogData.hasHealthIssue);
  const [issues, setIssues] = useState(dogData.healthIssue);


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
      subtitle: `${dogData.name} is ${dogData.gender == gender.male ? "Neutered" : "Spayed"}`,
      selected: isNeutered,
    },
    {
      title: "No",
      subtitle: `${dogData.name} isn't ${dogData.gender == gender.male ? "Neutered" : "Spayed"}`,
      selected: !isNeutered,
    },
  ];

  const handleSelect = (selected: number) => {
    console.log(selected)

    // Sync selected values back to MobX store
    // const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
    if (selected) {
      setIsNeutered(false);
    } else {
      setIsNeutered(true)
    }
  };

  const activityOptions: Option[] = [
    {
      cardImage: 'activity-low.svg',
      title: "Low",
      secondarySubtitle: `Sleepy Guy`,
      selected: activity == activityLevel.low,
    },
    {
      cardImage: 'activity-medium.svg',
      title: "Normal",
      secondarySubtitle: `Fetches The Paper`,
      selected: activity == activityLevel.normal,
    },
    {
      cardImage: 'activity-high.svg',
      title: "High",
      secondarySubtitle: `Won’t Fall Asleep`,
      selected: activity == activityLevel.high,
    },
  ];

  const handleActivitySelect = (selected: number) => {
    console.log(selected)

    // Sync selected values back to MobX store
    // const isNursingOption = updatedOptions.find((opt) => opt.title === "Yes");
    if (selected == 0) {
      setActivity(activityLevel.low);
    } else if (selected == 1) {
      setActivity(activityLevel.normal);
    } else {
      setActivity(activityLevel.high);
    }
  };

  const allergyOptions: Option[] = [
    {
      title: "Yes",
      secondarySubtitle: `we want to avoid...`,
      selected: isAllergic,
    },
    {
      title: "No",
      secondarySubtitle: `Not any known allergies!`,
      selected: !isAllergic,
    },
  ];

  const chipOptions: ChipOption[] = isAllergic ? Object.values(allergy).map(option => {
    const isSelected = allergies && allergies.some(
      issueKey => allergy[issueKey as unknown as keyof typeof allergy] === option // Compare using enum value
    );
    return {
      title: option, // Use enum value (display text)
      selected: isSelected,
    };
  }) : [];

  const handleAllergySelect = (selected: number) => {
    console.log(selected)

    if (selected == 0) {
      setIsAllergic(true);
    } else if (selected == 1) {
      setIsAllergic(false);
    }
  };

  const handleAllergiesSelect = (updatedOptions: ChipOption[]) => {
    const selectedIssues = updatedOptions
      .filter(option => option.selected)
      .map(option => getEnumKeyByValue(allergy, option.title))
      .filter((key): key is keyof typeof allergy => !!key);

    setAllergies(selectedIssues as unknown as allergy[])
  };

  const healthIssueOptions: Option[] = [
    {
      title: "Yes",
      secondarySubtitle: `We're dealing with...`,
      selected: hasIssue,
    },
    {
      title: "No",
      secondarySubtitle: `A poster child for health!`,
      selected: !hasIssue,
    },
  ];

  const healthIssueChipOptions: ChipOption[] = hasIssue ? Object.values(healthIssue).map(option => {
    const isSelected = issues && issues.some(
      issueKey => healthIssue[issueKey as unknown as keyof typeof healthIssue] === option // Compare using enum value
    );
    console.log('healthIssueChipOptions', option)
    return {
      title: option, // Use enum value (display text)
      selected: isSelected,
    };
  }) : [];

  const handleHealthIssueSelect = (selected: number) => {
    console.log(selected)

    if (selected == 0) {
      setHasIssue(true);
    } else if (selected == 1) {
      setHasIssue(false);
    }
  };

  const handleHealthIssuesSelect = (updatedOptions: ChipOption[]) => {
    const selectedIssues = updatedOptions
      .filter(option => option.selected)
      .map(option => getEnumKeyByValue(healthIssue, option.title))
      .filter((key): key is keyof typeof healthIssue => !!key);

    setIssues(selectedIssues as unknown as healthIssue[])
  };


  const portionOptions: Option[] = useMemo(() => Object.values(subscriptionType).map(option => {
    console.log("portionOptions", registeredDog?.subscription.type, option)
    return {
      cardImage: `${option}.svg`,
      title: option + ` (${registeredDog?.subscription.subscriptionTypePrices?.filter(p => p.type == option)[0].price?.toFixed(2) || 0})`,
      subtitle: `${option == 'Full' ? "Full daily portions" : option == 'Half' ? "Half daily portions." : option == 'Topper' ? "Quarter daily portions." : "Lean, simple & clean"}`,
      secondarySubtitle: `${option == 'Full' ? "No need to add anything else." : option == 'Half' ? "Mix with old diet to provide boost!" : option == 'Topper' ? "Perfect to enhance current diet." : "Lean, simple & clean"}`,
      selected: mealType?.toLowerCase() === option.toLowerCase(),
      amount: registeredDog?.subscription.subscriptionTypePrices?.filter(p => p.type == option)[0].price,
    }
  }), [registeredDog?.subscription.type, registeredDog?.subscription.subscriptionTypePrices, mealType]);

  const handlePortionSelect = (selected: number) => {
    // const selected = updatedOptions.filter(op => {
    //   return op.selected
    // })
    console.log("subscription.type", mealType, registeredDog?.subscription.type, selected == 0 ? subscriptionType['full'] : selected == 1 ? subscriptionType['half'] : subscriptionType['topper'])
    setMealType(selected == 0 ? subscriptionType['full'] : selected == 1 ? subscriptionType['half'] : subscriptionType['topper'])
    // registeredDog.subscription.type = selected.title.includes('Full') ? subscriptionType['full'] : selected.title.includes('Half') ? subscriptionType['half'] : subscriptionType['topper'];
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
    <ProcessLayout title={`*${dogData.name}*'s profile`} handleSubmit={(e) => { e.preventDefault(); setIsResumeSubscriptionPopupOpen(true); }} disabled={false} hasSubmit={registeredDog?.subscription.status.toLocaleLowerCase() == subscriptionStatus.paused.toLocaleLowerCase() || registeredDog?.subscription.status.toLocaleLowerCase() == subscriptionStatus.canceled.toLocaleLowerCase()} isPayment mainButtonText={registeredDog?.subscription.status.toLocaleLowerCase() == subscriptionStatus.paused.toLocaleLowerCase() ? "Resume" : registeredDog?.subscription.status.toLocaleLowerCase() == subscriptionStatus.canceled.toLocaleLowerCase() ? "Reactive" : "Resume"} nextArrow>

      <div className="w-full px-4 py-6 space-y-6 mb-8">
        <DogPopup
          title="Recipes"
          content={
            <RecipeCards
              options={baseRecipes.map(({ cardImage, ...rest }, index) => ({
                ...rest,
                cardImage: cardImage ?? '',
                value: registeredDog?.subscription.info[index].amount,
              }))}
              total={deliveryFrequency * 7}
              onValueChange={(optionTitle, newValue) => {
                // Update the subscription info based on the recipe title
                if (optionTitle === 'Juicy Chicken') {
                  registeredDog.subscription.info[0].amount = newValue;
                } else if (optionTitle === 'Tasty Salmon') {
                  registeredDog.subscription.info[1].amount = newValue;
                } else if (optionTitle === 'Hearty Beef') {
                  registeredDog.subscription.info[2].amount = newValue;
                }
              }}
            />
          }
          onClose={() => setIsRecipePopupOpen(false)}
          onSubmit={async () => {
            try {
              if (isEditingDog) {
                const info = registeredDog.dog.subscription!.info.map(r => {
                  return {
                    protein: registeredDog.recipes.filter(s => s.id == r.recipeId)[0].protein,
                    amount: r.amount
                  };
                });
                const result = await api.editDog(registeredDog.dog.id, info);
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  // const payload: any = (result as any).payload;
                  // setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(userStore.registeredDogs));
                  // window.location.reload();
                  setIsEditingDog(false);
                  setIsRecipePopupOpen(false);
                  // setIsBreedPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog:", result.error);
                  alert("ailed to update dog. Please try again.");
                }
              } else {

                // Only call API if frequency has changed
                // registeredDog?.subscription.info[0].amount += 1
                if (deliveryFrequency !== registeredDog?.subscription.recurring / 7) {
                  const sub = {
                    selectedRecipes: registeredDog?.subscription.selectedRecipes,
                    recurring: deliveryFrequency * 7, // Convert weeks to days
                    sub: registeredDog?.subscription.info.map((info: subscriptionInfo) => {
                      const recipeIdValue =
                        info.recipeId;
                      return {
                        recipeId: recipeIdValue,
                        amount: info.amount
                      };
                    })
                  };

                  const result = await api.updateDogRecurring(dogId, sub);
                  if (result.status === "success") {
                    // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                    registeredDog.subscription.recurring = deliveryFrequency * 7
                    setIsFrequencyPopupOpen(false);
                    setIsRecipePopupOpen(false);
                    // Optionally refresh the page or update the store
                    window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(userStore.registeredDogs));
                    window.location.reload();
                  } else {
                    console.error("Failed to update dog recurring:", result.err);
                    alert("Failed to update delivery frequency. Please try again.");
                  }
                } else if ((chickenAmount !== registeredDog?.subscription.info[0]?.amount) || (salmonAmount !== registeredDog?.subscription.info[1]?.amount) || (BeefAmount !== registeredDog?.subscription.info[2]?.amount)) {
                  const sub = {
                    selectedRecipes: registeredDog?.subscription.selectedRecipes,
                    recurring: deliveryFrequency * 7, // Convert weeks to days
                    sub: registeredDog?.subscription.info.map((info: subscriptionInfo) => {
                      // Handle both old format (recipeId as number) and new format (recipeId as object)
                      // const recipeIdValue = typeof info.recipeId === 'object' && info.recipeId?.recipeId
                      //   ? info.recipeId.recipeId
                      //   : info.recipeId;
                      const recipeIdValue = info.recipeId;

                      return {
                        recipeId: recipeIdValue,
                        amount: info.amount
                      };
                    })
                  };

                  const result = await api.updateDogRecurring(dogId, sub);
                  if (result.status === "success") {
                    // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                    registeredDog.subscription.recurring = deliveryFrequency * 7
                    setIsFrequencyPopupOpen(false);
                    setIsRecipePopupOpen(false);
                    // Optionally refresh the page or update the store
                    window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(userStore.registeredDogs));
                    window.location.reload();
                  } else {
                    console.error("Failed to update dog recurring:", result.err);
                    alert("Failed to update delivery frequency. Please try again.");
                  }
                } else {
                  setIsFrequencyPopupOpen(false);
                  setIsRecipePopupOpen(false);
                }
                console.log(chickenAmount, registeredDog?.subscription.info[0]?.amount)
                console.log(salmonAmount, registeredDog?.subscription.info[1]?.amount)
                console.log(BeefAmount, registeredDog?.subscription.info[2]?.amount)
              }
            } catch (error) {
              console.error("Error updating dog recurring:", error);
              alert("An error occurred while updating delivery frequency. Please try again.");
            }
          }}
          isOpen={isRecipePopupOpen}
          disabled={false}
        />
        <DogPopup
          title="Allergy"
          content={
            <div className='w-full flex flex-col gap-4'>
              {
                <div className='flex flex-col align-center items-center grow gap-10'>
                  <RadioGroup
                    options={allergyOptions}
                    onSelect={(selected) => { handleAllergySelect(selected) }}
                    multiSelect={false}
                  />
                  {
                    isAllergic &&
                    <RadioChips chipOptions={chipOptions} onSelect={handleAllergiesSelect} multiSelect={true} />
                  }
                </div>
              }

            </div>
          }
          onClose={() => setIsAllergyPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if ((isAllergic !== dogData.isAllergic) || (allergies !== dogData.allergies)) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, isAllergic: isAllergic, allergies: allergies });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.isAllergic = isAllergic
                  registeredDog.dog.allergies = allergies
                  dogData.isAllergic = isAllergic
                  dogData.allergies = allergies
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsAllergyPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsAllergyPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog Allergy:", error);
              alert("An error occurred while updating Allergy. Please try again.");
            }
          }}
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
                    onSelect={(selected) => { handleHealthIssueSelect(selected) }}
                    multiSelect={false}
                  />
                  {
                    hasIssue &&
                    <RadioChips chipOptions={healthIssueChipOptions} onSelect={handleHealthIssuesSelect} multiSelect={true} />
                  }
                </div>
              }

            </div>
          }
          onClose={() => setIsHealthPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (hasIssue !== dogData.hasHealthIssue || issues !== dogData.healthIssue) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, hasHealthIssue: hasIssue, healthIssue: issues });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.hasHealthIssue = hasIssue
                  registeredDog.dog.healthIssue = issues
                  dogData.hasHealthIssue = hasIssue
                  dogData.healthIssue = issues
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsHealthPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsHealthPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog Health:", error);
              alert("An error occurred while updating Health. Please try again.");
            }
          }}
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
                    onSelect={(selected) => { handleActivitySelect(selected) }}
                    multiSelect={false}
                  />
                </div>
              }

            </div>
          }
          onClose={() => setIsActivityPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (activity !== dogData.activity) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, activityLevel: activity });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.activityLevel = activity
                  dogData.activity = activity
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsActivityPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsActivityPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog Activity:", error);
              alert("An error occurred while updating Activity Level. Please try again.");
            }
          }}
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
                    onSelect={(selected) => { handleSelect(selected) }}
                    multiSelect={false}
                  />
                </div>
              }

            </div>
          }
          onClose={() => setIsNeuteredPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (isNeutered !== dogData.isNeutered) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, isNeutered: isNeutered });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.isNeutered = isNeutered
                  dogData.isNeutered = isNeutered
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsNeuteredPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsNeuteredPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog age:", error);
              alert("An error occurred while updating age. Please try again.");
            }
          }}
          isOpen={isNeuteredPopupOpen}
        />
        <DogPopup
          title="Gender"
          content={
            <div className='w-full flex flex-col gap-4'>
              {
                <div className='flex flex-row gap-6 md:gap-10'>
                  {[0, 1].map(dogGender => {
                    console.log(dogGender, gen, (gen == gender.female), (gen == gender.male))
                    return <div
                      className='flex flex-col items-center gap-2 cursor-pointer'
                      key={dogGender}
                      onClick={() => dogGender == 1 ? setGender(gender.male) : setGender(gender.female)}
                    >
                      <Image
                        src={`/images/${(dogGender == 0) ? (gen == gender.female) ? "selected-female.svg" : "female.svg" : (gen == gender.male) ? "selected-male.svg" : "male.svg"}`}
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
                            className={`w-5 h-5 flex items-center justify-center rounded-full ${((gen == gender.male && dogGender == 1) || (gen == gender.female && dogGender == 0)) ? "border-3 border-system_primary" : "border-2 border-gray_icon"
                              }`}
                          >
                            {((gen == gender.male && dogGender == 1) || (gen == gender.female && dogGender == 0)) && (
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
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (gen !== dogData.gender) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, gender: gen });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.gender = gen
                  dogData.gender = gen
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsGenderPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsGenderPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog age:", error);
              alert("An error occurred while updating age. Please try again.");
            }
          }}
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
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const date = new Date(dateValue);
                      setAge(date.toDateString());
                    }
                  }}
                  value={age ? (() => {
                    const date = new Date(age);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })() : ''}
                />
              }

            </div>
          }
          onClose={() => setIsAgePopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (age !== dogData.age) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, age: new Date(age) });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.age = new Date(age)
                  dogData.age = age
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsAgePopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsAgePopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog age:", error);
              alert("An error occurred while updating age. Please try again.");
            }
          }}
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
                    setBreed(value)
                    console.log("Selected:", value);
                  }}
                  selected={breed}
                />
              }

            </div>
          }
          onClose={() => setIsBreedPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (breed !== dogData.breed) {

                const result = await api.editPoochRecipes({ ...registeredDog.dog, breed: breed });
                if (result.success) {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  const payload: any = (result as any).payload;
                  setDeliveryFrequency(payload.dog.subscription.recurring / 7)
                  registeredDog.dog.breed = breed
                  dogData.breed = breed
                  setIsEditingDog(true);
                  setIsRecipePopupOpen(true);
                  setIsBreedPopupOpen(false);
                  // Optionally refresh the page or update the store
                } else {
                  console.error("Failed to update dog breed:", result.error);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsBreedPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog subscription type:", error);
              alert("An error occurred while updating subscription type. Please try again.");
            }
          }}
          isOpen={isBreedPopupOpen}
        />
        <DogPopup
          title="Change your delivery cycle:"
          content={
            <div className='w-full flex flex-col gap-4'>
              {
                <div className='flex flex-col gap-4 text-center pb-8 justify-center items-center'>
                  <div className="w-[216px] h-[112px] rounded-3xl bg-system_accent shadow-xs border-[0.5px] border-gray_divider p-4 flex flex-col justify-center">
                    {(deliveryFrequency !== registeredDog?.subscription.recurring / 7) && <span className="text-xs text-label_tertiary">{"$" + weeklyPrice + "/WEEK"}</span>}
                    <div>
                      <span className={`text-lg font-felix_bold ${deliveryFrequency < registeredDog?.subscription.recurring / 7 ? "text-semantic_red" : "text-system_primary"}`}>{"$" + registeredDog?.subscription.weeklyPrices!.filter(p => p.week == deliveryFrequency)[0].price.toFixed(2)}</span>
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
          onSubmit={() => setIsRecipePopupOpen(true)}
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
                options={shortNextWeeks}
                onSelect={function (value: string): void {
                  setSelectedNextWeek(value)
                }}
                placeholder="CHOOSE YOUR NEXT DELIVERY"
                selected={selectedNextWeek}
              ></SearchableSelect>
              <div className="text-xs">
                <span>By resuming your subscription, you agree to our </span>
                <span className="font-felix_bold text-semantic_blue cursor-pointer" onClick={() => window.location.href = '/'}>Terms of use.</span>
              </div>
            </div>
          }
          onClose={() => setIsResumeSubscriptionPopupOpen(false)}
          onSubmit={async () => {
            try {
              const until = new Date(selectedNextWeek)
              const subscriptionId = registeredDog.subscription.id
              console.log("until", until.getTime())

              const result = await api.reactivateSubscription(subscriptionId, until.getTime());
              if (result.status === "success") {
                registeredDog.subscription.status = subscriptionStatus.active
                setIsResumeSubscriptionPopupOpen(false);
                window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(userStore.registeredDogs));
                window.location.reload();
              } else {
                console.error("Failed to reactive dog subscription:", result.err);
                alert("Failed to reactive dog subscription. Please try again.");
              }

            } catch (error) {
              console.error("Error reactive dog subscription:", error);
              alert("Failed to reactive dog subscription. Please try again.");
            }
          }}
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
                    onSelect={(selected) => { handlePortionSelect(selected) }}
                    multiSelect={true}
                  />
                </div>
              }

            </div>
          }
          onClose={() => setIsPortionPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (mealType !== registeredDog?.subscription.type) {
                userStore.setDogSubscriptionType(dogId, mealType)

                const result = await api.updateDogSubscriptionFoodType(dogId, mealType);
                if (result.status === "success") {
                  // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
                  registeredDog.subscription.recurring = deliveryFrequency * 7
                  setIsFrequencyPopupOpen(false);
                  setIsRecipePopupOpen(false);
                  // Optionally refresh the page or update the store
                  window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(userStore.registeredDogs));
                  window.location.reload();
                } else {
                  console.error("Failed to update dog subscription type:", result.err);
                  alert("Failed to update delivery subscription type. Please try again.");
                }
              } else {
                setIsPortionPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog subscription type:", error);
              alert("An error occurred while updating subscription type. Please try again.");
            }
          }}
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
            { label: "Frequency", value: deliveryFrequency, type: "value", onClick: () => setIsFrequencyPopupOpen(true) },
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
            { label: "Neutered", value: dogData.isNeutered ? "Yes" : "No", type: "value", onClick: () => setIsNeuteredPopupOpen(true) },
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
});
