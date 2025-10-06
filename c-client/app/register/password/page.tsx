"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '@/components/inputs/largeInput/LargeInput';

const Home: React.FC = observer(() => {
  const { userStore } = useStores();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(rememberMe)
    if(userStore.user.password !== userStore.forgotData.repassword) {

    }
    const res = await userStore.setPassword()
    if (res) {
      router.push('/');
      console.log(res)
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/successful');
    } else {
      setIsAuthenticated(false);
    }
  }, [router]);
  if (isAuthenticated) {
    return <p>Redirecting to home...</p>;
  }
  return (
    <ProcessLayout title={"Welcome to Cola's crew!"} subTitle='Please set your password to access your profile' handleSubmit={handleSubmit} disabled={!userStore.isLoginValid} mainButtonText={"Submit"}  img='dog.svg'>
      <LargeInput type="password" placeholder="New password" value={userStore.user.password} onChange={(e) => { userStore.user.password = e.target.value }} />
      <LargeInput type="password" placeholder="Repeat your password" value={userStore.forgotData.repassword} onChange={(e) => { userStore.forgotData.repassword = e.target.value }} />
    </ProcessLayout>

  );
});
export default Home;
