"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InfoTable from "../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { useStores } from "@/stores/StoreContext";
import DogPopup from "@/components/popups/DogPopup";
import LargeInput from "@/components/inputs/largeInput/LargeInput";

export default function BillingPage() {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBillingPopupOpen, setIsBillingPopupOpen] = useState(false);
  const [isShippingPopupOpen, setIsShippingPopupOpen] = useState(false);
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
        <DogPopup
          title="Billing Address"
          content={
            <div>
              <LargeInput placeholder="Line 1" value={userStore.billingAddress.line1}></LargeInput>
              <LargeInput placeholder="Line 2" value={userStore.billingAddress.line2}></LargeInput>
              <LargeInput placeholder="City" value={userStore.billingAddress.city}></LargeInput>
              <div className="flex gap-2">
                <LargeInput placeholder="Postal Code" isSmall value={userStore.billingAddress.postalCode}></LargeInput>
                <LargeInput placeholder="Province" isSmall value={userStore.billingAddress.state}></LargeInput>
              </div>
            </div>
          }
          onClose={() => setIsBillingPopupOpen(false)}
          onSubmit={() => setIsBillingPopupOpen(false)}
          isOpen={isBillingPopupOpen}
        />
        <DogPopup
          title="Shipping Address"
          content={
            <div>
              <LargeInput placeholder="Line 1" value={userStore.shippingAddress.line1}></LargeInput>
              <LargeInput placeholder="Line 2" value={userStore.shippingAddress.line2}></LargeInput>
              <LargeInput placeholder="City" value={userStore.shippingAddress.city}></LargeInput>
              <div className="flex gap-2">
                <LargeInput placeholder="Postal Code" isSmall value={userStore.shippingAddress.postalCode}></LargeInput>
                <LargeInput placeholder="Province" isSmall value={userStore.shippingAddress.state}></LargeInput>
              </div>
            </div>
          }
          onClose={() => setIsShippingPopupOpen(false)}
          onSubmit={() => setIsShippingPopupOpen(false)}
          isOpen={isShippingPopupOpen}
        />
        <h1 className="text-center text-lg font-semibold text-label_primary">Billing & Shipping</h1>

        <InfoTable
          rows={userStore.card ? [
            { label: "Name", value: userStore.user.firstName, type: "text" },
            { label: "Billing Address", value: userStore.billingAddress.line1, type: "value", onClick: () => setIsBillingPopupOpen(true) },
            { label: "Shipping Address", value: userStore.billingAddress.line1, type: "value", onClick: () => setIsShippingPopupOpen(true) },
            { label: "Credit Card", value: "xxxx-xxxx-xxxx-" + (userStore.card ? userStore.card : ""), type: "text" },
          ] : [
            { label: "Name", value: userStore.user.firstName, type: "text" },
            { label: "Billing Address", value: userStore.billingAddress.line1, type: "value", onClick: () => setIsBillingPopupOpen(true) },
            { label: "Shipping Address", value: userStore.billingAddress.line1, type: "value", onClick: () => setIsShippingPopupOpen(true) },
          ]}
        />
      </div>
    </ProcessLayout>
  );
}


