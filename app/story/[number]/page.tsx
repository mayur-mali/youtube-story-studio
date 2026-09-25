import { notFound } from "next/navigation";
import Link from "next/link";
import { getStory } from "@/lib/content";
import StoryTabs from "./StoryTabs";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const story = await getStory(number);
  if (!story) notFound();

  const scriptFile = story.files.find((f) => f.kind === "script");
  const title = story.title;

  return (
    <>
      <div className="storyhead">
        <div className="storyhead__kicker">
          <Link className="backlink" href="/">← Stories</Link>
          <span>Case file {story.number}</span>
        </div>
        <div className="storyhead__no">{story.number}</div>
        <h1 className="storyhead__title">{title}</h1>
      </div>
      <StoryTabs
        number={story.number}
        folder={story.folder}
        files={story.files.map((f) => ({ kind: f.kind, part: f.part, file: f.file, content: f.content }))}
      />
    </>
  );
}
