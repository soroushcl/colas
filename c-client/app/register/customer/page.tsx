"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import LargeInput from '@/components/inputs/largeInput/LargeInput';
import { useGoogleLogin } from '@react-oauth/google';
import Popup from '@/components/popup';

const Home: React.FC = observer(() => {
  const [isPopupOpen, setPopupOpen] = useState(false)
  const { userStore } = useStores();
  // const { email, firstName, googleRegData, mainButtondisabled, emailError } = regStore;
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  const handleOpenPopup = () => setPopupOpen(true);
  const handleClosePopup = () => setPopupOpen(false);

  const handlePopupAccept = () => {
    console.log('Accept clicked');
    handleClosePopup();
  };

  const handlePopupReject = () => {
    console.log('Reject clicked');
    handleClosePopup();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await userStore.registerUser()
    if (res) {
      console.log(res)
      router.push('/register/state');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (googleResponse) => {
      console.log("loginWithGoogle")
      userStore.googleRegData.code = googleResponse.code
      const googleLoginRes = await userStore.registerUserWithGoogle()
      if (googleLoginRes) {
        // router.push('/');
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
    <ProcessLayout title={"What's your name?"} subTitle={"We'll use this to personalize your experience & save your progress for you."} handleSubmit={handleSubmit} disabled={!userStore.isCustomerRegisterValid} nextArrow mainButtonText={"Next"} secondaryButtonText={"Login With Google"} secondaryButtonCLick={loginWithGoogle} secondary secondaryIcon>
      <LargeInput type="text" placeholder="Your Name" testid="inner-password-input" value={userStore.user.firstName} autoComplete="current-password" onChange={(e) => { userStore.user.firstName = e.target.value }} />
      <LargeInput type="email" placeholder="Your Email" value={userStore.user.email} onChange={(e) => { userStore.user.email = e.target.value }} autoComplete="email" error={userStore.emailError} />
      <Popup
        title="Email"
        content={<p>{`Looks like you've done this before. Would you like to retrieve your previous answers?`}</p>}
        // onSubmit={handlePopupSubmit}
        onAccept={handlePopupAccept}
        onReject={handlePopupReject}
        onOpen={handleOpenPopup}
        onClose={handleClosePopup}
        isOpen={isPopupOpen}
      />
    </ProcessLayout>

  );
});
export default Home;
