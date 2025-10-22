"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Link from "next/link";
import InfoTable from "../../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
import Image from "next/image";
import { useStores } from "@/stores/StoreContext";

interface DogProfilePageClientProps {
  dogId: string;
}

export function DogProfilePageClient({ dogId }: DogProfilePageClientProps) {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const registeredDog = userStore.registeredDogs.filter(r => r.dog.id == dogId)[0]
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
    allergies: registeredDog.dog.allergies,
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
    <ProcessLayout title={`*${dogData.name}*'s profile`} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment>

      <div className="w-full px-4 py-6 space-y-6 mb-8">
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
            { label: "Portions", value: dogData.portions, type: "value" },
            { label: "Frequency", value: dogData.frequency, type: "value" },
            { label: "Recipe", value: dogData.recipe, type: "value" },
            { label: "Favorite protein", value: dogData.favoriteProtein, type: "value" },
            { label: "Price:", value: dogData.price, type: "text" }
          ]}
        />
        }
        {!dogData.favoriteProtein && <InfoTable
          rows={[
            { label: "Status", value: dogData.status, type: "badge" },
            { label: "Portions", value: dogData.portions, type: "value" },
            { label: "Frequency", value: dogData.frequency, type: "value" },
            { label: "Recipe", value: dogData.recipe, type: "value" },
            { label: "Price:", value: dogData.price, type: "text" }
          ]}
        />
        }

        {/* Persona Section */}
        <h3 className="text-sm text-label_tertiary mb-3">Persona</h3>
        <InfoTable
          rows={[
            { label: "Name", value: dogData.name, type: "value" },
            { label: "Breed", value: dogData.breed, type: "value" },
            { label: "Age", value: dogData.age, type: "value" },
            { label: "Gender", value: dogData.recipe, type: "value" },
            { label: "Neutered", value: dogData.neutered ? "Yes" : "No", type: "value" },
            { label: "Activity level", value: dogData.activity, type: "value" },
            { label: "Food allergies", value: dogData.allergies, type: "value" },
            { label: "Health issues", value: dogData.healthIssue, type: "value" }
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
