"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

type Props = {
    children: React.ReactNode;
    amount?: number;
    currency?: string;
};

const fetchClientSecret = async (amount?: number, currency?: string) => {
    const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
    });
    if (!response.ok) {
        throw new Error('Failed to initialize payment');
    }
    return (await response.json()).clientSecret as string;
};

const getStripePromise = (() => {
    let stripePromise: Promise<Stripe | null> | null = null;
    let cachedKey: string | null = null;
    return (publishableKey: string) => {
        if (!stripePromise || cachedKey !== publishableKey) {
            cachedKey = publishableKey;
            stripePromise = loadStripe(publishableKey);
        }
        return stripePromise;
    };
})();

export default function StripeProvider({ children, amount, currency }: Props) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClientSecret(parseInt((amount! * 100).toString()), currency)
            .then(setClientSecret)
            .catch((e) => setError(e.message || 'Failed to init payment'));
    }, [amount, currency]);

    const options: StripeElementsOptions = useMemo(
        () => ({
            ...(clientSecret ? { clientSecret } : {}),
            appearance: { theme: 'stripe' },
        }),
        [clientSecret]
    );

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

    if (!publishableKey) {
        return (
            <div className="text-red-600 text-sm">Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</div>
        );
    }

    if (error) {
        return <div className="text-red-600 text-sm">{error}</div>;
    }
    if (!clientSecret) {
        return <div className="text-sm text-gray-500">Loading payment...</div>;
    }

    return (
        <Elements stripe={getStripePromise(publishableKey)} options={options}>
            {children}
        </Elements>
    );
}


