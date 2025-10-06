import { DogProfilePageClient } from "./DogProfilePageClient";

interface DogProfilePageProps {
  params: Promise<{
    dogId: string;
  }>;
}

export default async function DogProfilePage({ params }: DogProfilePageProps) {
  const { dogId } = await params;
  return <DogProfilePageClient dogId={dogId} />;
}