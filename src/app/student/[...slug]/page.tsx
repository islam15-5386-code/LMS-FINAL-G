import { WorkspaceExperience } from "@/components/lms-experience";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function StudentRoutePage({ params }: PageProps) {
  const { slug } = await params;
  return <WorkspaceExperience role="student" segments={slug} />;
}
