"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import React from 'react';
import Image from 'next/image';
import { gender } from 'c-lib';

// interface NutritionFact {
//     name: string;
//     value: number; // The actual amount of the nutrient
//     max: number;   // The recommended or maximum amount
//     unit: string;   // The recommended or maximum amount
// }

// interface ProgressBarProps {
//     name: string;
//     value: number;
//     max: number;
//     unit: string;
// }

// interface NutritionFactsTableProps {
//     nutritionFacts: NutritionFact[];
// }

// const ProgressBar: React.FC<ProgressBarProps> = ({ name, value, max, unit }) => {
//     const percentage = (value / max) * 100;

//     return (
//         <div className="flex flex-col gap-1">
//             <div className="flex justify-between">
//                 <span className="font-medium">{name}</span>
//                 <span className="text-sm">{value} {unit}</span>
//             </div>
//             <div className="w-full bg-gray_placeholder rounded h-2">
//                 <div
//                     className="bg-system_secondary h-2 rounded-xl"
//                     style={{ width: `${Math.min(percentage, 100)}%` }}
//                 ></div>
//             </div>
//         </div>
//     );
// };

// const NutritionFactsTable: React.FC<NutritionFactsTableProps> = ({ nutritionFacts }) => {
//     return (
//         <div className="w-full py-6 px-4 bg-gray_foreground rounded-xl border border-gray_divider">
//             <div className="space-y-4">
//                 {nutritionFacts.map((fact, index) => (
//                     <ProgressBar key={index} name={fact.name} value={fact.value} max={fact.max} unit={fact.unit} />
//                 ))}
//             </div>
//         </div>
//     );
// };

const Home: React.FC = observer(() => {
    const { dogStore, userStore } = useStores();
    // const { mainButtondisabled } = regStore;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const [isImageVisible, setIsImageVisible] = useState(false);
    const router = useRouter();
    const recipe = dogStore.recipes[0];
    // const nutritionFacts: NutritionFact[] = recipe ? [
    //     { name: 'Protein', value: parseFloat(recipe.crudeProtein.toFixed(2)), max: 50, unit: "g" },
    //     { name: 'Fat', value: parseInt(recipe.fat.replace("Min", "").replace("%", "")), max: 70, unit: "%" },
    //     { name: 'Carbohydrates', value: 30, max: 300, unit: "%" },
    //     { name: 'Calories', value: parseFloat(recipe.calorie.toFixed(0)), max: 2500, unit: "cal" },
    // ] : [
    //     { name: 'Protein', value: 0, max: 50, unit: "g" },
    //     { name: 'Fat', value: 0, max: 70, unit: "%" },
    //     { name: 'Carbohydrates', value: 0, max: 300, unit: "%" },
    //     { name: 'Calories', value: 0, max: 2500, unit: "cal" },
    // ];
    // console.log("recipes", dogStore.recipes)
    // if (!dogStore.recipes[0]){
    //     return <p>Redirecting to home...</p>;
    // }
    // const nutritionFacts: NutritionFact[] = Object.keys(dogStore.recipes[0].recipes[0]).map(fact => {
    //     return {
    //         name: fact,
    //         value: dogStore.recipes[0].recipes[0].calorie,
    //         max: 100
    //     }
    // })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dogStore.currentStep += 1
        router.push('/register/dog/recipe');
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

    useEffect(() => {
        // Trigger the image animation after component mounts
        const timer = setTimeout(() => {
            // setIsImageVisible(true);
        }, 100); // Small delay to ensure smooth animation

        return () => clearTimeout(timer);
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
        <ProcessLayout title={`*${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* Nutrition Analysis`} subTitle={`${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}'s ideal recipe would consist of:`} handleSubmit={handleSubmit} disabled={!recipe} nextArrow mainButtonText={"Next"} registeredDogs={userStore.registeredDogs}>
            <div className="w-full flex flex-col items-center justify-center">
                <div className='w-full py-1 px-4 flex flex-row justify-between items-center bg-gray_foreground rounded-xl border border-gray_divider'>
                    <div className='flex flex-row justify-between items-center'>
                        <Image
                            src={`/images/heart.png`}
                            width={48}
                            height={48}
                            className="object-contain w-12 h-12"
                            alt={"Cola"}
                        />
                        <div>
                            {/* <span>{`*${dogStore.dog.name}'s* `}</span> */}
                            <span className='text-system_light_primary text-sm'>{`Ideal Calorie`}</span>
                        </div>
                    </div>
                    <div>
                        <span className='text-system_primary text-lg font-bold'>{`${recipe ? recipe.calorie.toFixed(0) : 0} `}</span>
                        <span className='text-system_light_primary text-xs'>{`cal / day`}</span>
                    </div>

                </div>
                <Image
                    src={`/images/nutri-table-dog.svg`}
                    width={120}
                    height={120}
                    className="object-fit grow mb-[-28px] z-10"
                    // className={`object-fit grow mb-[-28px] z-10 transition-transform duration-1000 ease-out ${
                    //     isImageVisible ? 'translate-y-0' : 'translate-y-full'
                    // }`}
                    alt={"Cola"}
                />
                {/* <NutritionFactsTable nutritionFacts={nutritionFacts} /> */}
                <div className="w-full md:w-[364px] pt-12 pb-8 px-12 bg-gray_foreground rounded-xl border border-gray_divider">
                    <div className="space-y-4">
                        {/* {nutritionFacts.map((fact, index) => (
                    <ProgressBar key={index} name={fact.name} value={fact.value} max={fact.max} unit={fact.unit} />
                ))} */}
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>Highly digestible lean & fresh proteins</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>Vegetables that support digestion and gut health</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>Fruits packed with antioxidants for immune support</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>Healthy fats rich in Omega-3 for coat and joint health</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>Balanced calcium and phosphorus for bone support</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>No fillers, preservatives, or anything artificial</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>{`${dogStore.dog.gender == gender.female?'Her':'His'} personal batch made fresh just for ${dogStore.dog.gender == gender.female?'her':'him'}`}</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>{`Calorie and protein levels adjusted to keep ${dogStore.dog.gender == gender.female?'her':'him'} healthy`}</p>
                        </div>
                        <div className='flex items-center justify-start gap-4'>
                            <Image
                                src={`/images/selected.svg`}
                                width={20}
                                height={20}
                                className="object-fit w-[20px] h-[20px] "
                                alt={"Cola"}
                            />
                            <p className='text-xs font-normal text-label_secondary'>Vet-formulated precision in every meal</p>
                        </div>

                    </div>
                </div>
            </div>
        </ProcessLayout>
    );
});
export default Home;
