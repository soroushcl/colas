"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InfoTable from "../../components/InfoTable";
import UpcomingOrderCard from "../../components/cards/UpcomingOrderCard";
import SwitchTabs from "../../components/SwitchTabs";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { useStores } from "@/stores/StoreContext";

export default function OrderPage() {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "history">("orders");
  const router = useRouter();

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
      const deliveryDate = new Date(r.shippingDate!).toDateString()
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


  return (
    <ProcessLayout title={""} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment>
      <div className="w-full px-4 py-6 space-y-6">
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
                      { label: "Delivery date:", value: o.deliveryDate, type: "value" }
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


