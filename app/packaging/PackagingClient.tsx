"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CopyButton from "@/app/_components/CopyButton";

type StoryOpt = { number: string; title: string; folder: string };

const TITLE_FORMULAS = [
  { key: "rule", label: "Forbidden rule", make: (t: string) => `इस गाँव में रात के बाद ${t} मत छुओ...` },
  { key: "curiosity", label: "Curiosity gap", make: (t: string) => `${t} के नीचे क्या है जो गाँव छुपाता है?` },
  { key: "numhook", label: "Number hook", make: (t: string) => `पाँच गए थे... ${t} से केवल चार लौटे` },
  { key: "address", label: "Direct address", make: (t: string) => `अगर ${t} तुम्हारा नाम पुकारे तो मत जवाब दो...` },
  { key: "casefile", label: "Case file (Rudra Sen)", make: (t: string) => `केस फाइल #०__: ${t}` },
] as const;

const OVERLAY_WORDS = ["दूसरी छाया", "पेड़ गिनता है", "गिनती शुरू", "आखिरी लकीर", "वह लौटता नहीं"];

const STYLE = "2D cinematic horror animation, dark painterly style, Indian folklore aesthetic, high contrast shadows, detailed linework";
const NEGATIVE = "realistic photo, 3D render, bright colors, anime chibi, cartoon, text, letters";

export default function PackagingClient({
  stories,
  selectedNumber,
  initialContent,
}: {
  stories: StoryOpt[];
  selectedNumber: string;
  initialContent: string;
}) {
  const router = useRouter();
  const [story, setStory] = useState(selectedNumber);
  const [subject, setSubject] = useState("इस पेड़ को");
  const [formula, setFormula] = useState<string>(TITLE_FORMULAS[3].key);
  const [thumbConcept, setThumbConcept] = useState(
    "focal point: half-lit face or hand; dark base with 2-3 color pops (amber, sickly green, indigo on black); no text in image; 16:9"
  );
  const [overlay, setOverlay] = useState(OVERLAY_WORDS[0]);
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState("आम का पेड़, गिनती की लकीरें, गाँव का नियम");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const f = TITLE_FORMULAS.find((x) => x.key === formula) ?? TITLE_FORMULAS[0];
  const title = f.make(subject);

  const thumbPrompt = `2D cinematic horror animation, dark painterly style, Indian folklore aesthetic — ${thumbConcept}; subject anchor: ${subject}; ${STYLE}; NO text in image; 16:9 — Negative: ${NEGATIVE}`;

  const description = `[${title}]

${summary || "[कहानी का 1-2 line summary — spoiler नहीं]"}

इस कहानी में: ${keywords}

कथा: यह एक काल्पनिक कहानी है। सभी पात्र और घटनाएँ काल्पनिक हैं।

#mayajaalduniya #hindihorror #bhootiyakatha`;

  const kit = `# PACKAGING KIT — story ${story}

## TITLE
${title}
(formula: ${f.label})

## THUMBNAIL PROMPT (16:9)
${thumbPrompt}
Text overlay (editor): ${overlay}

## SHORTS COVER (9:16)
same composition, vertical, subject centered

## DESCRIPTION
${description}

## TAGS
horror story hindi, bhoot ki kahani, hindi kahaniya, paranormal hindi
`;

  async function save() {
    const s = stories.find((x) => x.number === story);
    if (!s) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/packaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: s.folder, content: kit }),
      });
      const data = await res.json();
      setMsg(data.ok ? `Saved to ${s.folder}/004_packaging.md` : data.error || "save failed");
      if (data.ok) router.refresh();
    } catch {
      setMsg("save request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="storyhead">
        <div className="storyhead__kicker">
          <span>bible Part 06 formulas · saves as 004_packaging.md</span>
        </div>
        <h1 className="storyhead__title">Packaging generator</h1>
      </div>

      {stories.length === 0 ? (
        <div className="empty">कोई story folder नहीं मिला।</div>
      ) : (
        <>
          <div className="newform" style={{ maxWidth: 720 }}>
            <div>
              <label htmlFor="pk-story">Story</label>
              <select id="pk-story" value={story} onChange={(e) => setStory(e.target.value)}>
                {stories.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number} — {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pk-subject">Subject (Devanagari, goes inside the formula)</label>
              <input id="pk-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pk-formula">Title formula</label>
              <select id="pk-formula" value={formula} onChange={(e) => setFormula(e.target.value)}>
                {TITLE_FORMULAS.map((x) => (
                  <option key={x.key} value={x.key}>{x.label}</option>
                ))}
              </select>
            </div>

            <div className="kitpreview">
              <div className="kitpreview__row">
                <span className="kitpreview__label">Title</span>
                <span className="kitpreview__value">{title}</span>
                <CopyButton text={title} />
              </div>
              <div className="kitpreview__row">
                <span className="kitpreview__label">Overlay (≤3 words)</span>
                <input
                  className="kitpreview__input"
                  value={overlay}
                  onChange={(e) => setOverlay(e.target.value)}
                  list="overlay-words"
                />
                <datalist id="overlay-words">
                  {OVERLAY_WORDS.map((w) => (
                    <option key={w} value={w} />
                  ))}
                </datalist>
              </div>
              <div className="kitpreview__row" style={{ alignItems: "flex-start" }}>
                <span className="kitpreview__label">Thumb prompt</span>
                <span className="kitpreview__value kitpreview__value--mono">{thumbPrompt}</span>
                <CopyButton text={thumbPrompt} />
              </div>
              <div className="kitpreview__row" style={{ alignItems: "flex-start" }}>
                <span className="kitpreview__label">Description</span>
                <span className="kitpreview__value kitpreview__value--pre">{description}</span>
                <CopyButton text={description} />
              </div>
            </div>

            <div>
              <label htmlFor="pk-summary">Story summary for description (optional)</label>
              <input id="pk-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="1-2 lines, no spoilers" />
            </div>
            <div>
              <label htmlFor="pk-keywords">Keywords</label>
              <input id="pk-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pk-thumb">Thumbnail concept notes (goes into the prompt)</label>
              <textarea id="pk-thumb" style={{ minHeight: "6rem", fontFamily: "inherit", fontSize: "0.9rem" }} value={thumbConcept} onChange={(e) => setThumbConcept(e.target.value)} />
            </div>

            <div className="lintbar">
              <button className="btn" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save kit to binder"}
              </button>
              {msg && <span className="lintstats">{msg}</span>}
            </div>
          </div>
        </>
      )}
    </>
  );
}
