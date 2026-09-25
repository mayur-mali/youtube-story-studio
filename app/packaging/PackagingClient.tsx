"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PackageCheck } from "lucide-react";

import CopyButton from "@/app/_components/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

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

  const f = TITLE_FORMULAS.find((x) => x.key === formula) ?? TITLE_FORMULAS[0];
  const title = f.make(subject);

  const thumbPrompt = `2D cinematic horror animation, dark painterly style, Indian folklore aesthetic — ${thumbConcept}; subject anchor: ${subject}; ${STYLE}; NO text in image; 16:9 — Negative: ${NEGATIVE}`;

  const description = `[${title}]\n\n${summary || "[कहानी का 1-2 line summary — spoiler नहीं]"}\n\nइस कहानी में: ${keywords}\n\nकथा: यह एक काल्पनिक कहानी है। सभी पात्र और घटनाएँ काल्पनिक हैं।\n\n#mayajaalduniya #hindihorror #bhootiyakatha`;

  const kit = `# PACKAGING KIT — story ${story}\n\n## TITLE\n${title}\n(formula: ${f.label})\n\n## THUMBNAIL PROMPT (16:9)\n${thumbPrompt}\nText overlay (editor): ${overlay}\n\n## SHORTS COVER (9:16)\nsame composition, vertical, subject centered\n\n## DESCRIPTION\n${description}\n\n## TAGS\nhorror story hindi, bhoot ki kahani, hindi kahaniya, paranormal hindi\n`;

  async function save() {
    const s = stories.find((x) => x.number === story);
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch("/api/packaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: s.folder, content: kit }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Packaging kit saved", { description: `${s.folder}/004_packaging.md` });
        router.refresh();
      } else {
        toast.error("Save failed", { description: data.error });
      }
    } catch {
      toast.error("Save request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-night-400">bible Part 06 formulas · saves as 004_packaging.md</div>
        <h1 className="mt-1 font-deva text-4xl text-night-100">पैकेजिंग जेनरेटर</h1>
      </div>

      {stories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-night-400">कोई story folder नहीं मिला।</CardContent>
        </Card>
      ) : (
        <div className="grid max-w-4xl gap-5">
          <Card>
            <CardContent className="grid gap-4 p-5">
              <div className="grid gap-2">
                <Label htmlFor="pk-story">Story</Label>
                <Select id="pk-story" value={story} onChange={(e) => setStory(e.target.value)}>
                  {stories.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number} — {s.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pk-subject">Subject (Devanagari, goes inside the formula)</Label>
                <Input id="pk-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pk-formula">Title formula</Label>
                <Select id="pk-formula" value={formula} onChange={(e) => setFormula(e.target.value)}>
                  {TITLE_FORMULAS.map((x) => (
                    <option key={x.key} value={x.key}>{x.label}</option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-0 divide-y divide-night-700">
                <div className="grid grid-cols-[9.5rem_1fr_auto] items-center gap-3 px-4 py-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brass-300">Title</span>
                  <span className="font-deva text-[1.05rem]">{title}</span>
                  <CopyButton text={title} />
                </div>
                <div className="grid grid-cols-[9.5rem_1fr_auto] items-center gap-3 px-4 py-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brass-300">Overlay (≤3 words)</span>
                  <Input value={overlay} onChange={(e) => setOverlay(e.target.value)} list="overlay-words" className="h-8" />
                  <datalist id="overlay-words">
                    {OVERLAY_WORDS.map((w) => (
                      <option key={w} value={w} />
                    ))}
                  </datalist>
                  <span />
                </div>
                <div className="grid grid-cols-[9.5rem_1fr_auto] items-start gap-3 px-4 py-3">
                  <span className="pt-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brass-300">Thumb prompt</span>
                  <span className="whitespace-pre-wrap font-mono text-[0.78rem] leading-relaxed text-night-200">{thumbPrompt}</span>
                  <CopyButton text={thumbPrompt} />
                </div>
                <div className="grid grid-cols-[9.5rem_1fr_auto] items-start gap-3 px-4 py-3">
                  <span className="pt-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brass-300">Description</span>
                  <span className="whitespace-pre-wrap text-[0.85rem] text-night-200">{description}</span>
                  <CopyButton text={description} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 p-5">
              <div className="grid gap-2">
                <Label htmlFor="pk-summary">Story summary for description (optional)</Label>
                <Input id="pk-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="1-2 lines, no spoilers" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pk-keywords">Keywords</Label>
                <Input id="pk-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pk-thumb">Thumbnail concept notes (goes into the prompt)</Label>
                <Textarea id="pk-thumb" className="min-h-24 font-sans text-[0.9rem]" value={thumbConcept} onChange={(e) => setThumbConcept(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={saving}>
                  <PackageCheck /> {saving ? "Saving…" : "Save kit to binder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
