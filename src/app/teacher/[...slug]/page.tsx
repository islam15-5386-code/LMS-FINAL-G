import { WorkspaceExperience } from "@/components/lms-experience";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function TeacherRoutePage({ params }: PageProps) {
  const { slug } = await params;
  return <WorkspaceExperience role="teacher" segments={slug} />;
}
