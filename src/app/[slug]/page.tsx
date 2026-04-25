import { MarketingPageExperience } from "@/components/lms-experience";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SingleSegmentPage({ params }: PageProps) {
  const { slug } = await params;
  return <MarketingPageExperience slug={slug} />;
}
