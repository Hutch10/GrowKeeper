import { getPublicProfile } from "@/app/actions/profiles";
import { ProfileView } from "@/components/community/profile-view";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const result = await getPublicProfile(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProfileView profile={result.data} />;
}
