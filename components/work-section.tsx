"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// ─── Design tokens (matches globals.css) ─────────────────────────────────────
const ACCENT  = "oklch(0.7 0.2 45)"
const DIM     = "oklch(0.5 0 0)"
const BORDER  = "oklch(0.28 0 0)"
const BG2     = "oklch(0.13 0 0)"
const TEXT     = "oklch(0.9 0 0)"
const MONO    = "IBM Plex Mono, monospace"

// ─── SVG primitives ──────────────────────────────────────────────────────────

function Defs() {
  return (
    <defs>
      <marker id="ah" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
        <polygon points="0 0, 7 2.5, 0 5" fill={DIM} />
      </marker>
    </defs>
  )
}

function Box({
  x, y, w, h, label, sub, accent = false,
}: {
  x: number; y: number; w: number; h: number
  label: string; sub?: string; accent?: boolean
}) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx={0}
        fill={accent ? "oklch(0.7 0.2 45 / 0.09)" : BG2}
        stroke={accent ? ACCENT : BORDER}
        strokeWidth={accent ? 1.5 : 1}
      />
      <text
        x={x + w / 2} y={y + (sub ? h / 2 - 6 : h / 2)}
        textAnchor="middle" dominantBaseline="middle"
        fill={accent ? ACCENT : TEXT} fontSize={11}
        fontFamily={MONO} fontWeight={accent ? "600" : "400"}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2} y={y + h / 2 + 10}
          textAnchor="middle" dominantBaseline="middle"
          fill={DIM} fontSize={9} fontFamily={MONO}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

function Line({ x1, y1, x2, y2, label, lx, ly }: {
  x1: number; y1: number; x2: number; y2: number
  label?: string; lx?: number; ly?: number
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BORDER} strokeWidth={1.5} markerEnd="url(#ah)" />
      {label && (
        <text x={lx ?? (x1 + x2) / 2 + 4} y={ly ?? (y1 + y2) / 2 - 5} fill={DIM} fontSize={9} fontFamily={MONO}>
          {label}
        </text>
      )}
    </g>
  )
}

function Path({ d, label, lx, ly }: { d: string; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={BORDER} strokeWidth={1.5} markerEnd="url(#ah)" />
      {label && (
        <text x={lx ?? 0} y={ly ?? 0} fill={DIM} fontSize={9} fontFamily={MONO}>{label}</text>
      )}
    </g>
  )
}

function Zone({ x, y, w, h, label, color }: {
  x: number; y: number; w: number; h: number; label: string; color: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={0}
        fill={`${color}0a`} stroke={color} strokeWidth={1} strokeDasharray="5 3" />
      <text x={x + 10} y={y + 15} fill={color} fontSize={9} fontFamily={MONO}
        fontWeight="600" letterSpacing="0.12em">
        {label}
      </text>
    </g>
  )
}

// ─── ContextSync AI ───────────────────────────────────────────────────────────
function ContextSyncDiagram() {
  const W = 520
  return (
    <svg viewBox={`0 0 ${W} 590`} width="100%" style={{ display: "block", margin: "0 auto" }}>
      <Defs />

      {/* Chrome Extension */}
      <Box x={145} y={10} w={230} h={72} label="Chrome Extension" sub="Browse · Highlight · Ask AI · Catch Me Up" accent />
      <Line x1={260} y1={82} x2={260} y2={118} />

      {/* FastAPI */}
      <Box x={100} y={118} w={320} h={72} label="FastAPI Backend" sub="Auth · Ingestion · Research Memory · Health" />
      <Line x1={260} y1={190} x2={260} y2={228} />

      {/* Three-way split */}
      <line x1={120} y1={228} x2={400} y2={228} stroke={BORDER} strokeWidth={1.5} />
      <Line x1={120} y1={228} x2={120} y2={264} />
      <Line x1={260} y1={228} x2={260} y2={264} />
      <Line x1={400} y1={228} x2={400} y2={264} />

      {/* Row 1: DB / LangGraph / KGraph */}
      <Box x={30}  y={264} w={170} h={58} label="PostgreSQL" sub="Supabase · pgvector" />
      <Box x={175} y={264} w={170} h={58} label="LangGraph Agent" sub="Bounded multi-step" accent />
      <Box x={320} y={264} w={170} h={58} label="Knowledge Graph" sub="Entities + Conflicts" />

      {/* LangGraph → split to providers */}
      <Line x1={260} y1={322} x2={260} y2={360} />
      <line x1={170} y1={360} x2={350} y2={360} stroke={BORDER} strokeWidth={1.5} />
      <Line x1={170} y1={360} x2={170} y2={396} />
      <Line x1={350} y1={360} x2={350} y2={396} />

      {/* Providers */}
      <Box x={60}  y={396} w={200} h={60} label="Groq / Qwen" sub="Query intent · keyword extract · validate" />
      <Box x={280} y={396} w={190} h={60} label="Google Gemini" sub="Deep synthesis · briefings · embeddings" />

      {/* Merge → Evidence Validator */}
      <Path d="M 160 456 L 160 490 L 260 490 L 260 510" lx={165} ly={472} label="merge" />
      <Path d="M 375 456 L 375 490 L 260 490" />
      <Box x={145} y={510} w={230} h={58} label="Evidence Validator" sub="Grounded Response → Frontend / Extension" accent />

      {/* Supabase Realtime badge (side) */}
      <rect x={430} y={130} width={82} height={46} rx={0}
        fill="oklch(0.7 0.2 45 / 0.06)" stroke="oklch(0.7 0.2 45 / 0.3)" strokeWidth={1} />
      <text x={471} y={147} textAnchor="middle" fill={ACCENT} fontSize={9} fontFamily={MONO}>Supabase</text>
      <text x={471} y={160} textAnchor="middle" fill={DIM}    fontSize={9} fontFamily={MONO}>Realtime</text>
      <text x={471} y={172} textAnchor="middle" fill={DIM}    fontSize={9} fontFamily={MONO}>Collaboration</text>
    </svg>
  )
}

// ─── Aegis Sandbox ────────────────────────────────────────────────────────────
function AegisDiagram() {
  return (
    <svg viewBox="0 0 540 640" width="100%" style={{ display: "block", margin: "0 auto" }}>
      <Defs />

      {/* Trusted Zone */}
      <Zone x={10} y={10} w={520} h={220} label="TRUSTED ZONE — HOST MACHINE" color={ACCENT} />

      <Box x={40}  y={45} w={190} h={68} label="Attacker" sub="Scripted library + LangGraph LLM" accent />
      <Box x={300} y={45} w={210} h={68} label="Judge" sub="State check + LLM secondary review" />

      {/* Attacker → HTTP down */}
      <Line x1={135} y1={113} x2={135} y2={168} label="① craft prompt" lx={140} ly={136} />
      {/* Attacker → HTTP label */}
      <text x={40} y={183} fill={DIM} fontSize={9} fontFamily={MONO}>② POST /chat (HTTP boundary)</text>
      <text x={40} y={197} fill={DIM} fontSize={9} fontFamily={MONO}>⑦ compare reply text vs DB state</text>

      {/* Judge → direct read arrow down (long) */}
      <Line x1={405} y1={113} x2={405} y2={310} label="direct DB read" lx={410} ly={200} />

      {/* Untrusted Zone */}
      <Zone x={10} y={240} w={520} h={260} label="UNTRUSTED ZONE — DOCKER SANDBOX" color="oklch(0.55 0.15 220)" />

      <Box x={35}  y={275} w={210} h={78} label="Target Agent" sub="LangGraph ReAct · Groq · no internet · read-only FS" />
      <Box x={295} y={275} w={215} h={78} label="Mock Banking API" sub="FastAPI + SQLite · ephemeral · ground truth" />

      {/* Target → Mock (tool calls) */}
      <Line x1={245} y1={314} x2={295} y2={314} label="tool calls" lx={250} ly={307} />

      {/* Attacker → Target */}
      <Line x1={135} y1={168} x2={135} y2={275} />

      {/* annotations */}
      <text x={35}  y={365} fill={DIM} fontSize={8.5} fontFamily={MONO}>⚠ reply text ≠ ground truth (see F-003)</text>
      <text x={295} y={365} fill={DIM} fontSize={8.5} fontFamily={MONO}>balance / transfer state = proof of breach</text>

      {/* Findings table */}
      <rect x={10} y={516} width={520} height={116} rx={0} fill={BG2} stroke={BORDER} strokeWidth={1} />
      <text x={270} y={534} textAnchor="middle" fill={ACCENT} fontSize={10}
        fontFamily={MONO} fontWeight="600" letterSpacing="0.08em">
        CONFIRMED FINDINGS — openai/gpt-oss-120b via Groq
      </text>
      {/* header row */}
      {["ID","Finding","OWASP","Sev","Hit%"].map((h,i) => (
        <text key={h} x={[22,72,350,420,480][i]} y={548} fill={DIM} fontSize={9} fontFamily={MONO}>{h}</text>
      ))}
      <line x1={18} y1={552} x2={522} y2={552} stroke={BORDER} strokeWidth={0.75} />
      {[
        ["F-001","Context-Poisoned Auth",         "LLM01+06","High",    "~50%"],
        ["F-002","Recipient Semantic Reframe",     "LLM06",   "High",   "~40%"],
        ["F-003","Tool-Call-Before-Reasoning ⚠",  "LLM06",   "CRIT",   "~20%"],
        ["F-004","System Prompt Leakage",          "LLM07",   "High",  "~100%"],
      ].map(([id, name, owasp, sev, prob], i) => {
        const isCrit = sev === "CRIT"
        return (
          <g key={id}>
            <text x={22}  y={566 + i * 14} fill={isCrit ? ACCENT : DIM}             fontSize={9} fontFamily={MONO}>{id}</text>
            <text x={72}  y={566 + i * 14} fill={isCrit ? ACCENT : TEXT}             fontSize={9} fontFamily={MONO}>{name}</text>
            <text x={350} y={566 + i * 14} fill={DIM}                                fontSize={9} fontFamily={MONO}>{owasp}</text>
            <text x={420} y={566 + i * 14} fill={isCrit ? ACCENT : DIM}              fontSize={9} fontFamily={MONO}>{sev}</text>
            <text x={480} y={566 + i * 14} fill={DIM}                                fontSize={9} fontFamily={MONO}>{prob}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Baton ────────────────────────────────────────────────────────────────────
function BatonDiagram() {
  return (
    <svg viewBox="0 0 500 760" width="100%" style={{ display: "block", margin: "0 auto" }}>
      <Defs />

      {/* Entry point */}
      <Box x={140} y={10}  w={220} h={48} label="trigger.py / Scheduler" sub="APScheduler · manual run" />
      <Line x1={250} y1={58} x2={250} y2={90} />

      {/* Scraper Adapter */}
      <Box x={140} y={90}  w={220} h={48} label="Maps Scraper Adapter" sub="adapters/scraper.py" />
      <Line x1={250} y1={138} x2={250} y2={170} />

      {/* Two side boxes */}
      <Box x={20}  y={170} w={170} h={48} label="Maps Scraper" sub="Docker · :8080" />
      <Box x={310} y={170} w={170} h={48} label="tools/scheduler.py" sub="APScheduler jobs" />

      {/* Arrows from scraper adapter to both side boxes then merge */}
      <Path d="M 200 162 L 105 162 L 105 170" />
      <Path d="M 300 162 L 395 162 L 395 170" />
      <Path d="M 105 218 L 105 248 L 250 248 L 250 262" />
      <Path d="M 395 218 L 395 248 L 250 248" />

      {/* LangGraph */}
      <Box x={110} y={262} w={280} h={52} label="LangGraph Workflow" sub="agents/graph.py · agents/supervisor.py" accent />
      <Line x1={250} y1={314} x2={250} y2={350} />

      {/* Pipeline stages — vertical */}
      {[
        ["Cleaner",    "normalize · SHA-256 dedup"],
        ["Enricher",   "Nemotron · tech stack · pain points"],
        ["Qualifier",  "Groq/Qwen · score 0–100"],
        ["Negotiator", "outreach · proposal · HITL queue"],
        ["Reporter",   "summary · conversion event"],
      ].map(([label, sub], i) => {
        const y = 350 + i * 76
        const isQual = label === "Qualifier"
        return (
          <g key={label}>
            <Box x={160} y={y} w={180} h={52} label={label} sub={sub} accent={isQual} />
            {i < 4 && <Line x1={250} y1={y + 52} x2={250} y2={y + 76} />}
          </g>
        )
      })}

      {/* Left sidebar: PostgreSQL */}
      <Box x={10} y={426} w={120} h={52} label="PostgreSQL" sub="Supabase · core/db.py" />
      <Path d="M 160 465 L 90 465 L 90 452 L 10 452" />

      {/* Left sidebar: Streamlit */}
      <Box x={10} y={350} w={120} h={52} label="User Dashboard" sub="Streamlit :8501" />
      <Path d="M 10 376 L 90 376 L 90 452" />

      {/* Right sidebar: HITL */}
      <rect x={370} y={500} width={120} height={52} rx={0}
        fill="oklch(0.7 0.2 45 / 0.07)" stroke={ACCENT} strokeWidth={1.5} />
      <text x={430} y={520} textAnchor="middle" fill={ACCENT} fontSize={10} fontFamily={MONO}>HITL Approval</text>
      <text x={430} y={534} textAnchor="middle" fill={DIM}    fontSize={9}  fontFamily={MONO}>FastAPI /approvals</text>
      <Path d="M 340 527 L 370 527" />

      {/* Right sidebar: Gmail */}
      <Box x={370} y={350} w={120} h={52} label="Gmail SMTP" sub="IMAP · outbox/*.txt" />
      <Path d="M 340 451 L 355 451 L 355 376 L 370 376" />

      {/* LLM provider footer */}
      <rect x={10} y={710} width={480} height={44} rx={0} fill={BG2} stroke={BORDER} strokeWidth={1} />
      <text x={250} y={727} textAnchor="middle" fill={ACCENT} fontSize={10}
        fontFamily={MONO} fontWeight="600" letterSpacing="0.07em">
        core/llm.py — LLM Router
      </text>
      {[
        ["NVIDIA Nemotron", "Enrich · Outreach · Proposal"],
        ["Groq / Qwen3",   "Qualify (structured)"],
        ["Google Gemini",  "Summary · Embedding"],
      ].map(([name, role], i) => (
        <g key={name}>
          <text x={22 + i * 162} y={742} fill={TEXT} fontSize={9}   fontFamily={MONO}>{name}</text>
          <text x={22 + i * 162} y={752} fill={DIM}  fontSize={8.5} fontFamily={MONO}>{role}</text>
        </g>
      ))}
      <Path d="M 250 702 L 250 710" />
    </svg>
  )
}

// ─── Diagram registry ─────────────────────────────────────────────────────────
const archRegistry: Record<string, { title: string; github: string; diagram: React.ReactNode }> = {
  "ContextSync AI": {
    title: "ContextSync AI — System Architecture",
    github: "https://github.com/Arkaprabha13/ContextSync-AI",
    diagram: <ContextSyncDiagram />,
  },
  "Aegis Sandbox": {
    title: "Aegis Sandbox — Threat Model & Attack Loop",
    github: "https://github.com/Arkaprabha13/aegis-sandbox",
    diagram: <AegisDiagram />,
  },
  "Baton": {
    title: "Baton — Autonomous Sales Pipeline",
    github: "https://github.com/Arkaprabha13/Baton",
    diagram: <BatonDiagram />,
  },
}

// ─── Experiment data ──────────────────────────────────────────────────────────
type Experiment = {
  title: string
  medium: string
  description: string
  span: string
  github?: string
  archKey?: string
  tags?: string[]
}

const experiments: Experiment[] = [
  {
    title: "KRISHAK: Agri AI",
    medium: "Hackathon Winner",
    description: "First SMS-based AI advisory system in India for feature phones. 3-second response latency.",
    span: "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
  },
  {
    title: "Multi-Agent RAG",
    medium: "NLP & Search",
    description: "LangChain and FAISS for high-precision retrieval. Reduced query resolution time by 30%.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-1",
  },
  {
    title: "AutoML Agent",
    medium: "MLOps & Meta-Learning",
    description: "Automated architecture orchestration. Explores 50 neural structures in just 3 minutes.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-2",
  },
  {
    title: "DocuGen",
    medium: "Backend Systems",
    description: "FastAPI semantic backend automating codebase documentation. 70% database cost reduction.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-1",
  },
  {
    title: "Secure Banking",
    medium: "Backend Architecture",
    description: "Robust logic utilizing C++/Python for highly secure financial workflow integration.",
    span: "col-span-1 md:col-span-3 row-span-1 md:row-span-1",
  },
  {
    title: "Blog Empire",
    medium: "LangGraph · Multi-Agent Pipeline",
    description: "Autonomous AI blogging platform — Scout→Writer→Revisor→Publisher pipeline. Real-time news from 3 APIs, self-healing SEO, Telegram bot control, auto-publishes to Dev.to & Hashnode.",
    span: "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
  },
  {
    title: "EVA",
    medium: "AI Email Intelligence",
    description: "LangGraph agents for automated email classification, summarization & draft generation. 92% accuracy. OAuth 2.0, Fernet encryption, JWT sessions. Human-in-the-loop review workflow. 4.8/5 satisfaction.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-2",
  },
  {
    title: "AgentX (Euron)",
    medium: "Legal Intelligence · Production",
    description: "Multi-agent legal backend — contract review, risk analysis, compliance checking & redlining. Supabase/Postgres persistence, full auth integration, comprehensive test suite.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-2",
  },
  {
    title: "ContextSync AI",
    medium: "Collaborative Research Memory",
    description: "Browser extension + FastAPI capturing research context. Dual-provider LangGraph agent (Gemini & Groq/Qwen), pgvector semantic search, real-time Supabase workspace sync, knowledge graph & conflict detection.",
    span: "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
    github: "https://github.com/Arkaprabha13/ContextSync-AI",
    archKey: "ContextSync AI",
    tags: ["FastAPI", "LangGraph", "pgvector", "Chrome Extension", "Gemini", "Groq"],
  },
  {
    title: "Aegis Sandbox",
    medium: "LLM Red-Team Platform",
    description: "Autonomous red-team harness deploying a production LLM inside a locked Docker sandbox. Attacks with scripted & adaptive attackers. Found 4 real vulnerabilities (incl. silent tool-call drain) mapped to OWASP LLM Top 10.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-2",
    github: "https://github.com/Arkaprabha13/aegis-sandbox",
    archKey: "Aegis Sandbox",
    tags: ["LangGraph", "Docker", "Groq", "OWASP", "Red-Team"],
  },
  {
    title: "Baton",
    medium: "Autonomous AI Sales Engine",
    description: "End-to-end AI sales pipeline: Google Maps scraping → LLM enrichment (Nemotron) → scoring → Gmail outreach. Human-in-the-loop approval API, Streamlit dashboard, Supabase/Postgres persistence.",
    span: "col-span-1 md:col-span-1 row-span-1 md:row-span-2",
    github: "https://github.com/Arkaprabha13/Baton",
    archKey: "Baton",
    tags: ["LangGraph", "FastAPI", "Nemotron", "Groq", "Gmail", "Supabase"],
  },
]

// ─── Architecture Modal ───────────────────────────────────────────────────────
function ArchModal({ archKey, onClose }: { archKey: string; onClose: () => void }) {
  const entry = archRegistry[archKey]
  if (!entry) return null

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    // Lock scroll on body
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm p-4 pt-6 overflow-y-auto"
      onClick={handleBackdrop}
    >
      {/* Modal panel — NOT flex-shrink, grows with content */}
      <div
        className="relative w-full max-w-2xl border border-accent/40 bg-[oklch(0.08_0_0)] shadow-[0_0_80px_oklch(0.7_0.2_45/0.12)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 px-6 py-4 bg-[oklch(0.08_0_0)]">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">Architecture Diagram</span>
            <h3 className="mt-1 font-[var(--font-bebas)] text-2xl tracking-tight text-foreground">{entry.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors duration-200 border border-border/40 hover:border-accent/60 px-3 py-1 shrink-0"
          >
            [ESC]
          </button>
        </div>

        {/* Diagram — full height, no overflow clip */}
        <div className="p-6 pb-4">
          {entry.diagram}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 border-t border-border/40 px-6 py-4 flex items-center justify-between bg-[oklch(0.08_0_0)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">View Full Source</span>
          <a
            href={entry.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 font-mono text-xs text-accent border border-accent/30 hover:border-accent hover:bg-accent/5 px-4 py-2 transition-all duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="group-hover:tracking-wider transition-all duration-300">GitHub →</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── WorkSection ──────────────────────────────────────────────────────────────
export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const gridRef    = useRef<HTMLDivElement>(null)
  const [activeArch, setActiveArch] = useState<string | null>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )
      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <section ref={sectionRef} id="work" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
        {/* Section header */}
        <div ref={headerRef} className="mb-16 flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Experiments</span>
            <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">SELECTED WORK</h2>
          </div>
          <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
            Studies across interface design, agent systems, and visual computation.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[160px] md:auto-rows-[200px]"
        >
          {experiments.map((experiment, index) => (
            <WorkCard
              key={index}
              experiment={experiment}
              index={index}
              persistHover={false}
              onArchClick={experiment.archKey ? () => setActiveArch(experiment.archKey!) : undefined}
            />
          ))}
        </div>
      </section>

      {activeArch && (
        <ArchModal archKey={activeArch} onClose={() => setActiveArch(null)} />
      )}
    </>
  )
}

// ─── Per-card entrance animation ──────────────────────────────────────────────
function getEntranceStyle(title: string, entered: boolean): React.CSSProperties {
  const base: React.CSSProperties = { transition: "opacity 0.6s ease-out, transform 0.6s ease-out" }
  const t = title.toLowerCase()
  if (t.includes("krishak"))     return { ...base, opacity: entered ? 1 : 0, transform: entered ? "translateX(0)" : "translateX(-48px)" }
  if (t.includes("eva"))         return { ...base, opacity: entered ? 1 : 0, transform: entered ? "scale(1)" : "scale(0.97)", transitionDuration: "0.7s" }
  if (t.includes("blog empire")) return { ...base, opacity: entered ? 1 : 0, transform: entered ? "translateX(0)" : "translateX(48px)" }
  if (t.includes("agentx"))      return { ...base, opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(32px)" }
  if (t.includes("contextsync")) return { ...base, opacity: entered ? 1 : 0, transform: entered ? "translateX(0)" : "translateX(-48px)", transitionDuration: "0.8s" }
  if (t.includes("aegis"))       return { ...base, opacity: entered ? 1 : 0, transform: entered ? "scale(1)" : "scale(0.96)", transitionDuration: "0.75s" }
  if (t.includes("baton"))       return { ...base, opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(40px)", transitionDuration: "0.8s" }
  return { ...base, opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(20px)" }
}

// ─── WorkCard ─────────────────────────────────────────────────────────────────
function WorkCard({
  experiment,
  index,
  persistHover = false,
  onArchClick,
}: {
  experiment: Experiment
  index: number
  persistHover?: boolean
  onArchClick?: () => void
}) {
  const [isHovered, setIsHovered]       = useState(false)
  const cardRef                          = useRef<HTMLElement>(null)
  const [isScrollActive, setIsScrollActive] = useState(false)
  const [entered, setEntered]           = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setEntered(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!persistHover || !cardRef.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top 80%",
        onEnter: () => setIsScrollActive(true),
      })
    }, cardRef)
    return () => ctx.revert()
  }, [persistHover])

  const isActive = isHovered || isScrollActive
  const hasLinks = !!(experiment.github || experiment.archKey)

  return (
    <article
      ref={cardRef}
      style={getEntranceStyle(experiment.title, entered)}
      className={cn(
        "group relative border border-border/40 p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        experiment.span,
        isActive && "border-accent/60",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background */}
      <div className={cn("absolute inset-0 bg-accent/5 transition-opacity duration-500", isActive ? "opacity-100" : "opacity-0")} />

      {/* Title block */}
      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{experiment.medium}</span>
        <h3
          className={cn(
            "mt-3 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight transition-colors duration-300",
            isActive ? "text-accent" : "text-foreground",
          )}
        >
          {experiment.title}
        </h3>
      </div>

      {/* Bottom reveal block */}
      <div className="relative z-10 flex flex-col gap-2">
        <p
          className={cn(
            "font-mono text-xs text-muted-foreground leading-relaxed transition-all duration-500 max-w-[280px]",
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          {experiment.description}
        </p>

        {/* Tech tags */}
        {experiment.tags && (
          <div
            className={cn("flex flex-wrap gap-1 transition-all duration-500", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}
            style={{ transitionDelay: isActive ? "60ms" : "0ms" }}
          >
            {experiment.tags.map((tag) => (
              <span key={tag} className="font-mono text-[9px] uppercase tracking-wider text-accent/60 border border-accent/20 px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action links */}
        {hasLinks && (
          <div
            className={cn("flex items-center gap-3 transition-all duration-500", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}
            style={{ transitionDelay: isActive ? "120ms" : "0ms" }}
          >
            {experiment.archKey && (
              <button
                onClick={(e) => { e.stopPropagation(); onArchClick?.() }}
                className="group/btn flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent border border-accent/30 hover:border-accent hover:bg-accent/10 px-2.5 py-1 transition-all duration-300"
              >
                {/* node-graph icon */}
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                  <rect x="1" y="1" width="6" height="4" />
                  <rect x="9" y="1" width="6" height="4" />
                  <rect x="4" y="11" width="8" height="4" />
                  <line x1="4" y1="3" x2="9" y2="3" />
                  <line x1="8" y1="13" x2="8" y2="5" />
                </svg>
                <span className="group-hover/btn:tracking-widest transition-all duration-300">Architecture</span>
              </button>
            )}

            {experiment.github && (
              <a
                href={experiment.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="group/gh flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent border border-border/40 hover:border-accent/50 px-2.5 py-1 transition-all duration-300"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span className="group-hover/gh:tracking-widest transition-all duration-300">Source</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Index marker */}
      <span className={cn("absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300", isActive ? "text-accent" : "text-muted-foreground/40")}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Corner accent */}
      <div className={cn("absolute top-0 right-0 w-12 h-12 transition-all duration-500", isActive ? "opacity-100" : "opacity-0")}>
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}
