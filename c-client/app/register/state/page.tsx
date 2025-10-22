"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import SearchableSelect from '@/components/inputs/serchableSelectInput/SerchableSelectInput';
// import { useGoogleLogin } from '@react-oauth/google';

const Home: React.FC = observer(() => {
  const { userStore } = useStores();
  // const { mainButtondisabled } = regStore;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  // const [, setSelectedOption] = useState("");

  const options = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Northwest Territories",
    "Nunavut",
    "Yukon",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const res = await userStore.updateCustomer()
    // if (res) {
    //   router.push('/register/dog-count');
    //   console.log(res)
    // }
    router.push('/register/dog-count');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    } else {
      setIsAuthenticated(false);
    }
  }, [router]);
  if (isAuthenticated) {
    return <p>Redirecting to home...</p>;
  }
  useEffect(() => {
    if (userStore.currentStep < userStore.stateStep) {
      router.push('/register/customer');
    } else {
      setIsAuthenticated(false);
    }
  }, [router, userStore.currentStep, userStore.stateStep]);
  return (
    <ProcessLayout title={"We reside in"} subTitle={"We want to make sure we can serve your area"} handleSubmit={handleSubmit} disabled={!userStore.isCustomerStateValid} nextArrow mainButtonText={"Next"}>
      <SearchableSelect
        options={options}
        selected={userStore.user.state}
        placeholder="Province"
        onSelect={(value) => {
          // setSelectedOption(value);
          userStore.user.state = value
          console.log("Selected:", value);
        }}
      />
      <p className='w-[305px] text-center text-semantic_red font-normal text-base'>
        {(userStore.isCustomerStateValid || !userStore.user.state) ? "" : "Sorry! We currently only serve Ontario & Quebec doggos."}
      </p>
    </ProcessLayout>

  );
});
export default Home;
