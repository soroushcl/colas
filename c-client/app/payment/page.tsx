"use client"
import React from 'react';
// import Image from 'next/image';
import ProcessLayout from '@/components/layout/ProcessLayout';
import LargeInput from '@/components/inputs/largeInput/LargeInput';
import SearchableSelect from '@/components/inputs/serchableSelectInput/SerchableSelectInput';
import { useStores } from '@/stores/StoreContext';
import StripeProvider from '@/providers/StripeProvider';
import { ExpressCheckoutElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

const ExpressCheckoutBox: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();

    return (
        <ExpressCheckoutElement
            options={{
                buttonHeight: 40,
                wallets: {
                    applePay: 'auto',
                    googlePay: 'auto'
                }
            }}
            onConfirm={async () => {
                if (!stripe || !elements) {
                    return { error: { message: 'Stripe not initialized' } } as unknown as void;
                }
                const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: typeof window !== 'undefined' ? window.location.href : undefined,
                    },
                    redirect: 'if_required',
                });
                if (error) {
                    return undefined;
                }
                return undefined;
            }}
        />
    );
};

const PaymentContent: React.FC = () => {
    const { userStore } = useStores();
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const options = [
        "alberta",
        "british columbia",
        "manitoba",
        "new brunswick",
        "newfoundland and labrador",
        "nova scotia",
        "ontario",
        "prince edward island",
        "quebec",
        "saskatchewan",
        "northwest territories",
        "nunavut",
        "yukon",
    ];

    const subscribe = async () => {
        try {
            if (!stripe || !elements) {
                console.error('Stripe not initialized');
                return;
            }

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: typeof window !== 'undefined' ? window.location.href : undefined,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error(error.message);
                const errEl = document.getElementById('card-element-errors');
                if (errEl) errEl.textContent = error.message || 'Payment confirmation failed';
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Create order + subscription on server
                const res = await fetch('/api/post-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        email: userStore.user.email,
                        user: {
                            id: userStore.user.id,
                            name: userStore.user.name,
                            firstName: userStore.user.firstName,
                            lastName: userStore.user.lastName,
                            email: userStore.user.email,
                            phoneNumber: userStore.user.phoneNumber,
                        },
                        registeredDogs: userStore.registeredDogs,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    console.error('Post-payment failed', data.error || res.statusText);
                    const errEl = document.getElementById('card-element-errors');
                    if (errEl) errEl.textContent = data.error || 'Failed to finalize subscription';
                    return;
                }

                await res.json();
                // If token was set by API route, it's in localStorage; if not, stay graceful
                router.push('/register/password');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ProcessLayout title={''} handleSubmit={subscribe} disabled={false} isPayment>

                {/* Express Checkout */}
                <section className="mt-4 px-4 w-full">
                    <h2 className="text-xl text-system_dark_primary font-semibold tracking-wide mb-2">EXPRESS CHECKOUT:</h2>
                    <div className=""><ExpressCheckoutBox /></div>
                    <div className='sr-field-error din-next-lt-pro' id='express-checkout-errors' role='alert'></div>
                    <div className='flex flex-row items-center justify-center my-8'>
                        <div className='h-px bg-system_light_secondary grow'></div>
                        <p className="text-center text-[12px] text-gray-400 px-4">Or pay with card</p>
                        <div className='h-px bg-system_light_secondary grow'></div>
                    </div>
                </section>

                {/* Shipping Information */}
                <section className="mt-4 px-4 w-full">
                    <h3 className="text-xl text-system_dark_primary font-semibold tracking-wide mb-2">SHIPPING INFORMATION:</h3>
                    <div className="flex flex-col items-center space-y-3">
                        <LargeInput className="w-full h-10 rounded-md px-3 bg-white border border-gray-200 text-sm" placeholder="Street Address" isBig />
                        <LargeInput className="w-full h-10 rounded-md px-3 bg-white border border-gray-200 text-sm" placeholder="Line 2, Unit #" isBig />
                        <div className="w-full flex justify-between gap-2">
                            <LargeInput className="" placeholder="City" isSmall />
                            <SearchableSelect
                                id={"province"}
                                isBig
                                options={options}
                                selected={userStore.user.state}
                                placeholder="Province"
                                onSelect={(value) => {
                                    // setSelectedOption(value);
                                    userStore.user.state = value
                                    console.log("Selected:", value);
                                }}
                            />
                        </div>
                        <LargeInput className="w-full h-10 rounded-md px-3 bg-white border border-gray-200 text-sm" placeholder="Postal Code" isBig />
                    </div>
                </section>

                {/* Payment Method */}
                <section className="mt-5 px-4 w-full">
                    <h3 className="text-xl text-system_dark_primary font-semibold tracking-wide mb-2">PAYMENT METHOD:</h3>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-full ">
                                <PaymentElement options={{ layout: 'tabs' }} />
                            </div>
                            <div className='sr-field-error din-next-lt-pro' id='card-element-errors' role='alert'></div>
                        </div>
                    </div>
                </section>

                {/* Blue Plan Details */}
                <section className="my-16">
                    <div className="bg-[#6971BF] bg-[url(/images/pattern.png)] outline-4 outline-offset-0 outline-dashed outline-[#6971BF] text-white p-4 space-y-4">
                        <div>
                            <h4 className="font-normal text-lg tracking-wide">YOUR PLAN:</h4>
                            <p className="text-base text-gray_white font-medium mt-1">Full daily meals for Rocky, individually formulated at a total of $158.27 per week.</p>
                        </div>
                        <div>
                            <h4 className="font-normal text-lg tracking-wide">FIRST BOX:</h4>
                            <p className="text-base text-gray_white font-medium mt-1">Rocky will receive a 2-week starter box with 16 days worth of food. The delivery is set for the week of Aug 30, 2024.</p>
                        </div>
                        <div>
                            <h4 className="font-normal text-lg tracking-wide">AFTER THE FIRST BOX:</h4>
                            <p className="text-base text-gray_white font-medium mt-1">Your selected plan will be billed and shipped every 4 weeks for Rocky.</p>
                        </div>
                        <div>
                            <h4 className="font-normal text-lg tracking-wide">RECURRING ORDER:</h4>
                            <p className="text-base text-gray_white font-medium mt-1">After the trial Rocky will receive 28 meals shipped every 4 weeks for 205 per week. No commitment needed. Pause or cancel anytime.</p>
                            <p className="text-base text-gray_white font-medium mt-1">By starting the trial you agree to our Terms of Use.</p>
                        </div>
                    </div>
                </section>

                {/* Sticky purchase bar */}
                <div className="fixed bottom-0 left-0 right-0 z-30 md:relative md:w-full cursor-pointer" onClick={subscribe}>
                    <div className="md:px-4">
                        <div className="bg-system_primary shadow-[0_-4px_12px_rgba(0,0,0,0.1)] md:rounded-2xl">
                            <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-white">
                                <span className="">Purchase:</span>
                                <div className="flex items-center gap-2">
                                    <span className="line-through">{userStore.totalPriceWithoutDiscount}</span>
                                    <span className="font-bold">{userStore.totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProcessLayout>
    );
};

const PaymentPage: React.FC = () => {
    const { userStore } = useStores();
    return (
        <StripeProvider amount={userStore.totalPrice} currency='cad'>
            <PaymentContent />
        </StripeProvider>
    );
};

export default PaymentPage;


