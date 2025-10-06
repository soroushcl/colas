"use client";

import { observer } from "mobx-react-lite";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStores } from "@/stores/StoreContext";
import LargeInput from "@/components/inputs/largeInput/LargeInput";

interface PageProps {
    params: Promise<{ forgotPasswordId: string }>;
}

const Home: React.FC<PageProps> = observer(({ params }) => {
    const [resolvedParams, setResolvedParams] = useState<{ forgotPasswordId: string } | null>(null);
    const router = useRouter();
    const { userStore } = useStores();
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        params.then((p) => setResolvedParams(p)); // Resolve params promise
    }, [params]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!resolvedParams) return;

        const res = await userStore.resetPassword(resolvedParams.forgotPasswordId);
        if (res) {
            router.push("/");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/");
        } else {
            setIsAuthenticated(false);
        }
    }, [router]);

    if (isAuthenticated || !resolvedParams) {
        return <p>Redirecting to home...</p>;
    }

    return (
        <ProcessLayout
            title="New password"
            handleSubmit={handleSubmit}
            disabled={false}
            mainButtonText="Submit"
        >
            <LargeInput
                error={userStore.emailError}
                type="password"
                placeholder="New password"
                value={userStore.user.password}
                onChange={(e) => { userStore.user.password = e.target.value }}
            />
            <LargeInput
                error={userStore.forgotData.repassword ? "" : ""}
                type="password"
                placeholder="Repeat your new password"
                value={userStore.forgotData.repassword}
                onChange={(e) => { userStore.forgotData.repassword = e.target.value }}
            />
        </ProcessLayout>
    );
});

export default Home;
