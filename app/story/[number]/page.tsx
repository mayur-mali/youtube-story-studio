import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getStory } from "@/lib/content";
import { lintAvailable } from "@/lib/lint-availability";
import { Badge } from "@/components/ui/badge";
import StoryTabs from "./StoryTabs";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const story = await getStory(number);
  if (!story) notFound();

  const title = story.title;
  const canLint = lintAvailable();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-night-400 transition-colors hover:text-brass-300"
        >
          <ArrowLeft className="size-3.5" /> Stories
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="bg-gradient-to-br from-ember-400 to-spectre-400 bg-clip-text font-mono text-5xl font-bold text-transparent">
            {story.number}
          </span>
          <h1 className="font-deva text-4xl leading-tight text-night-100">{title}</h1>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="ember">Case file {story.number}</Badge>
          {story.scriptParts > 1 && <Badge variant="voiced">{story.scriptParts} parts</Badge>}
          {story.hasPipeline && <Badge>pipeline</Badge>}
          {story.hasPrompts && <Badge>prompts</Badge>}
        </div>
      </div>

      <StoryTabs
        number={story.number}
        folder={story.folder}
        canLint={canLint}
        files={story.files.map((f) => ({ kind: f.kind, part: f.part, file: f.file, content: f.content }))}
      />
    </div>
  );
}
