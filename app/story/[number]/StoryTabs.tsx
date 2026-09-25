"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { FileText, Film, Sparkles } from "lucide-react";

import CopyButton from "@/app/_components/CopyButton";
import LintPanel from "@/app/_components/LintPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileKind = "script" | "pipeline" | "prompts";
type StoryFile = { kind: FileKind; part?: number; file: string; content: string };

type SceneBlock = {
  heading: string;
  narration: string[];
  dialogue: { name: string; line: string }[];
  cues: string[];
};

// Split a script markdown into scene blocks for the paper reader.
function parseScript(md: string): SceneBlock[] {
  const blocks: SceneBlock[] = [];
  let current: SceneBlock = { heading: "", narration: [], dialogue: [], cues: [] };
  let any = false;

  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("<!--") || line.startsWith("# ")) continue;
    if (line.startsWith("## ")) {
      if (any) blocks.push(current);
      current = { heading: line.replace(/^##\s*/, ""), narration: [], dialogue: [], cues: [] };
      any = true;
      continue;
    }
    if (/^\[(SOUND|MUSIC|VIDEO PROMPT)/i.test(line)) {
      current.cues.push(line);
      continue;
    }
    const dm = line.match(/^([\u0900-\u097F][\u0900-\u097F .'\"]*)\s*:\s*(.+)$/);
    if (dm && !line.includes("...—")) {
      current.dialogue.push({ name: dm[1], line: dm[2] });
      continue;
    }
    current.narration.push(line);
    any = true;
  }
  if (any) blocks.push(current);
  return blocks;
}

function ScriptReader({ md, folder, canLint }: { md: string; folder: string; canLint: boolean }) {
  const blocks = useMemo(() => parseScript(md), [md]);
  return (
    <div className="paper">
      {blocks.map((b, i) => (
        <section key={i}>
          {b.heading && <h3 className="scene-h">{b.heading}</h3>}
          {b.cues.map((c, j) => (
            <p key={`c${j}`} className="cue">{c}</p>
          ))}
          {b.narration.map((n, j) => (
            <p key={`n${j}`}>{n}</p>
          ))}
          {b.dialogue.map((d, j) => (
            <p key={`d${j}`} className="dline">
              <span className="dname">{d.name}</span>
              <span>— </span>
              {d.line}
            </p>
          ))}
        </section>
      ))}
      <LintPanel folder={folder} available={canLint} />
    </div>
  );
}

// ---- prompts parsing (003_prompts.md) ----

type PromptItem = {
  id: string;
  isRef: boolean;
  text: string;
  video?: { why: string; body: string };
};

function parsePrompts(md: string): PromptItem[] {
  const items: PromptItem[] = [];
  const lines = md.split(/\r?\n/);
  let cur: PromptItem | null = null;
  let inVideo = false;

  const flush = () => {
    if (cur && cur.text.trim()) items.push(cur);
    cur = null;
    inVideo = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^-\s+\*\*(.+?)\*\*\s*\|?\s*(.*)$/);
    const h2 = line.match(/^##\s+(.+)/);

    const videoBullet = line.match(/^\s*-\s+\*\*\[VIDEO PROMPT\]\*\*\s+\*\((.+?)\)\*\s*:?\s*(.*)$/);
    if (videoBullet) {
      if (cur) {
        cur.video = { why: videoBullet[1], body: "" };
        (cur as PromptItem & { _videoLines?: string[] })._videoLines = videoBullet[2] ? [videoBullet[2]] : [];
        inVideo = true;
      }
      continue;
    }

    if (h2 && /REFERENCE/i.test(h2[1])) {
      flush();
      continue;
    }
    if (bullet) {
      flush();
      const label = bullet[1];
      let rest = bullet[2];
      const videoIdx = rest.indexOf("**[VIDEO PROMPT]**");
      let video: PromptItem["video"];
      if (videoIdx !== -1) {
        const after = rest.slice(videoIdx);
        const why = after.match(/\*\((.+?)\)\*/)?.[1] ?? "important scene";
        const bodyLines: string[] = [];
        inVideo = true;
        video = { why, body: "" };
        rest = rest.slice(0, videoIdx);
        cur = { id: label, isRef: label.startsWith("RS-"), text: rest.trim(), video };
        (cur as PromptItem & { _videoLines?: string[] })._videoLines = bodyLines;
        continue;
      }
      cur = { id: label, isRef: label.startsWith("RS-"), text: rest.trim() };
      continue;
    }
    if (inVideo && cur?.video) {
      if (/^\s*-\s/.test(line) && !line.includes("VIDEO PROMPT")) {
        // stray bullet inside video body — keep
      }
      const holder = cur as PromptItem & { _videoLines?: string[] };
      if (line && !line.startsWith("#") && !/^---$/.test(line)) {
        holder._videoLines = holder._videoLines || [];
        holder._videoLines.push(line);
      }
      continue;
    }
    if (cur) {
      cur.text += "\n" + line;
    }
  }
  flush();

  return items.map((it) => {
    const holder = it as PromptItem & { _videoLines?: string[] };
    if (holder._videoLines && it.video) {
      it.video.body = holder._videoLines.join("\n").trim();
    }
    return it;
  });
}

function PromptsView({ md }: { md: string }) {
  const items = useMemo(() => parsePrompts(md), [md]);
  if (items.length === 0) return <div className="empty">No prompts found in 003_prompts.md</div>;

  const refs = items.filter((i) => i.isRef);
  const frames = items.filter((i) => !i.isRef);

  return (
    <div>
      {refs.length > 0 && (
        <>
          <div className="scene-h" style={{ margin: "1.2rem 0 0.2rem" }}>Reference sheets — generate first</div>
          <div className="promptgrid">
            {refs.map((p) => (
              <div className="promptcard promptcard--ref" key={p.id}>
                <div>
                  <div className="promptcard__id">{p.id}</div>
                  <div className="promptcard__text">{p.text}</div>
                </div>
                <CopyButton text={p.text} />
              </div>
            ))}
          </div>
        </>
      )}
      <div className="scene-h" style={{ margin: "1.4rem 0 0.2rem" }}>Scene frames</div>
      <div className="promptgrid">
        {frames.map((p) => (
          <div className="promptcard" key={p.id}>
            <div>
              <div className="promptcard__id">
                {p.id}
                {p.video && <span className="vp-tag">VIDEO PROMPT</span>}
              </div>
              <div className="promptcard__text">{p.text}</div>
              {p.video?.body && (
                <div style={{ marginTop: "0.6rem" }}>
                  <div className="promptcard__why">{p.video.why}</div>
                  <div className="promptcard__text">{p.video.body}</div>
                  <div style={{ marginTop: "0.4rem" }}>
                    <CopyButton text={p.video.body} label="Copy video prompt" />
                  </div>
                </div>
              )}
            </div>
            <CopyButton text={p.text} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- pipeline parsing (002_pipeline.md) ----

type PipelineBlock =
  | { type: "section"; heading: string }
  | { type: "sub"; heading: string }
  | { type: "para"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "pre"; text: string };

function parsePipeline(md: string): PipelineBlock[] {
  const blocks: PipelineBlock[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  let pre: string[] | null = null;
  let table: string[][] | null = null;

  const flush = () => {
    if (para.length) {
      blocks.push({ type: "para", text: para.join("\n") });
      para = [];
    }
    if (list) {
      blocks.push({ type: "list", items: list });
      list = null;
    }
    if (table) {
      blocks.push({ type: "table", rows: table });
      table = null;
    }
  };

  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trimEnd();

    if (pre !== null) {
      if (/^```/.test(line.trim())) {
        blocks.push({ type: "pre", text: pre.join("\n") });
        pre = null;
      } else {
        pre.push(line);
      }
      continue;
    }
    if (/^```/.test(line.trim())) {
      flush();
      pre = [];
      continue;
    }

    const t = line.trim();
    if (!t || /^---+$/.test(t)) {
      flush();
      continue;
    }
    if (/^#\s/.test(t)) continue; // page title — storyhead already shows it

    const h2 = t.match(/^##\s+(.+)$/);
    if (h2) {
      flush();
      blocks.push({ type: "section", heading: h2[1] });
      continue;
    }

    if (t.startsWith("|")) {
      const cells = t.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (cells.every((c) => /^[-: ]*$/.test(c))) continue; // separator row
      if (!table) {
        flush();
        table = [];
      }
      table.push(cells);
      continue;
    }

    if (/^[-•]\s+/.test(t)) {
      flush();
      if (!list) list = [];
      list.push(t.replace(/^[-•]\s+/, ""));
      continue;
    }

    flush();
    const sub = t.match(/^\*\*(.+?)\*\*\s*:?\s*$/);
    if (sub && !t.includes("**→") && !/→/.test(t)) {
      blocks.push({ type: "sub", heading: sub[1] });
    } else {
      para.push(t);
    }
  }
  flush();
  return blocks;
}

// render inline **bold** and `code` in pipeline text
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <code key={i}>{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

function PipelineView({ md }: { md: string }) {
  const blocks = useMemo(() => parsePipeline(md), [md]);
  if (blocks.length === 0) return <div className="empty">Pipeline file is empty.</div>;

  return (
    <div className="paper">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "section":
            return <h3 key={i} className="scene-h">{b.heading}</h3>;
          case "sub":
            return <h4 key={i} className="pipe-sub">{inline(b.heading)}</h4>;
          case "para":
            return <p key={i} className="pipe-para">{inline(b.text)}</p>;
          case "list":
            return (
              <ul key={i} className="pipe-list">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            );
          case "table":
            return (
              <table key={i} className="tracker-table pipe-table">
                <tbody>
                  {b.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((c, k) =>
                        j === 0 ? <th key={k}>{inline(c)}</th> : <td key={k}>{inline(c)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case "pre":
            return <pre key={i} className="pipe-pre">{b.text}</pre>;
        }
      })}
    </div>
  );
}

export default function StoryTabs({
  number,
  folder,
  files,
  canLint = true,
}: {
  number: string;
  folder: string;
  files: StoryFile[];
  canLint?: boolean;
}) {
  const scriptFiles = files.filter((f) => f.kind === "script");
  const promptsFile = files.find((f) => f.kind === "prompts");
  const pipelineFile = files.find((f) => f.kind === "pipeline");

  const [part, setPart] = useState(1);

  const activeScript = scriptFiles.find((f) => f.part === part) ?? scriptFiles[0];

  return (
    <Tabs defaultValue="script">
      <TabsList>
        <TabsTrigger value="script">
          <FileText /> Script{scriptFiles.length > 1 ? ` (${part}/${scriptFiles.length})` : ""}
        </TabsTrigger>
        {promptsFile && (
          <TabsTrigger value="prompts">
            <Sparkles /> Prompts
          </TabsTrigger>
        )}
        {pipelineFile && (
          <TabsTrigger value="pipeline">
            <Film /> Pipeline
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="script">
        {scriptFiles.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {scriptFiles.map((f) => (
              <Button
                key={f.part}
                variant={f.part === part ? "default" : "outline"}
                size="sm"
                onClick={() => setPart(f.part ?? 1)}
              >
                Part {f.part}
              </Button>
            ))}
          </div>
        )}
        <motion.div
          key={activeScript?.file ?? "script"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {activeScript && <ScriptReader md={activeScript.content} folder={folder} canLint={canLint} />}
        </motion.div>
      </TabsContent>

      {promptsFile && (
        <TabsContent value="prompts">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <PromptsView md={promptsFile.content} />
          </motion.div>
        </TabsContent>
      )}

      {pipelineFile && (
        <TabsContent value="pipeline">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <PipelineView md={pipelineFile.content} />
          </motion.div>
        </TabsContent>
      )}
    </Tabs>
  );
}
