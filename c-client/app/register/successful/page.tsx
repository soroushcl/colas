"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
// import LargeInput from '@/components/inputs/largeInput/LargeInput';

const Home: React.FC = observer(() => {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(rememberMe)
    if(userStore.user.password !== userStore.forgotData.repassword) {

    }
    // const res = await userStore.setPassword()
    router.push('/');
    // if (res) {
    //   console.log(res)
    // }
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
  return (
    <ProcessLayout title={"The perfect bowl every time!"} subTitle={'We appreciate our community and the pups in our crew are well taken care of. While you wait for your confirmation email, check out “what to expect when switching to Cola’s fresh food”.'} disabled={false} handleSubmit={handleSubmit} mainButtonText={"TELL ME MORE"}  img='dog.svg'>
        <></>
    </ProcessLayout>

  );
});
export default Home;
