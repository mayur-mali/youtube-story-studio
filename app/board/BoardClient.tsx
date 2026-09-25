"use client";

import Link from "next/link";
import { useState } from "react";

type Card = {
  number: string;
  title: string;
  stage: string;
  type: string;
  format: string;
  hasPackaging: boolean;
};

const STAGES = [
  { key: "scripted", deva: "लिखा गया", hint: "lint PASS pending or fresh" },
  { key: "voiced", deva: "आवाज़ दी", hint: "TTS render done" },
  { key: "edited", deva: "एडिट हुआ", hint: "CapCut assembly done" },
  { key: "published", deva: "प्रकाशित", hint: "live on YouTube" },
] as const;

export default function BoardClient({ cards: initial }: { cards: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function move(number: string, title: string, stage: string) {
    setBusy(number + stage);
    try {
      const res = await fetch("/api/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, stage }),
      });
      const data = await res.json();
      if (data.ok) {
        setCards((cs) => cs.map((c) => (c.number === number ? { ...c, stage } : c)));
      } else {
        alert(`Tracker write failed: ${data.error}`);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="storyhead">
        <div className="storyhead__kicker">
          <span>episode_tracker_v2.md · moving a card writes the tracker row</span>
        </div>
        <h1 className="storyhead__title">Production board</h1>
      </div>

      <div className="board">
        {STAGES.map((s) => {
          const col = cards.filter((c) => c.stage === s.key);
          return (
            <div className="board__col" key={s.key}>
              <div className="board__colhead">
                <span className="board__stage">{s.deva}</span>
                <span className="board__hint">{s.hint}</span>
              </div>
              {col.length === 0 && <div className="board__empty">—</div>}
              {col.map((c) => (
                <div className="boardcard" key={c.number}>
                  <div className="boardcard__no">{c.number}</div>
                  <div>
                    <Link className="boardcard__title" href={`/story/${c.number}`}>
                      {c.title}
                    </Link>
                    <div className="boardcard__meta">
                      {c.type} · {c.format}
                      {c.hasPackaging ? " · packaging ✓" : ""}
                    </div>
                    <div className="boardcard__moves">
                      {STAGES.filter((x) => x.key !== c.stage).map((x) => (
                        <button
                          key={x.key}
                          className="btn btn--small"
                          disabled={busy === c.number + x.key}
                          onClick={() => move(c.number, c.title, x.key)}
                        >
                          → {x.key}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
