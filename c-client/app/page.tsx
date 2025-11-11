"use client";
// import Image from "next/image";
import Link from "next/link";
import InfoTable from "../components/InfoTable";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DogCard from "../components/cards/DogCard";
import UpcomingOrderCard from "../components/cards/UpcomingOrderCard";
import { useStores } from "@/stores/StoreContext";
import { observer } from "mobx-react-lite";
import ProcessLayout from "@/components/layout/ProcessLayout";
import { subscriptionInfo } from "c-lib";
import UpcomingOrderPopup from "@/components/popups/UpcomingOrderPopup";
import DogPopup from "@/components/popups/DogPopup";

function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { dogStore, userStore } = useStores();
  const [isUpcomingOrderPopupOpen, setIsUpcomingOrderPopupOpen] = useState(false);
  const [isSubscriptionPopupOpen, setIsSubscriptionDatePopupOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
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

  return (
    <ProcessLayout title={""} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment>


      <div className="w-full px-6">
        <UpcomingOrderPopup
          title="Upcoming orders"
          orders={upcomingOrders.map(o => ({ dogName: o.dogName, status: o.status, portions: o.portions, selectedRecipes: o.recipes.split(','), shippingDate: new Date(o.deliveryDate), id: o.id }))}
          isOpen={isUpcomingOrderPopupOpen}
          onClose={() => setIsUpcomingOrderPopupOpen(false)}
        />
        <DogPopup
          title="Choose Subscription"
          content={
            <div className='w-full flex flex-col gap-4'>
              <p className="text-sm text-label_primary">Select your pooch to view subscription options</p>
              {userStore.registeredDogs.map(r => {
                return(
                  <DogCard key={r.dog.id} variant="profile" subtitle="next order" name={r.dog.name} href={`/dog/${r.dog.id}`} />
                )
              })}
            </div>
          }
          onClose={() => setIsSubscriptionDatePopupOpen(false)}
          isOpen={isSubscriptionPopupOpen}
        />
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-label_primary">
            Hi <span className="text-system_secondary">{userStore.user.firstName || 'there'}!</span>
          </h2>
        </div>

        {/* Pooch Profiles Grid */}
        <div className="grid grid-cols-2 md:flex justify-items-center gap-4 mb-6">
          {userStore.registeredDogs.map((registeredDog) => (
            // dog.id ? (
            true ? (
              <DogCard key={registeredDog.dog.id} variant="profile" subtitle="next order" name={registeredDog.dog.name} href={`/dog/${registeredDog.dog.id}`} />
            ) : (
              <DogCard key={`register-${registeredDog.dog.name}`} name={registeredDog.dog.name} variant="register" subtitle="Not Completed" onRegisterClick={() => router.push('/register/dog/name')} />
            )
          ))}
          {userStore.registeredDogs.length < dogStore.maxDogs ? (
            <DogCard variant="add" name="Add pooch" subtitle="Up to 4" />
          ) : null}
          {Array.from({ length: Math.max(0, dogStore.maxDogs - Math.min(userStore.registeredDogs.length + 1, dogStore.maxDogs)) }).map((_, idx) => (
            <DogCard key={`empty-${idx}`} variant="empty" name="Empty slot" />
          ))}
        </div>

        {/* Upcoming Orders */}
        <div className="mb-6">
          <h3 className="text-sm text-label_secondary mb-3">Upcoming orders</h3>
          <UpcomingOrderCard
            date={userStore.upcomingOrder.date}
            summary={userStore.upcomingOrder.recipes}
            recipients={userStore.upcomingOrder.dogs.toString()}
            status={userStore.upcomingOrder.status}
            onClick={() => setIsUpcomingOrderPopupOpen(true)}
          />
        </div>

        {/* You're in control */}
        <InfoTable
          title={"You're in control"}
          rows={[
            {
              label: "Orders",
              type: "value",
              labelIcon: "/images/icons.png",
              onClick: () => window.location.assign("/orders"),
            },
            {
              label: "Subscription plan",
              type: "value",
              labelIcon: "/images/icons1.png",
              onClick: () => setIsSubscriptionDatePopupOpen(true),
            },
            {
              label: "Purchase history",
              type: "value",
              labelIcon: "/images/icons3.png",
              onClick: () => window.location.assign("/orders?tab=history"),
            },
            {
              label: "Billing & shipping",
              type: "value",
              labelIcon: "/images/icons2.png",
              onClick: () => window.location.assign("/billing"),
            },
          ]}
        />

        {/* Blog and News */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-label_secondary">Blog and news</h3>
            <Link href="#" className="text-system_light_primary text-sm font-bold">Show more</Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="bg-system_primary rounded-xl p-4 min-w-[280px] flex flex-col items-center text-center h-32">

            </div>
          </div>
        </div>
      </div>
    </ProcessLayout>
  );
}
export default observer(ProfilePage);
