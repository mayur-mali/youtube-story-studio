import Link from "next/link";
import { getStories, getTracker } from "@/lib/content";
import { getStageFor } from "@/lib/tracker-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stories = await getStories();
  const tracker = await getTracker();

  const stageFor = await Promise.all(stories.map((s) => getStageFor(s.title)));
  const stages = new Map(stories.map((s, i) => [s.number, stageFor[i]]));

  return (
    <>
      <div className="storyhead">
        <div className="storyhead__kicker">
          <span>Production binder</span>
          <span>·</span>
          <span>{stories.length} {stories.length === 1 ? "story" : "stories"} on the desk</span>
        </div>
        <h1 className="storyhead__title">Stories</h1>
      </div>

      {stories.length === 0 ? (
        <div className="empty">
          <p className="deva">अभी कोई कहानी फ़ाइल में नहीं है।</p>
          <p>
            Create a story folder under <code>scripts/NNN_title/</code> with <code>001_script.md</code>,
            or paste a script on the <Link href="/new">New script</Link> page.
          </p>
        </div>
      ) : (
        <div className="ledger">
          <div className="ledger__head">
            <span>No.</span>
            <span>Title</span>
            <span>Type</span>
            <span>Files</span>
            <span style={{ justifySelf: "end" }}>Stage</span>
          </div>
          {stories.map((s) => (
            <Link className="ledger__row" key={s.number} href={`/story/${s.number}`}>
              <span className="ledger__no">{s.number}</span>
              <span>
                <span className="ledger__title">{s.title}</span>
                <span className="ledger__context" style={{ display: "block" }}>
                  {s.scriptParts > 1 ? `${s.scriptParts} parts · ` : ""}
                  {tracker.entities.find((e) => e.episode.includes(s.title.split("—")[0].trim()))?.name ?? s.slug.replace(/_/g, " ")}
                </span>
              </span>
              <span className="ledger__meta">
                <strong>{s.scriptParts > 1 ? "Series" : "Standalone"}</strong>
                <br />
                {s.hasPrompts ? "prompts ready" : "no prompts"}
              </span>
              <span className="ledger__meta">
                script{s.scriptParts > 1 ? "s" : ""}
                {s.hasPipeline ? " + pipeline" : ""}
              </span>
              <span className={`stamp stamp--${stages.get(s.number)}`}>{stages.get(s.number)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
