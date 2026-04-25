import { CatalogCourseExperience } from "@/components/lms-experience";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CatalogCoursePage({ params }: PageProps) {
  const { slug } = await params;
  return <CatalogCourseExperience slug={slug} />;
}
