"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '@/components/inputs/largeInput/LargeInput';
import { useGoogleLogin } from '@react-oauth/google';
import Link from 'next/link';

const Home: React.FC = observer(() => {
  const { userStore } = useStores();
  // const { email, password, rememberMe, loginMainButtondisabled, emailError } = userStore;
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(rememberMe)
    const res = await userStore.loginUser()
    if (res) {
      router.push('/');
      console.log(res)
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (googleResponse) => {
      console.log("loginWithGoogle")
      const googleLoginRes = await userStore.loginUserWithGoogle({ code: googleResponse.code })
      if (googleLoginRes) {
        router.push('/');
      }
    },
    onError: (errorResponse) => console.log('error: ', errorResponse),
    flow: 'auth-code',
  });

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
    <ProcessLayout title={"Customer Login"} handleSubmit={handleSubmit} disabled={!userStore.isLoginValid} mainButtonText={"Login"} secondaryButtonText={"Login with Google"} secondaryButtonCLick={loginWithGoogle} img='dog.svg'>
      <LargeInput type="email" placeholder="Email" value={userStore.user.email} onChange={(e) => { userStore.user.email = e.target.value }} autoComplete="email" error={userStore.emailError} />
      <LargeInput type="password" placeholder="Password" testid="inner-password-input" value={userStore.user.password} autoComplete="current-password" onChange={(e) => { userStore.user.password = e.target.value }} />
      <Link className='text-system_visual_primary text-base font-medium' href={'/auth/forgot-password'}>{'I forgot my password'}</Link>
    </ProcessLayout>

  );
});
export default Home;
