"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InfoTable from "../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { useStores } from "@/stores/StoreContext";

export default function BillingPage() {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  console.log("billing page", userStore.card)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <ProcessLayout title={""} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment img="billing_dog.png">
      <div className="w-full px-4 py-6 space-y-6">
        <h1 className="text-center text-lg font-semibold text-label_primary">Billing & shipping</h1>

        <InfoTable
          rows={[
            { label: "Name", value: userStore.user.name, type: "text" },
            { label: "Billing Address", value: userStore.billingAddress.line1, type: "text" },
            { label: "Shipping Address", value: userStore.billingAddress.line1, type: "text" },
            { label: "Credit Card", value: "xxxx-xxxx-xxxx-" + (userStore.card ? userStore.card : ""), type: "text" },
          ]}
        />
      </div>
    </ProcessLayout>
  );
}


