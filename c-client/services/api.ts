"use client";
import {
    AuthenticatedUser,
    Dog,
    Subscription,
    ForgotPasswordUser,
    User,
    forgotPasswordRequestBody,
    forgotPasswordResponseBody,
    googleLoginRequestBody,
    googleLoginResponseBody,
    googleRegRequestBody,
    googleRegResponseBody,
    loginRequestBody,
    loginResponseBody,
    logoutRequestBody,
    logoutResponseBody,
    registerDogRequestBody,
    registerDogResponseBody,
    createSubscriptionRequestBody,
    createSubscriptionResponseBody,
    registerRequestBody,
    registerResponseBody,
    resetPasswordRequestBody,
    resetPasswordResponseBody,
    setPasswordRequestBody,
    setPasswordResponseBody,
    tokenAuthorizeRequestBody,
    tokenAuthorizeResponseBody,
    updateUserRequestBody,
    updateUserResponseBody,
    getBreedsRequestBody,
    getBreedsResponseBody,
    paymentIntentResponseBody,
    paymentIntentRequestBody,
    subscriptionType,
    editDogRecipesResponseBody,
    editDogRecipesRequestBody,
    EditDog,
    editDogResponseBody,
    editDogRequestBody,
    subscriptionInfo,
    protein,
    Address,
    editShippingResponseBody,
    editShippingRequestBody,
    changeCardResponseBody,
    changeCardRequestBody,
} from 'c-lib';

if (typeof window === "undefined") {
    // @ts-ignore
    global.fetch = fetch; // you can use fetch() anywhere in Node (really useful for server side rendering)
}

type fetch = typeof fetch;

export default class FetchApi {
    private token: string | null = null;

    constructor(
        private fetch: fetch = global.fetch.bind(global),
        public baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    ) {
        let token: string | null = null;
        if (typeof window !== "undefined") {
            token = window.localStorage.getItem("token");
        }
        if (token) this.token = token;
    }

    request = async <T, U>(
        url: string,
        config: RequestInit | { body: U },
        contentType: string = "application/json"
    ): Promise<T> => {
        const token = this.token;

        const res = await this.fetch(url, {
            ...config,
            body: JSON.stringify(config.body),
            headers: {
                "Content-type": contentType,
                Authentication: `Bearer ${token}`,
            },
        });

        console.log("request res", res)
        if (!res.ok) {
            const json = await res.json();
            throw ((json)?.error);
        }

        return <T>await res.json();
    };

    multiPartRequest = async <T, U>(url: string, config: RequestInit | { body: FormData }): Promise<T> => {
        const token = this.token;
        const res = await this.fetch(url, {
            ...config,
            body: config.body,
            headers: {
                Authentication: `Bearer ${token}`,
                // "Access-Control-Allow-Origin": 'true',
                // "Access-Control-Allow-Credentials": 'true',
            },
        });

        if (!res.ok) {
            throw (await res.json())?.error?.message;
        }

        return <T>await res.json();
    };

    // Authentication

    login = async (email: User["email"], password: User["password"], rememberMe: boolean): Promise<loginResponseBody> => {
        console.log("login called", process.env.NEXT_PUBLIC_API_URL)
        const res = await this.request<loginResponseBody, loginRequestBody>(`${this.baseUrl}/authentication/login`, {
            method: "POST",
            credentials: "include",
            body: {
                email,
                password,
                rememberMe,
            },
        });
        console.log("login res", res)
        return res
        // if (!res.success) {
        //     throw res.error;
        // }

        // const { payload } = res;
        // this.token = payload.token;
        // if (typeof window !== "undefined") window.localStorage.setItem("token", payload.token);
        // return payload.user;
    };

    // Google Login
    googleLogin = async (code: string): Promise<googleLoginResponseBody> => {

        const res = await this.request<googleLoginResponseBody, googleLoginRequestBody>(`${this.baseUrl}/authentication/google-login`, {
            method: "POST",
            body: {
                code,
            },
        });

        console.log("login res", res)
        return res
    };

    // Register
    register = async (email: User["email"], firstName: User["firstName"]): Promise<registerResponseBody> => {
        console.log("register called")
        const res = await this.request<registerResponseBody, registerRequestBody>(`${this.baseUrl}/authentication/register`, {
            method: "POST",
            credentials: "include",
            body: {
                email,
                firstName,
            },
        });
        console.log("register res", res)
        return res
    };

    createPaymentIntent = async (amount: number, currency: string): Promise<paymentIntentResponseBody> => {
        console.log("createPaymentIntent called")
        const res = await this.request<paymentIntentResponseBody, paymentIntentRequestBody>(`${this.baseUrl}/stripe/createPaymentIntent`, {
            method: "POST",
            credentials: "include",
            body: {
                amount,
                currency,
            },
        });
        console.log("createPaymentIntent res", res)
        return res
    };

    // Register Dog
    registerDog = async (dog: Dog): Promise<registerDogResponseBody> => {
        console.log("register called")
        const res = await this.request<registerDogResponseBody, registerDogRequestBody>(`${this.baseUrl}/authentication/register-dog`, {
            method: "POST",
            credentials: "include",
            body: {
                dog
            },
        });
        console.log("register res", res)
        return res
    };

    // createDogSubscription
    createSubscription = async (subscription: Subscription): Promise<createSubscriptionResponseBody> => {
        console.log("createSubscription authentication   called", subscription)
        const res = await this.request<createSubscriptionResponseBody, createSubscriptionRequestBody>(`${this.baseUrl}/authentication/subscription/create`, {
            method: "POST",
            credentials: "include",
            body: { subscription },
        });
        console.log("createDogSubscription res", res)
        return res
    }
    // UpdateCustomer
    updateUser = async (user: User): Promise<updateUserResponseBody> => {
        console.log("register called")
        const res = await this.request<updateUserResponseBody, updateUserRequestBody>(`${this.baseUrl}/authentication/update-user`, {
            method: "POST",
            credentials: "include",
            body: {
                updatedUser: user
            },
        });
        console.log("UpdateCustomer res", res)
        return res
    };

    // Google Register
    googleReg = async (code: string): Promise<string> => {

        const res = await this.request<googleRegResponseBody, googleRegRequestBody>(`${this.baseUrl}/authentication/google-reg`, {
            method: "POST",
            body: {
                code,
            },
        });

        if (!res.success) {
            throw res.error;
        }

        const { payload } = res;
        return payload.email;
    };

    authorizeUser = async (): Promise<AuthenticatedUser> => {
        if (!this.token) {
            throw "No token found";
        }
        const res = await this.request<tokenAuthorizeResponseBody, tokenAuthorizeRequestBody>(
            `${this.baseUrl}/authentication/token-authorize`,
            {
                method: "POST",
                body: {
                    token: this.token,
                },
            }
        );

        if (!res.success) {
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("token");
            }
            throw res.error;
        }

        const { payload } = res;
        // window.localStorage.setItem('token', payload.token);
        return payload;
    };

    logout = async () => {
        console.log("logout called")
        const res = await this.request<logoutResponseBody, logoutRequestBody>(`${this.baseUrl}/authentication/logout`, {
            method: "POST",
        });

        if (!res.success) {
            console.log("logout throw")
            throw res.error;
        }

        if (typeof window !== "undefined") {
            window.localStorage.removeItem("token");
        }
        const { payload } = res;
        return payload;
    };

    sendPasswordResetEmail = async (email: User["email"]) => {
        const res = await this.request<forgotPasswordResponseBody, forgotPasswordRequestBody>(
            `${this.baseUrl}/authentication/forgot-password/`,
            {
                method: "POST",
                body: {
                    email,
                },
            }
        );

        if (!res.success) {
            throw res.error;
        }

        const { payload } = res;
        return payload;
    };

    resetPasswordRequest = async (password: string, repassword: string, forgotPasswordId: ForgotPasswordUser["id"]) => {
        const res = await this.request<resetPasswordResponseBody, resetPasswordRequestBody>(
            `${this.baseUrl}/authentication/reset-password/`,
            {
                method: "POST",
                body: {
                    password,
                    repassword,
                    forgotPasswordId,
                },
            }
        );

        if (!res.success) {
            throw res.error;
        }

        const { payload } = res;
        this.token = payload.token;
        if (typeof window !== "undefined") window.localStorage.setItem("token", payload.token);
        return payload.user;
    };

    setPasswordRequest = async (userId: User["id"], password: string, repassword: string) => {
        const res = await this.request<setPasswordResponseBody, setPasswordRequestBody>(
            `${this.baseUrl}/authentication/set-password/`,
            {
                method: "POST",
                body: {
                    userId,
                    password,
                    repassword,
                },
            }
        );

        if (!res.success) {
            throw res.error;
        }

        const { payload } = res;
        return payload;
    };

    // Get Breeds
    getBreeds = async (): Promise<getBreedsResponseBody> => {
        console.log("getBreeds called");
        const res = await this.fetch(`${this.baseUrl}/api/breeds`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json",
                Authentication: `Bearer ${this.token}`,
            },
        });

        console.log("getBreeds res", res);

        if (!res.ok) {
            const json = await res.json();
            throw ((json)?.error);
        }

        return await res.json() as getBreedsResponseBody;
    };

    // Update Dog Recurring
    updateDogRecurring = async (dogId: string, sub: { selectedRecipes: (number | string)[], recurring: number, sub: { recipeId: string | number, amount: number }[] }): Promise<{ status: string; price?: string; err?: string }> => {
        console.log("updateDogRecurring called", dogId, sub);
        const res = await this.request<{ status: string; price?: string; err?: string }, { dogId: string; sub: any }>(`${this.baseUrl}/authentication/update-dog-recurring`, {
            method: "POST",
            credentials: "include",
            body: {
                dogId,
                sub
            },
        });
        console.log("updateDogRecurring res", res);
        return res;
    };

    // Update-dog-subscription-foodType
    updateDogSubscriptionFoodType = async (dogId: string, type: subscriptionType): Promise<{ status: string; err?: string }> => {
        console.log("updateDogSubscriptionFoodType called", dogId, type);
        const res = await this.request<{ status: string; price?: string; err?: string }, { dogId: string; type: subscriptionType }>(`${this.baseUrl}/authentication/update-dog-subscription-foodType`, {
            method: "POST",
            credentials: "include",
            body: {
                dogId,
                type
            },
        });
        console.log("updateDogSubscriptionFoodType res", res);
        return res;
    };

    reactivateSubscription = async (subscriptionId: string, until: number): Promise<{ status: string; err?: string }> => {
        console.log("reactivateSubscription called", subscriptionId, until);
        const res = await this.request<{ status: string; price?: string; err?: string }, { subscriptionId: string; until: number }>(`${this.baseUrl}/authentication/reactivate-subscription`, {
            method: "POST",
            credentials: "include",
            body: {
                subscriptionId,
                until
            },
        });
        console.log("reactivateSubscription res", res);
        return res;
    };

    editPoochRecipes = async (newDog: Dog): Promise<editDogRecipesResponseBody> => {
        console.log("login called", newDog)
        const res = await this.request<editDogRecipesResponseBody, editDogRecipesRequestBody>(`${this.baseUrl}/authentication/edit-pooch-recipes`, {
            method: "POST",
            credentials: "include",
            body: {
                newDog
            },
        });
        console.log("edit-pooch-recipes res", res)
        return res
    };

    editDog = async (newDogId: EditDog['id'], subscription: { protein: protein, amount: number }[]): Promise<editDogResponseBody> => {
        console.log("editDog called", newDogId, subscription)
        const res = await this.request<editDogResponseBody, editDogRequestBody>(`${this.baseUrl}/authentication/edit-dog`, {
            method: "POST",
            credentials: "include",
            body: {
                newDogId,
                subscription
            },
        });
        console.log("edit-pooch-recipes res", res)
        return res
    };

    changeShippingAddress = async (shippingAddress: Address): Promise<editDogResponseBody> => {
        console.log("editDog called", shippingAddress)
        const res = await this.request<editShippingResponseBody, editShippingRequestBody>(`${this.baseUrl}/authentication/change-shipping-address`, {
            method: "POST",
            credentials: "include",
            body: {
                shippingAddress,
            },
        });
        console.log("edit-pooch-recipes res", res)
        return res
    };

    changeBillingAddress = async (shippingAddress: Address): Promise<editDogResponseBody> => {
        console.log("editDog called", shippingAddress)
        const res = await this.request<editShippingResponseBody, editShippingRequestBody>(`${this.baseUrl}/authentication/change-billing-address`, {
            method: "POST",
            credentials: "include",
            body: {
                shippingAddress,
            },
        });
        console.log("edit-pooch-recipes res", res)
        return res
    };

    changeCard = async (paymentMethodId: string): Promise<changeCardResponseBody> => {
        console.log("changeCard called", paymentMethodId)
        const res = await this.request<changeCardResponseBody, changeCardRequestBody>(`${this.baseUrl}/authentication/change-card`, {
            method: "POST",
            credentials: "include",
            body: {
                paymentMethodId,
            },
        });
        console.log("edit-pooch-recipes res", res)
        return res
    };

    updateDogSubscription = async (dogId: string, sub: { selectedRecipes: (number | string)[], sub: { recipeId: string | number, amount: number }[] }): Promise<{ status: string; price?: string; err?: string }> => {
        console.log("updateDogSubscription called", dogId, sub);
        const res = await this.request<{ status: string; price?: string; err?: string }, { dogId: string; sub: any }>(`${this.baseUrl}/authentication/update-dog-subscription`, {
            method: "POST",
            credentials: "include",
            body: {
                dogId,
                sub
            },
        });
        console.log("updateDogSubscription res", res);
        return res;
    };

}
