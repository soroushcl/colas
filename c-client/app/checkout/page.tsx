"use client"
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import SubscriptionCard from '@/components/cards/Subscription';
// import LargeInput from '@/components/inputs/largeInput/LargeInput';
import PromoInputWithButton from '@/components/inputs/largeInput/PromoInputWithButton';
import { useStores } from '@/stores/StoreContext';
import { observer } from 'mobx-react-lite';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import Benefit from '@/components/cards/Benefit';
import Review from '@/components/cards/Review';
import { useRouter } from 'next/navigation';
import CheckoutLayout from '@/components/layout/CheckoutLayout';

const CheckoutPage: React.FC = observer(() => {
    const { userStore } = useStores();
    const router = useRouter();
    const benefits = [
        {
            icon: "/images/benefit_1.png",
            m_icon: "/images/m_benefit_1.png",
            title: "Healthy Joints",
            subtitle: "Anti-inflammatory foods protect aging joints"
        },
        {
            icon: "/images/benefit_2.png",
            m_icon: "/images/m_benefit_2.png",
            title: "Stronger immunity",
            subtitle: "Real food supports immune development"
        },
        {
            icon: "/images/benefit_3.png",
            m_icon: "/images/m_benefit_3.png",
            title: "Optimal Weight",
            subtitle: "Portioned meals keep calories in check"
        },
        {
            icon: "/images/benefit_4.png",
            m_icon: "/images/m_benefit_4.png",
            title: "Better Digestion",
            subtitle: "Fresh fiber supports regular, healthy poops"
        },
        {
            icon: "/images/benefit_5.png",
            m_icon: "/images/m_benefit_5.png",
            title: "Healthy Coat",
            subtitle: "Omega-3s from real food boost skin & coat"
        },
        // {
        //     icon: "/images/bone.png",
        //     m_icon: "/images/m_benefit_5.png",
        //     title: "Better Digestion",
        //     subtitle: "Weight control Weight control Weight control Weight control"
        // }
    ]

    const reviews = [
        {
            title: '"SO MUCH IMPROVEMENT"',
            rating: 5,
            text:
                `Cola’s has helped tremendously with Charlie’s serious kidney disease. They have successfully helped to start bringing her number down and we're continuously working together to see more improvement!`,
            author: 'Ariel L | Charlie’s mom',
            avatarSrc: '/images/r_Ariel.png',
        },
        {
            title: '"HONESTLY FANTASTIC"',
            rating: 5,
            text:
                `My dog was ALWAYS such a picky eater. Now, months into switching to Cola's, he still licks the bowl clean. He's so healthy in every way, this food is honestly fantastic `,
            author: 'Kate D | Marvin’s mom',
            avatarSrc: '/images/r_Gail.png',
        },
        {
            title: '"TRANSPARENT & TRUSTWORTHY"',
            rating: 5,
            text:
                `I am a doctor in the GTA who had been looking to feed my dog with an autoimmune condition fresh food. Cola's kitchen has been amazing, transparent and trustworthy `,
            author: 'Nour N | Cirus & Yara’s mom',
            avatarSrc: '/images/r_Igor.png',
        },
        {
            title: `"CAN'T SAY ENOUGH GOOD THINGS"`,
            rating: 5,
            text:
                'I can’t believe a dog food company would take the time to look after my girl so well (and when we really needed it, too). I can’t say enough good things about Cola’s Kitchen.',
            author: 'Jayne H | Zayita’s mom',
            avatarSrc: '/images/r_Jayne.png',
        },
        {
            title: '"MUCH SOFTER COAT"',
            rating: 5,
            text:
                `Abby has been on Cola's Kitchen Fresh Dog Food for about 2 months now.  I've noticed that her coat is much softer and she is not scratching as she did in the past!`,
            author: 'Gail D | Abby’s mom',
            avatarSrc: '/images/r_Kate.png',
        },
        {
            title: '"A GAME CHANGER IN MY LIFE"',
            rating: 5,
            text:
                'Cola’s Kitchen turned out to be a game changer in my life. My pup is an extremely picky eater. No more food struggles for my boy.',
            author: 'Maulina S | Coco’s mom',
            avatarSrc: '/images/r_Maulina.png',
        },
        {
            title: '"CUSTOMER SERVICE SECOND TO NONE"',
            rating: 5,
            text:
                'Not only is their food fantastic, but the customer service we have received from Salma has been second to none. ',
            author: 'Igor B | Juniper’s dad',
            avatarSrc: '/images/r_Nour.png',
        },
        {
            title: '"THE BEST POSSIBLE"',
            rating: 5,
            text:
                `We love Cola's Kitchen! The food quality is amazing. Our frenchie Millie LOVES it and makes her feel like her best self. Thank you for providing our baby with the best possible!`,
            author: 'Sierra S | Millie’s mom',
            avatarSrc: '/images/r_Sierra.png',
        },
    ];

    // Reviews carousel state/refs
    const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
    const reviewsContainerRef = useRef<HTMLDivElement | null>(null);
    const reviewItemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const container = reviewsContainerRef.current;
        if (!container) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const containerCenter = containerRect.left + containerRect.width / 2;
                let closestIdx = 0;
                let closestDist = Number.POSITIVE_INFINITY;

                reviewItemRefs.current.forEach((el, idx) => {
                    if (!el) return;
                    const rect = el.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;
                    const dist = Math.abs(cardCenter - containerCenter);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestIdx = idx;
                    }
                });

                setCurrentReviewIdx(closestIdx);
                ticking = false;
            });
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll as unknown as EventListener);
    }, []);

    const scrollToReview = (idx: number) => {
        const container = reviewsContainerRef.current;
        const el = reviewItemRefs.current[idx];
        if (!container || !el) return;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const offset = (elRect.left + elRect.width / 2) - (containerRect.left + containerRect.width / 2);
        container.scrollBy({ left: offset, behavior: 'smooth' });
    };

    const toggleSubscription = (index: number) => {
        userStore.registeredDogs[index].subscription.isActive = !userStore.registeredDogs[index].subscription.isActive
    };

    const [promo, setPromo] = useState("");
    const [promoError, setPromoError] = useState<string | undefined>(undefined);
    const [appliedDiscount, setAppliedDiscount] = useState<number | undefined>(undefined);

    const applyPromo = async () => {
        console.log("applyPromo", promo)
        if (!promo.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const response = await fetch(`${baseUrl}/stripe/apply-promocode`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    promoCode: promo
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            const result = await response.json();

            if (result.discount !== undefined) {
                setPromoError(undefined);
                setAppliedDiscount(result.discount);
            } else if (result.err) {
                setPromoError(result.err);
                setAppliedDiscount(undefined);
            } else {
                setPromoError('Invalid promo code');
                setAppliedDiscount(undefined);
            }
        } catch (error) {
            console.error('Error applying promo code:', error);
            setPromoError('Failed to apply promo code');
            setAppliedDiscount(undefined);
        }
    }

    // Derived totals for the sticky footer
    const taxRate = 0.13;
    const activeSubscriptions = userStore.registeredDogs.filter((s) => s.subscription.isActive);
    const originalTotal = activeSubscriptions.reduce((sum, s) => sum + ((s.subscription.dailyPrice * 14) || 0), 0);
    const discountRateToUse = appliedDiscount ? appliedDiscount / 100 : 0; // Convert percentage to decimal
    const discountedTotal = originalTotal * (1 - discountRateToUse);
    const totalTax = discountedTotal * taxRate;
    const totalPrice = discountedTotal + totalTax;
    const totalPriceWithoutDiscount = originalTotal + (originalTotal * taxRate);

    useEffect(() => {
        userStore.totalPrice = parseFloat(totalPrice.toFixed(2))
        userStore.totalPriceWithoutDiscount = parseFloat(totalPriceWithoutDiscount.toFixed(2))
    }, [totalPrice, totalPriceWithoutDiscount, userStore]);

    const handleSubmit = async () => {
        // e.preventDefault();
        console.log("handleSubmit clicked")
        // const res = await userStore.loginUser()
        // if (res) {
        //     console.log(res)
        // }
        // const res = await userStore.createPayment()

        router.push('/payment');
    };

    return (
        <CheckoutLayout title={"Fantastic work!"} subTitle="All your pooches are registered.Let's head to checkout" handleSubmit={handleSubmit} disabled={!userStore.isLoginValid} mainButtonText={"Checkout"}>

            <div className="w-full px-0 py-8 pb-32 md:pb-0">
                <div className='gap-y-6 flex flex-col'>

                    {/* Subscription Cards List */}
                    <div className=" md:mb-16 flex flex-col md:flex-row justify-center gap-6 items-center overflow-x-scroll no-scrollbar">
                        {userStore.registeredDogs.map((registered, index) => (
                            index === 0 ? (
                                <div key={`subscription-first-${index}`} className='flex flex-col items-center'>
                                    {/* Table-dog image positioned outside the card */}
                                    <div className='hidden md:block -mb-[26px] z-20'>
                                        <Image src="/images/sub_dog.png" alt="Table Dog" width={147} height={147} className='object-contain w-[147px] h-[147px]' />
                                    </div>
                                    <SubscriptionCard
                                        key={`subscription-card-${index}`}
                                        title={`${registered.dog.name.toUpperCase()}'s BOX`}
                                        subtitle={`${!registered.subscription.discounts[0] ? "20% DISCOUNT APPLIED" : registered.subscription.discounts[0].discount + "% DISCOUNT APPLIED"}`}
                                        recipes={registered.subscription.selectedRecipes.toString()}
                                        plan={registered.subscription.type}
                                        meals={14}
                                        totalPrice={registered.subscription.dailyPrice * 14}
                                        discountRate={appliedDiscount || (!registered.subscription.discounts[0] ? 20 : registered.subscription.discounts[0].discount)}
                                        isActive={registered.subscription.isActive}
                                        onToggle={() => toggleSubscription(index)}
                                    />
                                </div>
                            ) : (
                                <div key={`subscription-${index}`} className='md:mt-[120px]'>
                                    <SubscriptionCard
                                        key={`subscription-card-${index}`}
                                        title={`${registered.dog.name.toUpperCase()}'s BOX`}
                                        subtitle={`${!registered.subscription.discounts[0] ? "20% DISCOUNT APPLIED" : registered.subscription.discounts[0].discount + "% DISCOUNT APPLIED"}`}
                                        recipes={registered.subscription.selectedRecipes.toString()}
                                        plan={registered.subscription.type}
                                        meals={registered.subscription.recurring}
                                        totalPrice={registered.subscription.dailyPrice * registered.subscription.recurring}
                                        discountRate={appliedDiscount || (!registered.subscription.discounts[0] ? 20 : registered.subscription.discounts[0].discount)}
                                        isActive={registered.subscription.isActive}
                                        onToggle={() => toggleSubscription(index)}
                                    />
                                </div>
                            )
                        ))}
                    </div>
                    {/* Hero Section */}
                    <div className="relative w-full max-w-[1200px] h-[600px] mx-auto px-96 mb-8 rounded-3xl border-8 border-[#B4C0AE] overflow-hidden hidden md:flex">
                        <Image
                            src="/images/Hero.jpg"
                            alt="Checkout Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Promo Code */}
                    <div className='md:invisible px-6'>
                        <PromoInputWithButton
                            className=''
                            type="text"
                            title="Promo Code"
                            error={promoError}
                            placeholder='type promo here'
                            value={promo}
                            setValue={setPromo}
                            onApply={
                                () => applyPromo()
                            }
                            onCancel={() => {
                                setPromo("");
                                setPromoError(undefined);
                            }}
                        />
                    </div>
                    <div className='md:pb-16 flex flex-col justify-center'>
                        <div className='md:bg-[url(/images/grass_tile.png)] bg-repeat h-16 -ml-32'></div>
                        <div className='md:bg-[url(/images/bg.png)]'>
                            {/* Expert */}
                            <div className='md:hidden flex flex-col gap-y-4 w-full text-white p-4 bg-[url(/images/bg.png)] outline-4 outline-offset-0 outline-dashed outline-system_primary'>
                                <h3 className='font-bold '>{'EXPERT AT HEARTH...'}</h3>
                                <p>{'Cola’s Kitchen’s dog food is expertly crafted by Dr. Farshad Goodarzi, a leading animal nutritionist with two PhDs and research experience at Freie Universität Berlin.'}</p>
                                <div className='flex justify-evenly'>
                                    <div className='bg-system_secondary bg-no-repeat border-black rounded-3xl w-24 h-24'>
                                        <Image
                                            src="/images/exp1.png"
                                            alt="Checkout Hero"
                                            width={64}
                                            height={64}
                                            className="relative -top-4 w-24 h-30 object-cover"
                                        />
                                    </div>
                                    <div className='bg-system_secondary border-black rounded-3xl w-24 h-24'>
                                        <Image
                                            src="/images/exp2.png"
                                            alt="Checkout Hero"
                                            width={64}
                                            height={73}
                                            className="relative -top-4 w-24 h-30 object-cover"
                                        />
                                    </div>
                                    <div className='border border-black bg-system_secondary bg-[url(/images/exp3)] border-black rounded-3xl w-24 h-24'>
                                        <Image
                                            src="/images/exp3.png"
                                            alt="Checkout Hero"
                                            width={94}
                                            height={128}
                                            className="relative -top-9 w-24 h-32 object-cover"
                                        />
                                    </div>
                                </div>
                                <p>{'Featured in over 30 prestigious journals, Dr. Goodarzi specializes in natural strategies to enhance animal nutrition, ensuring your dog gets the very best!'}</p>
                                <SecondaryButton text={'Any Question From Dr?'} secondaryText={'Click For FAQ'} st='green' />
                            </div>
                            {/* Benefits */}
                            <div className='flex flex-col gap-y-4 w-full py-4 mt-8 items-center '>
                                <div className='flex w-full items-center justify-center'>
                                    <div className='h-px bg-system_light_secondary grow md:hidden'></div>
                                    <div className='h-2 w-2 rounded-full bg-system_light_secondary md:hidden'></div>
                                    <h3 className='font-normal px-4 md:text-[#EAF2DA4D] text-xl md:text-4xl'>{'Our Benefits'}</h3>
                                    <div className='h-2 w-2 rounded-full bg-system_light_secondary md:hidden'></div>
                                    <div className='h-px bg-system_light_secondary grow md:hidden'></div>
                                </div>
                                <div className='w-full flex justify-evenly px-4 gap-x-4 md:gap-x-4 overflow-x-auto mx-8 md:mb-16'>
                                    {benefits.map((item, index) => (
                                        index === 3 ? (
                                            <div key={`benefit-first-${index}`} className='flex flex-col items-center'>
                                                {/* Table-dog image positioned outside the card */}
                                                <div className='hidden md:block -mb-[28px]'>
                                                    <Image src="/images/table-dog.svg" alt="Table Dog" width={80} height={80} className='object-contain w-[120px] h-[120px]' />
                                                </div>
                                                <Benefit
                                                    key={`benefit-card-${index}`}
                                                    {...item}
                                                    index={index}
                                                />
                                            </div>
                                        ) : (
                                            <div key={`benefit-${index}`} className='md:mt-[92px]'>
                                                <Benefit
                                                    key={`benefit-card-${index}`}
                                                    {...item}
                                                    index={index}
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                            {/* Expert */}
                            <div className='hidden md:flex flex-col items-center justify-center mx-auto w-[830px] h-[830px] text-center justify-evenly gap-y-8 rounded-full border-2 border-[#55715C80] p-16'>
                                <Image
                                    src="/images/circle.png"
                                    alt="Checkout Hero"
                                    width={880}
                                    height={880}
                                    className="absolute w-[880px] h-[880px] object-cover"
                                />
                                <Image
                                    src="/images/circle.png"
                                    alt="Checkout Hero"
                                    width={780}
                                    height={780}
                                    className="absolute w-[780px] h-[780px] object-cover"
                                />
                                <h3 className='font-normal px-4 md:text-system_light_accent text-xl md:text-4xl'>{'EXPERT AT HEARTH...'}</h3>
                                <p className='w-[575px] text-xl md:text-white'>{'Cola’s Kitchen’s dog food is expertly crafted by Dr. Farshad Goodarzi, a leading animal nutritionist with two PhDs and experience at Freie Universität Berlin.'}</p>
                                <div className='flex gap-x-4 justify-center'>
                                    <div className='w-32 h-32'>
                                        <Image
                                            src="/images/mexp1.png"
                                            alt="Checkout Hero"
                                            width={128}
                                            height={128}
                                            className="w-[128px] h[128px] object-cover"
                                        />
                                    </div>
                                    <div className='w-32 h-32'>
                                        <Image
                                            src="/images/mexp2.png"
                                            alt="Checkout Hero"
                                            width={256}
                                            height={256}
                                            className="relative -top-8 w-[256px] h[256px] object-cover"
                                        />
                                    </div>
                                    <div className='w-32 h-32'>
                                        <Image
                                            src="/images/mexp3.png"
                                            alt="Checkout Hero"
                                            width={128}
                                            height={128}
                                            className="w-[128px] h[128px] object-cover"
                                        />
                                    </div>
                                </div>
                                <p className='w-[656px] text-xl md:text-white'>{'Featured in over 30 prestigious journals, Dr. Goodarzi specializes in natural strategies to enhance animal nutrition, ensuring your dog gets the very best!'}</p>
                                <div className='w-full px-16'>
                                    <SecondaryButton text={'Any Question From Dr?'} secondaryText={'Click For FAQ'} st='green' />
                                </div>
                            </div>



                            {/* Reviews */}
                            <div className='flex flex-col gap-y-4 w-full p-4 items-center'>
                                <div className='flex w-full items-center justify-center'>
                                    <Image
                                        src="/images/reviews.png"
                                        alt="Checkout Hero"
                                        width={64}
                                        height={64}
                                        className="object-cover md:hidden"
                                    />
                                    <h3 className='font-normal px-2 md:text-[#EAF2DA4D] text-xl md:text-4xl'>{'Pawsome Reviews'}</h3>
                                    <Image
                                        src="/images/reviews.png"
                                        alt="Checkout Hero"
                                        width={64}
                                        height={64}
                                        className="object-cover rotate-180 md:hidden"
                                    />
                                </div>
                                <div ref={reviewsContainerRef} className='w-full flex gap-x-6 overflow-x-auto py-2 scroll-smooth no-scrollbar justify-center'>
                                    {reviews.map((item, index) => (
                                        <div
                                            key={`review-${index}-${item.title}`}
                                            ref={(el) => { reviewItemRefs.current[index] = el; }}
                                            onClick={() => { setCurrentReviewIdx(index); scrollToReview(index); }}
                                            className='cursor-pointer'
                                        >
                                            <Review {...item} selected={index === currentReviewIdx} />
                                        </div>
                                    ))}
                                </div>
                                <div className='flex items-center gap-2 bg-blue-100 rounded-full py-1 px-2 md:hidden'>
                                    {reviews.map((r, idx) => (
                                        <button
                                            key={`review-dot-${idx}-${r.title}`}
                                            onClick={() => scrollToReview(idx)}
                                            className={`w-2 h-2 rounded-full transition-opacity ${idx === currentReviewIdx ? 'bg-system_secondary opacity-100' : 'bg-white opacity-60'}`}
                                            aria-label={`Go to review ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Transparency section */}
                            <div className='w-full rounded-2xl md:bg-transparent py-10 px-6 flex flex-col items-center text-center gap-4'>
                                <h3 className='font-normal px-4 md:text-[#EAF2DA4D] text-xl md:text-4xl text-system_dark_primary'>Transparent to the bone...</h3>
                                <p className='max-w-3xl text-sm md:text-2xl text-label_secondary md:text-white'>
                                    Cola’s recipes is formulated to meet or exceed the nutritional requirements and guidelines established
                                </p>
                                <p className='max-w-3xl text-sm md:text-2xl text-label_secondary font-medium md:text-white'>
                                    by AAFCO, FEDIAF, NRC & WSAVA
                                </p>
                                <div className='mt-2 flex items-center justify-center gap-8'>
                                    <Image src='/images/fediaf_logo.png' alt='Certification logo' width={64} height={64} className='md:hidden' />
                                    <Image src='/images/fediaf_logo@2x.png' alt='Certification logo' width={64} height={64} className='hidden md:block' />
                                    <Image src='/images/fediaf_logo.png' alt='Certification logo' width={64} height={64} className='md:hidden' />
                                    <Image src='/images/fediaf_logo@2x.png' alt='Certification logo' width={64} height={64} className='hidden md:block' />
                                    <Image src='/images/fediaf_logo.png' alt='Certification logo' width={64} height={64} className='md:hidden' />
                                    <Image src='/images/fediaf_logo@2x.png' alt='Certification logo' width={64} height={64} className='hidden md:block' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {activeSubscriptions.length > 0 && (
                    <div className="w-full fixed bottom-0 left-0 right-0 z-30">
                        <div className="mx-auto">
                            <div className="bg-white md:bg-[#597560] text-white rounded-t-2xl md:rounded-none shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
                                <div className="flex flex-col md:items-center md:justify-between gap-2">
                                    <div className='flex items-center h-24'>
                                        <div className="w-full flex items-center gap-1 ps-4">
                                            <div className='w-[78px] h-[78px] md:w-[88px] md:h-[88px]'>
                                                <Image src='/images/payment.png' alt='Certification logo' width={88} height={88} className='object-fit' />
                                            </div>
                                            <div className="flex-1 felx flex-col text-sm opacity-90 flex items-center gap-2 p-4">
                                                <div className='w-full flex justify-between items-center gap-2'>
                                                    <span className='text-label_tertiary md:text-gray_placeholder'>Price with {discountRateToUse * 100}% discount:</span>
                                                    <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                                    <span className='text-label_secondary md:text-system_accent'>{discountedTotal.toFixed(2)}$</span>
                                                </div>
                                                <div className='w-full flex justify-between items-center gap-2'>
                                                    <span className='text-label_tertiary md:text-gray_placeholder'>Tax:</span>
                                                    <div className='h-px border-t border-dotted border-gray_divider grow'></div>
                                                    <span className='text-label_secondary md:text-system_accent'>{totalTax.toFixed(2)}$</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='hidden md:flex md:pt-8'>
                                            <PromoInputWithButton
                                                className='w-full mx-auto'
                                                type="text"
                                                error={promoError}
                                                placeholder='Promo Code'
                                                value={promo}
                                                setValue={setPromo}
                                                st="green"
                                                onApply={() => applyPromo()
                                                }
                                                onCancel={() => {
                                                    setPromo("");
                                                    setPromoError(undefined);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 justify-center bg-system_primary p-2 md:rounded-2xl md:mb-8 md:w-[596px] md:h-[56px] inset-shadow-sm shadow-2xl md:shadow-sm md:inset-shadow-sm md:ring-1 md:ring-system_primary h-14 text-visual_light_amber " onClick={() => handleSubmit()}>
                                        <span className="text-xl font-bold">Total Price:</span>
                                        <span className="text-lg line-through">{totalPriceWithoutDiscount.toFixed(2)}$</span>
                                        <span className="text-xl font-bold">{totalPrice.toFixed(2)}$</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CheckoutLayout>
    );
});

export default CheckoutPage; 