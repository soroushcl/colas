import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    // Note: we intentionally don't throw at import-time in Next.js route handlers
    // to avoid build-time failures; we will validate per-request instead.
}

export async function POST(request: Request) {
    try {
        if (!stripeSecretKey) {
            return NextResponse.json(
                { error: 'Missing STRIPE_SECRET_KEY server environment variable.' },
                { status: 500 }
            );
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-08-27.basil',
        });

        const body = await request.json().catch(() => ({}));
        const amount: number = typeof body.amount === 'number' ? body.amount : 20416; // in smallest currency unit
        const currency: string = typeof body.currency === 'string' ? body.currency : 'cad';

        if (amount === 0) {
            const setupIntent = await stripe.setupIntents.create({
                automatic_payment_methods: { enabled: true },
            });
            return NextResponse.json({ clientSecret: setupIntent.client_secret });
        } else {

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                automatic_payment_methods: { enabled: true },
                setup_future_usage: 'off_session',
            });
            return NextResponse.json({ clientSecret: paymentIntent.client_secret });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create PaymentIntent';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}


