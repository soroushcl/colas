"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStores } from "@/stores/StoreContext";

export default function LogoutPage() {
  const router = useRouter();
  const { userStore, dogStore } = useStores();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await userStore.api.logout();
      } catch {
      }
      // clear all client-side persisted data
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.clear();
          window.sessionStorage.clear();
        } catch {
        }
      }
      // reset minimal client state
      userStore.user.id = "";
      userStore.user.email = "";
      userStore.user.firstName = "";
      dogStore.dogs = [];
      router.replace("/auth/login");
    };
    doLogout();
  }, [router, userStore, dogStore]);

  return (
    <div className="min-h-screen flex items-center justify-center text-label_primary">
      Logging you out...
    </div>
  );
}


