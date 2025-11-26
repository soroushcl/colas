"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InfoTable from "../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { useStores } from "@/stores/StoreContext";
import DogPopup from "@/components/popups/DogPopup";
import LargeInput from "@/components/inputs/largeInput/LargeInput";
import FetchApi from "@/services/api";
import { useToast } from "@/components/popups/ToastContext";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import StripeProvider from "@/providers/StripeProvider";

const BillingPage: React.FC = () => {
  const { userStore } = useStores();
  const { showSuccess, showError } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBillingPopupOpen, setIsBillingPopupOpen] = useState(false);
  const [billing, setBilling] = useState(userStore.billingAddress);
  // const [card, setCard] = useState(userStore.card);
  const [isShippingPopupOpen, setIsShippingPopupOpen] = useState(false);
  const [isCardPopupOpen, setIsCardPopupOpen] = useState(false);
  const [shipping, setShipping] = useState(userStore.shippingAddress);
  const router = useRouter();
  const api = new FetchApi();

  const stripe = useStripe();
  const elements = useElements();

  // const card = elements!.create('card', { hidePostalCode: true });

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
          title="Credit Card "
          content={
            <div className="w-full p-8">
              <CardElement options={{ hidePostalCode: true }} />
            </div>
          }
          onClose={() => setIsCardPopupOpen(false)}
          onSubmit={async () => {
            try {
              if (true) {
                if (!stripe || !elements) {
                  console.error('Stripe not initialized');
                  return;
                }
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                  console.error('CardElement not found');
                  return;
                }
                console.log('card element', cardElement)
                const ad = {
                  line1: userStore.billingAddress.line1,
                  line2: userStore.billingAddress.line2,
                  city: userStore.billingAddress.city,
                  state: userStore.billingAddress.state,
                  country: 'CA',
                  postal_code: userStore.billingAddress.postalCode,
                }
                const { error, paymentMethod } = await stripe.createPaymentMethod({
                  type: 'card',
                  card: cardElement,
                  billing_details: {
                    email: userStore.user.email,
                    address: ad
                  },
                });

                if (error) {
                  console.error(error.message);
                  const errEl = document.getElementById('card-element-errors');
                  if (errEl) errEl.textContent = error.message || 'Payment confirmation failed';
                  return;
                }

                const result = await api.changeCard(paymentMethod.id);
                if (result.success) {
                  userStore.card = paymentMethod.card!.last4
                  window.localStorage.setItem('userStore:card', JSON.stringify(userStore.card));
                  setIsCardPopupOpen(false);
                  showSuccess("Card updated successfully!");
                } else {
                  console.error("Failed to update Card:", result.error);
                  showError("Failed to update Card. Please try again.");
                }
                // } else {
                //   setIsCardPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog Billing:", error);
              showError("An error occurred while updating Billing. Please try again.");
            }
          }}
          isOpen={isCardPopupOpen}
        />
        <DogPopup
          title="Billing Address"
          content={
            <div>
              <LargeInput placeholder="Line 1" value={billing.line1} onChange={(e) => setBilling({ ...billing, line1: e.target.value })}></LargeInput>
              <LargeInput placeholder="Line 2" value={billing.line2} onChange={(e) => setBilling({ ...billing, line2: e.target.value })}></LargeInput>
              <LargeInput placeholder="City" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })}></LargeInput>
              <div className="flex gap-2">
                <LargeInput placeholder="Postal Code" isSmall value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })}></LargeInput>
                <LargeInput placeholder="Province" isSmall value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })}></LargeInput>
              </div>
            </div>
          }
          onClose={() => setIsBillingPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (billing !== userStore.billingAddress) {

                const result = await api.changeBillingAddress(billing);
                if (result.success) {
                  userStore.billingAddress = billing
                  window.localStorage.setItem('userStore:billingAddress', JSON.stringify(userStore.billingAddress));
                  setIsBillingPopupOpen(false);
                  showSuccess("Billing address updated successfully!");
                } else {
                  console.error("Failed to update Billing:", result.error);
                  showError("Failed to update Billing. Please try again.");
                }
              } else {
                setIsBillingPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog Billing:", error);
              showError("An error occurred while updating Billing. Please try again.");
            }
          }}
          isOpen={isBillingPopupOpen}
        />
        <DogPopup
          title="Shipping Address"
          content={
            <div>
              <LargeInput placeholder="Line 1" value={shipping.line1} onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}></LargeInput>
              <LargeInput placeholder="Line 2" value={shipping.line2} onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}></LargeInput>
              <LargeInput placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}></LargeInput>
              <div className="flex gap-2">
                <LargeInput placeholder="Postal Code" isSmall value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}></LargeInput>
                <LargeInput placeholder="Province" isSmall value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })}></LargeInput>
              </div>
            </div>
          }
          onClose={() => setIsShippingPopupOpen(false)}
          onSubmit={async () => {
            try {
              // Only call API if frequency has changed
              // registeredDog?.subscription.info[0].amount += 1
              if (shipping !== userStore.shippingAddress) {

                const result = await api.changeShippingAddress(shipping);
                if (result.success) {
                  userStore.shippingAddress = shipping
                  window.localStorage.setItem('userStore:shippingAddress', JSON.stringify(userStore.shippingAddress));
                  setIsShippingPopupOpen(false);
                  showSuccess("Shipping address updated successfully!");
                } else {
                  console.error("Failed to update Shipping:", result.error);
                  showError("Failed to update Shipping. Please try again.");
                }
              } else {
                setIsShippingPopupOpen(false);
              }
            } catch (error) {
              console.error("Error updating dog Shipping:", error);
              showError("An error occurred while updating Shipping. Please try again.");
            }
          }}
          isOpen={isShippingPopupOpen}
        />
        <h1 className="text-center text-lg font-semibold text-label_primary">Billing & Shipping</h1>

        <InfoTable
          rows={userStore.card ? [
            { label: "Name", value: userStore.user.firstName, type: "text" },
            { label: "Billing Address", value: userStore.billingAddress.line1, type: "value", onClick: () => setIsBillingPopupOpen(true) },
            { label: "Shipping Address", value: userStore.shippingAddress.line1, type: "value", onClick: () => setIsShippingPopupOpen(true) },
            { label: "Credit Card", value: "xxxx-xxxx-xxxx-" + (userStore.card ? userStore.card : ""), type: "value", onClick: () => setIsCardPopupOpen(true) },
          ] : [
            { label: "Name", value: userStore.user.firstName, type: "text" },
            { label: "Billing Address", value: userStore.billingAddress.line1, type: "value", onClick: () => setIsBillingPopupOpen(true) },
            { label: "Shipping Address", value: userStore.shippingAddress.line1, type: "value", onClick: () => setIsShippingPopupOpen(true) },
          ]}
        />
      </div>
    </ProcessLayout>
  );
};

const PaymentPage: React.FC = () => {
  const { userStore } = useStores();
  return (
    <StripeProvider amount={userStore.totalPrice} currency='cad'>
      <BillingPage />
    </StripeProvider>
  );
};

export default PaymentPage;