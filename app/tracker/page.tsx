import { getTracker } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const t = await getTracker();

  return (
    <>
      <div className="storyhead">
        <div className="storyhead__kicker">
          <span>episode_tracker_v2.md</span>
          <span>·</span>
          <span>live from the binder</span>
        </div>
        <h1 className="storyhead__title">Tracker</h1>
      </div>

      <table className="tracker-table">
        <caption>Episode log</caption>
        <thead>
          <tr>
            <th>Date</th><th>Title</th><th>Type</th><th>Format</th><th>Stage</th><th>Parts</th><th>Runtime</th><th>Key context</th>
          </tr>
        </thead>
        <tbody>
          {t.entries.length === 0 ? (
            <tr><td colSpan={8} style={{ color: "var(--ink-soft)" }}>कोई entry नहीं — tracker खाली है।</td></tr>
          ) : (
            t.entries.map((e, i) => (
              <tr key={i}>
                <td>{e.date}</td>
                <td className="deva">{e.title}</td>
                <td>{e.type}</td>
                <td>{e.format}</td>
                <td><span className={`stamp stamp--${e.stage.toLowerCase()}`}>{e.stage}</span></td>
                <td>{e.parts}</td>
                <td>{e.runtime}</td>
                <td style={{ color: "var(--ink-soft)" }}>{e.context}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <table className="tracker-table">
        <caption>Entity / lore registry</caption>
        <thead>
          <tr>
            <th>Entity</th><th>Episode</th><th>Origin</th><th>Powers / rules</th><th>Resolved</th>
          </tr>
        </thead>
        <tbody>
          {t.entities.length === 0 ? (
            <tr><td colSpan={5} style={{ color: "var(--ink-soft)" }}>रजिस्ट्री खाली है।</td></tr>
          ) : (
            t.entities.map((e, i) => (
              <tr key={i}>
                <td className="deva">{e.name}</td>
                <td className="deva">{e.episode}</td>
                <td className="deva">{e.origin}</td>
                <td className="deva">{e.powers}</td>
                <td>{e.resolved}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
