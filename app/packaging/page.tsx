import { getStories } from "@/lib/content";
import { readPackaging } from "@/lib/tracker-store";
import PackagingClient from "./PackagingClient";

export const dynamic = "force-dynamic";

export default async function PackagingPage({ searchParams }: { searchParams: Promise<{ story?: string }> }) {
  const { story } = await searchParams;
  const stories = await getStories();
  const selected = stories.find((s) => s.number === story) ?? stories[0];
  const existing = selected ? await readPackaging(selected.folder) : null;

  return (
    <PackagingClient
      stories={stories.map((s) => ({ number: s.number, title: s.title, folder: s.folder }))}
      selectedNumber={selected?.number ?? ""}
      initialContent={existing ?? ""}
    />
  );
}
