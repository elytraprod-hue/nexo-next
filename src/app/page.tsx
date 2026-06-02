import { redirect } from "next/navigation";
import { Dashboard } from "@/features/dashboard/dashboard";

type HomeProps = {
  searchParams?: Promise<{ review?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  if (params?.review) {
    redirect(`/review/${encodeURIComponent(params.review)}`);
  }

  return <Dashboard />;
}
