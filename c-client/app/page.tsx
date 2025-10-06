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

function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { dogStore, userStore } = useStores();

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

  return (
    <ProcessLayout title={""} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment>


      <div className="w-full px-6">
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
