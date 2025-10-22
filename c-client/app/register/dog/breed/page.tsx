"use client";
import { observer } from 'mobx-react-lite';
import ProcessLayout from '@/components/layout/ProcessLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/stores/StoreContext';
import SearchableSelect from '@/components/inputs/serchableSelectInput/SerchableSelectInput';
import FetchApi from '@/services/api';
// import { BreedListResponse } from 'c-lib';
// import { useGoogleLogin } from '@react-oauth/google';

const Home: React.FC = observer(() => {
  const { dogStore, userStore } = useStores();
  // const { mainButtondisabled } = regStore;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // const [, setSelectedOption] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dogStore.currentStep += 1
    router.push('/register/dog/age');
    // const res = await userStore.updateCustomer()
    // if (res) {
    //   console.log(res)
    // }
  };

  // Fetch breeds from API
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        setLoading(true);
        setError(null);
        const api = new FetchApi();
        const response = await api.getBreeds();
        
        if (response.success) {
          const breedNames = response.payload.breeds.map((breed: { name: string }) => breed.name);
          setBreeds(breedNames);
        } else {
          setError('Failed to fetch breeds');
        }
      } catch (err) {
        console.error('Error fetching breeds:', err);
        setError('Failed to fetch breeds');
      } finally {
        setLoading(false);
      }
    };

    fetchBreeds();
  }, []);

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
    if (dogStore.currentStep < dogStore.breedStep) {
      router.push('/register/customer');
    } else {
      setIsAuthenticated(false);
    }
  }, [router, dogStore.currentStep, dogStore.breedStep]);
  if (loading) {
    return (
      <ProcessLayout title={`What's *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}* ‌breed?`} subTitle={"Loading breeds..."} handleSubmit={handleSubmit} disabled={true} nextArrow mainButtonText={"Next"} img='breed_dog.png' registeredDogs={userStore.registeredDogs}>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading dog breeds...</div>
        </div>
      </ProcessLayout>
    );
  }

  if (error) {
    return (
      <ProcessLayout title={`What's *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* ‌breed?`} subTitle={"Error loading breeds"} handleSubmit={handleSubmit} disabled={true} nextArrow mainButtonText={"Next"} img='breed_dog.png'>
        <div className="flex justify-center items-center py-8">
          <div className="text-red-600">{error}</div>
        </div>
      </ProcessLayout>
    );
  }

  return (
    <ProcessLayout title={`What's *${dogStore.dog.name.charAt(0).toUpperCase() + dogStore.dog.name.slice(1)}’s* ‌breed?`} subTitle={"Choose Mutt if you don't know."} handleSubmit={handleSubmit} disabled={!dogStore.isDogBreedValid} nextArrow mainButtonText={"Next"} img='breed_dog.png'>
      <SearchableSelect
        options={breeds}
        placeholder="Breed"
        onSelect={(value) => {
          // setSelectedOption(value);
          dogStore.dog.breed = value
          console.log("Selected:", value);
        }}
      />
    </ProcessLayout>

  );
});
export default Home;
