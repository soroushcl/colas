"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InfoTable from "../../components/InfoTable";
import UpcomingOrderCard from "../../components/cards/UpcomingOrderCard";
import SwitchTabs from "../../components/SwitchTabs";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { useStores } from "@/stores/StoreContext";
import UpcomingOrderPopup from "@/components/popups/UpcomingOrderPopup";
import { subscriptionInfo } from "c-lib";
import DogPopup from "@/components/popups/DogPopup";
import CustomNumberComponent from "@/components/CustomNumberComponent";

export default function OrderPage() {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "history">("orders");
  const router = useRouter();
  const [isUpcomingOrderPopupOpen, setIsUpcomingOrderPopupOpen] = useState(false);
  const [isDeliveryDatePopupOpen, setIsDeliveryDatePopupOpen] = useState(false);
  const [deliveryFrequency, setDeliveryFrequency] = useState(8);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    // Set default tab from query param if provided
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "history" || tab === "orders") {
        setActiveTab(tab as "orders" | "history");
      }
    }
  }, []);

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  const futureOrders: { dogName: string, status: string, portions: string, recipes: string, deliveryDate: string }[] = []
  for (let i = 0; i < userStore.registeredDogs.length; i++) {
    userStore.registeredDogs[i].activeOrders.map(r => {
      let dogName = userStore.registeredDogs.filter(d => r.dog == d.dog.id)[0].dog.name
      dogName = dogName.charAt(0).toUpperCase() + dogName.slice(1);
      const status = r.status
      const portions = r.detail.type
      const recipeNames = r.detail.selectedRecipes.map((r) => {
        // Handle both old format (numbers) and new format (protein enum strings)
        if (typeof r === 'number') {
          // Old format: numbers
          return r == 1 ? ' Beef' : r == 2 ? ' Chicken' : r == 3 ? ' Salmon' : r == 4 ? ' Turkey' : ' ' + r
        } else {
          // New format: protein enum strings
          return ' ' + r
        }
      })
      const recipes = recipeNames.toString().substring(0, recipeNames.toString().length)
      const deliveryDate = new Date(r.shippingDate!).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })
      futureOrders.push({ dogName: dogName, status: status, portions: portions, recipes: recipes, deliveryDate: deliveryDate })
    })
  }

  const oldOrders: { dogName: string, status: string, portions: string, recipes: string, deliveryDate: string }[] = []
  for (let i = 0; i < userStore.registeredDogs.length; i++) {
    userStore.registeredDogs[i].oldOrders.map(r => {
      let dogName = userStore.registeredDogs.filter(d => r.dog == d.dog.id)[0].dog.name
      dogName = dogName.charAt(0).toUpperCase() + dogName.slice(1);
      const status = r.status
      const portions = r.detail.type
      const recipeNames = r.detail.selectedRecipes.map((r: number | string) => {
        // Handle both old format (numbers) and new format (protein enum strings)
        if (typeof r === 'number') {
          // Old format: numbers
          return r == 1 ? ' Beef' : r == 2 ? ' Chicken' : r == 3 ? ' Salmon' : r == 4 ? ' Turkey' : ' ' + r
        } else {
          // New format: protein enum strings
          return ' ' + r
        }
      })
      const recipes = recipeNames.toString().substring(0, recipeNames.toString().length)
      const deliveryDate = new Date(r.shippingDate!).toDateString()
      oldOrders.push({ dogName: dogName, status: status, portions: portions, recipes: recipes, deliveryDate: deliveryDate })
    })
  }
  const upcomingOrders: { dogName: string, status: string, portions: string, recipes: string, deliveryDate: string, id: string }[] = []
  for (let i = 0; i < userStore.upcomingOrders.length; i++) {
    let dogName = userStore.registeredDogs.filter(d => userStore.upcomingOrders[i].dog == d.dog.id)[0].dog.name
    dogName = dogName.charAt(0).toUpperCase() + dogName.slice(1);
    const status = userStore.upcomingOrders[i].status
    const portions = userStore.upcomingOrders[i].detail.type.charAt(0).toUpperCase() + userStore.upcomingOrders[i].detail.type.slice(1) + ' meal'
    const recipes = userStore.upcomingOrders[i].detail.info.map((r: subscriptionInfo, index: number) => {
      return index == 0 && r.amount > 0 ? r.amount + ' Beef' : index == 1 && r.amount > 0 ? r.amount + ' Chicken' : index == 2 && r.amount > 0 ? r.amount + ' Salmon' : null
    })
    const deliveryDate = new Date(userStore.upcomingOrders[i].shippingDate!).toDateString()
    upcomingOrders.push({ dogName: dogName, status: status, portions: portions, recipes: recipes.filter(r => r !== null).join(','), deliveryDate: deliveryDate, id: userStore.upcomingOrders[i].id })
  }
  console.log("upcomingOrders", upcomingOrders)


  return (
    <ProcessLayout title={""} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment>
      <div className="w-full px-4 py-6 space-y-6">
        <UpcomingOrderPopup
          title="Upcoming orders"
          orders={upcomingOrders.map(o => ({ dogName: o.dogName, status: o.status, portions: o.portions, selectedRecipes: o.recipes.split(','), shippingDate: new Date(o.deliveryDate), id: o.id }))}
          isOpen={isUpcomingOrderPopupOpen}
          onClose={() => setIsUpcomingOrderPopupOpen(false)}
        />
        <DogPopup
          title="Delivery date"
          content={
            <div className='w-full flex flex-col gap-4'>
              {
                <div className='flex flex-col gap-4 text-center pb-8 justify-center items-center'>
                  <div className="w-[216px] h-[112px] rounded-3xl bg-system_accent shadow-xs border-[0.5px] border-gray_divider p-4 flex flex-col justify-center">
                    <span className="text-xs text-label_tertiary">$46.32/WEEK</span>
                    <div>
                      <span className="text-lg font-felix_bold text-system_primary">$44.32</span>
                      <span className="text-sm text-system_primary">/WEEK</span>
                    </div>
                    <p className="text-system_dark_primary text-sm">{'Longer range, Lower price'}</p>
                  </div>
                  <div>
                    <p className="text-label_tertiary text-xs">{'Delivery every.....weeks'}</p>
                    <CustomNumberComponent value={deliveryFrequency} setValue={setDeliveryFrequency} minValue={1} maxValue={12} />
                  </div>
                  <p className='text-label_secondary text-sm'>{'Adjusting delivery frequency will change how much food you receive!'}</p>
                </div>
              }

            </div>
          }
          onClose={() => setIsDeliveryDatePopupOpen(false)}
          onSubmit={() => setIsDeliveryDatePopupOpen(false)}
          isOpen={isDeliveryDatePopupOpen}
        />
        {/* Segmented Switch */}
        <div className="w-full flex justify-center">
          <SwitchTabs
            options={[
              { label: "Orders", value: "orders" },
              { label: "History", value: "history" },
            ]}
            value={activeTab}
            onChange={(v) => setActiveTab(v as "orders" | "history")}
          />
        </div>

        {activeTab === "orders" && (
          <>
            {/* Upcoming orders */}
            <div>
              <p className="text-sm text-label_tertiary mb-2">Upcoming orders:</p>
              <UpcomingOrderCard
                date={userStore.upcomingOrder.date}
                summary={userStore.upcomingOrder.recipes}
                recipients={userStore.upcomingOrder.dogs.toString()}
                status={userStore.upcomingOrder.status}
                onClick={() => setIsUpcomingOrderPopupOpen(true)}
              />
            </div>

            {/* Future orders */}
            <div className="space-y-3">
              <p className="text-sm text-label_tertiary">Future orders:</p>
              {futureOrders.map((o, idx) => (
                <div key={`${o.dogName}-${idx}`} className="">
                  <InfoTable
                    rows={[
                      {
                        label: o.dogName,
                        value: (
                          <span className="bg-system_light_secondary text-system_secondary px-2 py-1 rounded-full text-xs font-normal">
                            {o.status}
                          </span>
                        ),
                        type: "text",
                      },
                      { label: "Portions:", value: o.portions, type: "text" },
                      { label: "Recipes", value: o.recipes, type: "text" },
                      { label: "Delivery date:", value: o.deliveryDate, type: "value", onClick: () => setIsDeliveryDatePopupOpen(true) }
                    ]}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            <p className="text-sm text-label_tertiary">Purchase History:</p>
            {oldOrders.map((o, idx) => (
              <div key={`${o.dogName}-${idx}`} className="">
                <InfoTable
                  rows={[
                    {
                      label: o.dogName,
                      value: (
                        <span className="bg-system_light_secondary text-system_secondary px-2 py-1 rounded-full text-xs font-normal">
                          {o.status}
                        </span>
                      ),
                      type: "text",
                    },
                    { label: "Portions:", value: o.portions, type: "text" },
                    { label: "Recipes", value: o.recipes, type: "text" },
                    { label: "Delivery date:", value: o.deliveryDate, type: "value" }
                  ]}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </ProcessLayout>
  );
}


