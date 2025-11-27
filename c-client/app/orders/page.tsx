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
// import CustomNumberComponent from "@/components/CustomNumberComponent";
import SearchableSelect from "@/components/inputs/serchableSelectInput/SerchableSelectInput";
import FetchApi from "@/services/api";

const nextWeeksCalculator = (weeks?: number) => {
  if (!weeks) {
    weeks = 28
  }
  const now = new Date();
  // if (date) now = date;
  const t = now.getDay();
  let diff = 0;
  diff = (7 + (1 - t)) % 7 || 7;
  let nextMonday;
  if (diff <= 4) {
    nextMonday = new Date(new Date(now.setDate(now.getDate() + diff + 7)).setHours(0, 0, 0));
  } else {
    nextMonday = new Date(new Date(now.setDate(now.getDate() + diff)).setHours(0, 0, 0));
  }
  let tempNextMonday = new Date(nextMonday);
  const result = [tempNextMonday.toLocaleString('default', { year: "numeric", month: "long", day: "numeric" }).toUpperCase()];
  for (let i = 1; i < weeks; i++) {
    tempNextMonday = new Date(tempNextMonday.getTime() + 7 * 24 * 60 * 60 * 1000)
    result.push(tempNextMonday.toLocaleString('default', { year: "numeric", month: "long", day: "numeric" }).toUpperCase())
  }
  return result;
}

export default function OrderPage() {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "history">("orders");
  const router = useRouter();
  const [isUpcomingOrderPopupOpen, setIsUpcomingOrderPopupOpen] = useState(false);
  const [isDeliveryDatePopupOpen, setIsDeliveryDatePopupOpen] = useState(false);
  const temOldOrders: { dogName: string, status: string, portions: string, recipes: string, deliveryDate: string, price: string, url: string }[] = []
  const [oldOrders, setOldOrders] = useState(temOldOrders)
  const api = new FetchApi();

  const nextWeeks = nextWeeksCalculator();
  // const [deliveryFrequency, setDeliveryFrequency] = useState(8);
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

  useEffect(() => {
    for (let i = 0; i < userStore.registeredDogs.length; i++) {
      userStore.registeredDogs[i].oldOrders.map(async r => {
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
        const result = await api.getInvoice(r.invoiceNumber!)
        console.log("success", result)
        if (result.success) {
          console.log("success true", )
          const invoice = result.payload
          temOldOrders.push({ dogName: dogName, status: status, portions: portions, recipes: recipes, deliveryDate: deliveryDate, price: invoice.price, url: invoice.url })
        }
      })
      setOldOrders(temOldOrders)
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
          title="Subscribe"
          content={
            <div className='w-full flex flex-col gap-4 pb-32'>
              <p className="font-roca text-xl text-system_light_primary">RESUME SUBSCRIPTION</p>
              <div className="text-label_primary text-sm">
                <span>Welcome back “name”. Your subscription will be resumed at </span>
                <span className="font-felix_bold">$302.69</span>
                <span> + tax charged every </span>
                <span className="font-felix_bold">2</span>
                <span> weeks. You can make changes to your meal selection after your sub is resumed.</span>
              </div>
              <p className="text-label_primary text-sm">When would you like your next box delivery? Please choose from the lis below:</p>
              <SearchableSelect
                options={nextWeeks}
                onSelect={function (value: string): void {
                  throw new Error("Function not implemented." + value);
                }}
                placeholder="CHOOSE YOUR NEXT DELIVERY"
              ></SearchableSelect>
              <div className="text-xs">
                <span>By resuming your subscription, you agree to our </span>
                <span className="font-felix_bold text-semantic_blue cursor-pointer" onClick={() => window.location.href = '/'}>Terms of use.</span>
              </div>
            </div>
          }
          onClose={() => setIsDeliveryDatePopupOpen(false)}
          onSubmit={async () => {
            // try {
            //   const info = registeredDog.dog.subscription!.info.map(r => {
            //     return {
            //       protein: registeredDog.recipes.filter(s => s.id == r.recipeId)[0].protein,
            //       amount: r.amount
            //     };
            //   });
            //   const result = await api.editDog(registeredDog.dog.id, info);
            //   if (result.success) {
            //     // setDeliveryFrequency(registeredDog?.subscription.recurring / 7)
            //     // const payload: any = (result as any).payload;
            //     // setDeliveryFrequency(payload.dog.subscription.recurring / 7)
            //     window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(userStore.registeredDogs));
            //     // window.location.reload();
            //     setIsEditingDog(false);
            //     setIsRecipePopupOpen(false);
            //     // setIsBreedPopupOpen(false);
            //     // Optionally refresh the page or update the store
            //   } else {
            //     console.error("Failed to update dog:", result.error);
            //     alert("ailed to update dog. Please try again.");
            //   }
            // } catch (error) {
            //   console.error("Error updating dog recurring:", error);
            //   alert("An error occurred while updating delivery frequency. Please try again.");
            // }
          }}
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
            <p className="text-sm text-label_tertiary">Delivered orders:</p>
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
                    { label: "Delivery date:", value: o.deliveryDate, type: "value" },
                    { 
                      label: o.price, 
                      value: 'Download pdf', 
                      type: "value", 
                      onClick: () => { window.location.href = o.url; }
                    }
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


