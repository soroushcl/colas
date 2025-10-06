"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Link from "next/link";
import InfoTable from "../../../components/InfoTable";
import ProcessLayout from "@/components/layout/ProcessLayout";
// import Image from "next/image";
// import UpcomingOrderCard from "@/components/cards/UpcomingOrderCard";

export default function DogProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const subscriptions = [
    {
      dogName: "Ibel",
      status: "Active",
      portions: "Full meal",
      recipes: "18 Chicken, 4 Beef, 8 Salmon",
      price: "$223.33 + Tax",
    },
    {
      dogName: "Ibel",
      status: "Active",
      portions: "Full meal",
      recipes: "18 Chicken, 4 Beef, 8 Salmon",
      price: "$223.33 + Tax",
    },
    {
      dogName: "Ibel",
      status: "Active",
      portions: "Full meal",
      recipes: "18 Chicken, 4 Beef, 8 Salmon",
      price: "$223.33 + Tax",
    },
  ];
  const router = useRouter();

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

  // let subscribe = () => {
  //   console.log("subscribed")
  // }

  return (
    <ProcessLayout title={"Subscription plan"} handleSubmit={function (): void {
      throw new Error("Function not implemented.");
    }} disabled={true} isPayment>
      <div className="w-full px-4 py-6 space-y-6">
        {/* Future orders */}
        <div className="space-y-3">
          {subscriptions.map((o, idx) => (
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
                  { label: "Price:", value: o.price, type: "value" }
                ]}
              />
            </div>
          ))}
        </div>
      </div>
    </ProcessLayout >
  );
}
