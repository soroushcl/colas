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
    "alberta",
    "british columbia",
    "manitoba",
    "new brunswick",
    "newfoundland and labrador",
    "nova scotia",
    "ontario",
    "prince edward island",
    "quebec",
    "saskatchewan",
    "northwest territories",
    "nunavut",
    "yukon",
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
        placeholder="State"
        onSelect={(value) => {
          // setSelectedOption(value);
          userStore.user.state = value
          console.log("Selected:", value);
        }}
      />
    </ProcessLayout>

  );
});
export default Home;
