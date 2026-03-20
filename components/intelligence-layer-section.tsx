"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TerminalLine = { text: string; type: "cmd" | "out" | "pipe" | "blank" }
type WinState = "open" | "minimized" | "maximized" | "closed"

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BOOT_SEQUENCE: TerminalLine[] = [
  { text: "$ python pipeline.py --mode=autonomous", type: "cmd" },
  { text: "> Loading LangGraph state machine... OK", type: "out" },
  { text: "$ from krishak import RAGEngine, QdrantStore", type: "cmd" },
  { text: "> Vector store: 12,847 embeddings loaded — 3s latency", type: "out" },
  { text: "$ eva.classify_email(inbox, model=\"qwen3-32b\")", type: "cmd" },
  { text: "> Classified 47 emails — accuracy: 92% — drafts queued", type: "out" },
]

const SYSTEM_RESPONSES: Record<string, TerminalLine[]> = {
  krishak: [
    { text: "$ load krishak", type: "cmd" },
    { text: "> Initializing RAG pipeline...", type: "out" },
    { text: "> Qdrant vector store: connected", type: "out" },
    { text: "> Twilio SMS gateway: active", type: "out" },
    { text: "> Dual-LLM router: GPT-3.5 / GPT-4 online", type: "out" },
    { text: "> Coverage: 36 states | Latency: 3s | Cost: -60%", type: "out" },
    { text: "QUERY ──► EMBED ──► QDRANT SEARCH ──► LLM ROUTER ──► SMS RESPONSE", type: "pipe" },
  ],
  eva: [
    { text: "$ load eva", type: "cmd" },
    { text: "> OAuth 2.0: Google + Microsoft connected", type: "out" },
    { text: "> Fernet encryption: active", type: "out" },
    { text: "> LangGraph email agent: running", type: "out" },
    { text: "> Classification accuracy: 92% | User satisfaction: 4.8/5", type: "out" },
    { text: "INGEST ──► CLASSIFY ──► SUMMARIZE ──► DRAFT ──► HUMAN REVIEW ──► DONE", type: "pipe" },
  ],
  blogempire: [
    { text: "$ load blogempire", type: "cmd" },
    { text: "> NewsData.io + NewsAPI + TheNewsAPI: connected", type: "out" },
    { text: "> Qwen3-32B via Groq: loaded", type: "out" },
    { text: "> Scheduler: 08:00 topics | 09:00 auto-generate", type: "out" },
    { text: "> Duplicate detector: vector similarity active", type: "out" },
    { text: "NEWS INTEL ──► SCOUT ──► WRITER ──► REVISOR ──► PUBLISHER ──► DEV.TO / HASHNODE", type: "pipe" },
  ],
  agentx: [
    { text: "$ load agentx", type: "cmd" },
    { text: "> Legal intelligence backend: online", type: "out" },
    { text: "> Contract review agent: ready", type: "out" },
    { text: "> Risk analysis agent: ready", type: "out" },
    { text: "> Compliance checker: ready", type: "out" },
    { text: "> Supabase/Postgres: connected", type: "out" },
    { text: "INPUT ──► ORCHESTRATOR ──► CONTRACT REVIEW ──► RISK ANALYSIS ──► COMPLIANCE ──► REPORT", type: "pipe" },
  ],
  help: [
    { text: "$ help", type: "cmd" },
    { text: "> Available systems: krishak | eva | blogempire | agentx", type: "out" },
    { text: "> Type a system name to initialize it.", type: "out" },
  ],
}

const SKILLS = [
  { label: "NLP", value: 96 },
  { label: "Multi-Agent", value: 91 },
  { label: "RAG Systems", value: 88 },
  { label: "LLM Ops", value: 84 },
]

const TOKENS = [
  { word: "build", high: true },
  { word: "with", high: false },
  { word: "ai", high: true },
  { word: "agents", high: true },
  { word: "that", high: false },
  { word: "reason", high: true },
  { word: "and", high: false },
  { word: "act", high: true },
  { word: "autonomously", high: true },
]

const EMBEDDINGS = [
  { label: "LangGraph", value: 0.96 },
  { label: "RAG", value: 0.91 },
  { label: "Agents", value: 0.88 },
  { label: "FastAPI", value: 0.82 },
  { label: "Embeddings", value: 0.79 },
  { label: "Qwen3", value: 0.74 },
]

const PIPELINE_NODES = [
  { label: "NEWS INTEL", status: "fetching live news..." },
  { label: "SCOUT", status: "scouting topic..." },
  { label: "WRITER", status: "writing 1800-word draft..." },
  { label: "REVISOR", status: "fact-checking..." },
  { label: "PUBLISHER", status: "publishing..." },
  { label: "DEV.TO / HASHNODE", status: "syndication complete ✓" },
]

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── TERMINAL ICON SVG ────────────────────────────────────────────────────────
function TerminalIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

// ─── TERMINAL WINDOW ──────────────────────────────────────────────────────────
function FloatingTerminal({
  winState,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
}: {
  winState: WinState
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onRestore: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [lines, setLines] = useState<TerminalLine[]>([])
  const [inputVal, setInputVal] = useState("")
  const [booted, setBooted] = useState(false)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Drag state (disabled when maximized)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  // Resize state
  const [size, setSize] = useState({ w: 680, h: 480 })
  const [resizing, setResizing] = useState(false)
  const resizeStart = useRef({ mx: 0, my: 0, ow: 0, oh: 0 })

  const scrollToBottom = useCallback(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  const typeLines = useCallback(async (newLines: TerminalLine[]) => {
    setTyping(true)
    for (const line of newLines) {
      if (line.type === "blank") {
        setLines((prev) => [...prev, line])
        await sleep(100)
        continue
      }
      let typed = ""
      for (const char of line.text.split("")) {
        typed += char
        setLines((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.type === line.type && last.text === typed.slice(0, -1)) {
            updated[updated.length - 1] = { ...line, text: typed }
          } else {
            updated.push({ ...line, text: typed })
          }
          return updated
        })
        await sleep(line.type === "cmd" ? 26 : 10)
      }
      setLines((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...line, text: line.text }
        return updated
      })
      await sleep(line.type === "cmd" ? 320 : 180)
      scrollToBottom()
    }
    setTyping(false)
  }, [scrollToBottom])

  useEffect(() => {
    const t = setTimeout(async () => {
      await typeLines(BOOT_SEQUENCE)
      setBooted(true)
    }, 400)
    return () => clearTimeout(t)
  }, [typeLines])

  useEffect(() => {
    if (winState === "open" || winState === "maximized") {
      // Small delay to allow framer-motion layout anim to start before focusing
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [winState])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = inputVal.trim()
    const cLow = cmd.toLowerCase()
    setInputVal("")
    if (!cmd) return

    if (cLow === "clear" || cLow === "cls" || cLow === "reset") {
      setLines([])
      return
    }

    if (cLow.startsWith("query ->") || cLow.startsWith("query->")) {
      const userMsg = cmd.replace(/^query\s*->\s*/i, "").trim()
      if (!userMsg) return
      
      const newLines: TerminalLine[] = [
        { text: `$ ${cmd}`, type: "cmd" },
        { text: "> Contacting Groq LLM agent...", type: "out" }
      ]
      setLines(prev => [...prev, ...newLines])
      scrollToBottom()
      setTyping(true)
      
      try {
        const response = await fetch("https://portfolio-chatbot-8isd.onrender.com/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Answer this query concisely for a terminal interface: " + userMsg, history: [] }),
        })
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        const cleanedResponse = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
        
        await typeLines([{ text: "> " + cleanedResponse, type: "out" }])
      } catch (err) {
        await typeLines([{ text: "> Error: LLM agent unreachable.", type: "out" }])
      } finally {
        setTyping(false)
      }
      return
    }

    if (SYSTEM_RESPONSES[cLow]) {
      await typeLines(SYSTEM_RESPONSES[cLow])
    } else {
      // Echo their command back to feel interactive
      await typeLines([
        { text: `$ ${cmd}`, type: "cmd" },
        { text: `> ${cmd}: command executed.`, type: "out" },
      ])
    }
  }, [inputVal, typeLines])

  // Prevent page scroll when mouse is inside terminal
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation()
  }, [])

  // Drag handlers (disabled when maximized)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (winState === "maximized") return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }
  }, [pos, winState])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      setPos({
        x: dragStart.current.ox + e.clientX - dragStart.current.mx,
        y: dragStart.current.oy + e.clientY - dragStart.current.my,
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [dragging])

  useEffect(() => {
    if (!resizing) return
    const onMove = (e: MouseEvent) => {
      setSize({
        w: Math.max(300, resizeStart.current.ow + e.clientX - resizeStart.current.mx),
        h: Math.max(200, resizeStart.current.oh + e.clientY - resizeStart.current.my),
      })
    }
    const onUp = () => setResizing(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [resizing])

  // Only render on client to safely use document.body for portal
  if (!mounted) return null

  const isMinimized = winState === "minimized"
  const isMaximized = winState === "maximized"

  // We define strictly formatted variants for framer-motion layout
  const variants = {
    closed: { opacity: 0, scale: 0.9, pointerEvents: "none" as const },
    open: {
      opacity: 1,
      scale: 1,
      top: `calc(50vh - ${size.h / 2}px + ${pos.y}px)`,
      left: `calc(50vw - ${size.w / 2}px + ${pos.x}px)`,
      width: size.w,
      height: size.h,
      borderRadius: 12,
      pointerEvents: "auto" as const,
      boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px #c8963e12, 0 0 60px #c8963e0a",
    },
    maximized: {
      opacity: 1,
      scale: 1,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      pointerEvents: "auto" as const,
      boxShadow: "none",
    },
    minimized: {
      opacity: 1,
      scale: 1,
      top: "calc(100vh - 60px)",
      left: "calc(100vw - 280px)",
      width: 260,
      height: 44,
      borderRadius: 10,
      pointerEvents: "auto" as const,
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    }
  }
  
  // Note: we calculate bottom right via top/left formulas so we don't jump CSS properties mid-animation

  return createPortal(
    <AnimatePresence>
      {winState !== "closed" && (
        <motion.div
          onWheel={handleWheel}
          initial="closed"
          animate={isMaximized ? "maximized" : isMinimized ? "minimized" : "open"}
          exit="closed"
          variants={variants}
          transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
          style={{
            position: "fixed",
            zIndex: 2147483647,
            overflow: "hidden",
            border: isMaximized ? "none" : "1px solid #2a2a20",
            background: "#070705",
            userSelect: dragging ? "none" : "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title bar */}
          <div
            onMouseDown={onMouseDown}
            style={{
              background: isMaximized ? "#0c0c09" : "#0e0e0b",
              borderBottom: isMinimized ? "none" : "1px solid #1e1e16",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: isMaximized ? "default" : dragging ? "grabbing" : "grab",
              flexShrink: 0,
              height: 44,
            }}
          >
            {/* Traffic lights */}
            {/* RED — Close */}
            <button
              onClick={(e) => { 
                e.stopPropagation()
                console.log("[Terminal] CLOSE button clicked")
                onClose() 
              }}
              title="Close"
              style={{
                width: 12, height: 12, borderRadius: "50%",
                background: "#ff5f57", border: "none", cursor: "pointer",
                flexShrink: 0, transition: "filter 0.15s", position: "relative",
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.25) saturate(1.3)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
            />
            {/* YELLOW — Minimize */}
            <button
              onClick={(e) => { 
                e.stopPropagation()
                console.log("[Terminal] MINIMIZE button clicked, current state:", winState)
                isMinimized ? onRestore() : onMinimize() 
              }}
              title={isMinimized ? "Restore" : "Minimize"}
              style={{
                width: 12, height: 12, borderRadius: "50%",
                background: "#febc2e", border: "none", cursor: "pointer",
                flexShrink: 0, transition: "filter 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.25) saturate(1.3)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
            />
            {/* GREEN — Fullscreen / Restore */}
            <button
              onClick={(e) => { 
                e.stopPropagation()
                console.log("[Terminal] MAXIMIZE button clicked, current state:", winState)
                isMaximized ? onRestore() : onMaximize() 
              }}
              title={isMaximized ? "Restore Window" : "Fullscreen"}
              style={{
                width: 12, height: 12, borderRadius: "50%",
                background: "#28c840", border: "none", cursor: "pointer",
                flexShrink: 0, transition: "filter 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.25) saturate(1.3)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
            />

            <div style={{ flex: 1, textAlign: "center", marginLeft: -36, pointerEvents: "none" }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555", whiteSpace: "nowrap" }}>
                {isMinimized ? "pipeline.py — minimized" : "ARKAPRABHA@AI-SYSTEMS ~ pipeline.py"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#c8963e" }}>
              <TerminalIcon size={13} />
            </div>
          </div>

          {/* Body — faded out when minimized */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
              >
                {/* Output */}
                <div
                  ref={outputRef}
                  onClick={() => inputRef.current?.focus()}
                  style={{
                    padding: "16px",
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    cursor: "text",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#2a2a20 transparent",
                  }}
                >
                  {lines.map((line, i) => (
                    <div key={i}>
                      {line.type === "pipe" ? (
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            marginTop: 8,
                            marginBottom: 4,
                            padding: "8px 10px",
                            borderRadius: 6,
                            background: "#0f0e08",
                            border: "1px solid #2a2a20",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          {line.text.split("──►").map((node, ni, arr) => (
                            <span key={ni} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontFamily: "monospace",
                                  fontWeight: 600,
                                  background: "#1a0f00",
                                  color: "#c8963e",
                                  border: "1px solid #c8963e40",
                                }}
                              >
                                {node.trim()}
                              </span>
                              {ni < arr.length - 1 && (
                                <span style={{ color: "#444" }}>──►</span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            lineHeight: 1.7,
                            color: line.type === "cmd" ? "#c8963e" : "#888",
                            margin: 0,
                          }}
                        >
                          {line.text}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Cursor */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    {booted && !typing && (
                      <>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#c8963e" }}>$&nbsp;</span>
                        <span
                          style={{
                            display: "inline-block",
                            width: 7,
                            height: 14,
                            background: "#c8963e",
                            animation: "termBlink 1.1s step-end infinite",
                          }}
                        />
                      </>
                    )}
                    {typing && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 14,
                          background: "#c8963e",
                          animation: "termBlink 0.6s step-end infinite",
                        }}
                      />
                    )}
                  </div>
                  <div ref={bottomRef} />
                </div>

                {/* Input row */}
                {booted && (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      borderTop: "1px solid #1e1e16",
                      background: "#080806",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#c8963e" }}>$</span>
                    <input
                      ref={inputRef}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      disabled={typing}
                      placeholder={
                        typing
                          ? "system running..."
                          : "type krishak / eva / blogempire / agentx / help"
                      }
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#c8963e",
                        caretColor: "#c8963e",
                        opacity: typing ? 0.4 : 1,
                      }}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </form>
                )}

                {/* Resize Handle */}
                {!isMaximized && (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setResizing(true)
                      resizeStart.current = { mx: e.clientX, my: e.clientY, ow: size.w, oh: size.h }
                    }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 16,
                      height: 16,
                      cursor: "nwse-resize",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "flex-end",
                      padding: 4,
                      opacity: 0.5,
                      zIndex: 10
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#c8963e" strokeWidth="1">
                      <line x1="10" y1="0" x2="0" y2="10" />
                      <line x1="10" y1="5" x2="5" y2="10" />
                    </svg>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── SKILL BARS ───────────────────────────────────────────────────────────────
function SkillBars() {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "#1a1a14" }}>
      {SKILLS.map((skill) => (
        <div key={skill.label} className="p-5" style={{ background: "#0a0a08" }}>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#888" }}>
              {skill.label}
            </span>
            <span className="font-mono text-[11px]" style={{ color: "#c8963e" }}>
              {skill.value}%
            </span>
          </div>
          <div className="h-[2px] rounded-full" style={{ background: "#1a1a14" }}>
            <div
              className="h-full rounded-full transition-all duration-[1.4s] ease-out"
              style={{
                width: inView ? `${skill.value}%` : "0%",
                background: "linear-gradient(90deg, #c8963e, #e8b86e)",
                boxShadow: inView ? "0 0 8px #c8963e80" : "none",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── TOKEN ATTENTION ──────────────────────────────────────────────────────────
function TokenAttention() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="p-6 border" style={{ borderColor: "#2a2a20", background: "#080807" }}>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "#555" }}>
        Token Attention
      </span>
      <div className="mt-4 flex flex-wrap gap-2">
        {TOKENS.map((token, i) => (
          <span
            key={i}
            className="font-mono text-sm px-2 py-1 rounded transition-all"
            style={{
              transitionDelay: `${1800 + i * 120}ms`,
              transitionDuration: "0.5s",
              background: visible ? (token.high ? "#1a0f00" : "transparent") : "transparent",
              color: visible ? (token.high ? "#c8963e" : "#333") : "#333",
              border: visible && token.high ? "1px solid #c8963e30" : "1px solid transparent",
              boxShadow: visible && token.high ? "0 0 8px #c8963e20" : "none",
              opacity: visible ? 1 : 0,
            }}
          >
            {token.word}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── SEMANTIC EMBEDDINGS ──────────────────────────────────────────────────────
function SemanticEmbeddings() {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="p-6 border h-full" style={{ borderColor: "#2a2a20", background: "#080807" }}>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "#555" }}>
        Semantic Embeddings
      </span>
      <div className="mt-4 space-y-3">
        {EMBEDDINGS.map((emb, i) => (
          <div key={emb.label} className="flex items-center gap-3">
            <span className="font-mono text-[10px] w-20 shrink-0" style={{ color: "#888" }}>
              {emb.label}
            </span>
            <div className="flex-1 h-[2px] rounded-full" style={{ background: "#1a1a14" }}>
              <div
                className="h-full rounded-full transition-all ease-out"
                style={{
                  width: inView ? `${emb.value * 100}%` : "0%",
                  transitionDuration: "1.2s",
                  transitionDelay: `${2000 + i * 120}ms`,
                  background: "linear-gradient(90deg, #c8963e80, #c8963e)",
                }}
              />
            </div>
            <span className="font-mono text-[10px] w-8 text-right shrink-0" style={{ color: "#555" }}>
              {emb.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── LIVE AGENT PIPELINE ──────────────────────────────────────────────────────
function LiveAgentPipeline() {
  const [activeNode, setActiveNode] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % PIPELINE_NODES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 border" style={{ borderColor: "#2a2a20", background: "#080807" }}>
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "#555" }}>
          Live Agent — Blog Empire Pipeline
        </span>
        <span
          className="font-mono text-[10px] px-2 py-[2px] rounded"
          style={{ background: "#1a0f00", color: "#c8963e", border: "1px solid #c8963e30" }}
        >
          ● LIVE
        </span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {PIPELINE_NODES.map((node, i) => {
          const isActive = i === activeNode
          const isDone = i < activeNode
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="font-mono text-[10px] px-3 py-2 rounded transition-all duration-500"
                style={{
                  border: isActive ? "1px solid #c8963e" : "1px solid #2a2a20",
                  color: isActive ? "#c8963e" : isDone ? "#555" : "#444",
                  background: isActive ? "#1a0f00" : "transparent",
                  animation: isActive ? "intelligencePulse 1s ease-in-out infinite" : "none",
                  boxShadow: isActive ? "0 0 12px #c8963e30" : "none",
                }}
              >
                {node.label}
              </div>
              {i < PIPELINE_NODES.length - 1 && (
                <span className="font-mono text-[11px]" style={{ color: isDone ? "#c8963e40" : "#2a2a20" }}>
                  ──►
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-block w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: "#c8963e" }} />
        <span className="font-mono text-[11px]" style={{ color: "#888" }}>
          {PIPELINE_NODES[activeNode].status}
        </span>
      </div>
    </div>
  )
}

// ─── TERMINAL LAUNCHER BUTTON ─────────────────────────────────────────────────
function TerminalLauncher({
  winState,
  onOpen,
  onRestore,
}: {
  winState: WinState
  onOpen: () => void
  onRestore: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isClosed = winState === "closed"
  const isMinimized = winState === "minimized"

  return (
    <button
      onClick={isClosed ? onOpen : isMinimized ? onRestore : onRestore}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        border: `1px solid ${hovered ? "#c8963e" : "#2a2a20"}`,
        borderRadius: 8,
        background: hovered ? "#1a0f00" : "#0c0c09",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: hovered ? "0 0 20px #c8963e20" : "none",
        fontFamily: "monospace",
        fontSize: 12,
        color: hovered ? "#c8963e" : "#888",
        outline: "none",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 6,
          background: hovered ? "#c8963e20" : "#1a1a14",
          border: `1px solid ${hovered ? "#c8963e40" : "#2a2a20"}`,
          transition: "all 0.25s ease",
          color: "#c8963e",
        }}
      >
        <TerminalIcon size={14} />
      </span>
      <span>
        {isClosed
          ? "launch pipeline.py"
          : isMinimized
          ? "restore terminal"
          : "terminal open ↗"}
      </span>
      {!isClosed && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#28c840",
            boxShadow: "0 0 6px #28c840",
            animation: "intelligencePulse 1.5s ease-in-out infinite",
          }}
        />
      )}
    </button>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function IntelligenceLayerSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [winState, setWinState] = useState<WinState>("closed")

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateX(0)"
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @keyframes intelligencePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes termBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Floating terminal window — rendered at root level via fixed positioning */}
      <FloatingTerminal
        winState={winState}
        onClose={() => setWinState("closed")}
        onMinimize={() => setWinState("minimized")}
        onMaximize={() => setWinState("maximized")}
        onRestore={() => setWinState("open")}
      />

      <section
        ref={sectionRef}
        id="intelligence"
        className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12"
        style={{ background: "#0a0a08" }}
      >
        {/* Header */}
        <div
          ref={headerRef}
          className="mb-16 flex items-end justify-between"
          style={{
            opacity: 0,
            transform: "translateX(-60px)",
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: "#c8963e" }}>
              01 / Intelligence Layer
            </span>
            <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
              AI SYSTEMS
            </h2>
          </div>
          <p className="hidden md:block max-w-xs font-mono text-xs text-right leading-relaxed" style={{ color: "#555" }}>
            Multi-agent pipelines, LLM orchestration, and production-grade RAG systems.
          </p>
        </div>

        {/* Terminal launcher row */}
        <div className="mb-6 flex items-center gap-4">
          <TerminalLauncher
            winState={winState}
            onOpen={() => setWinState("open")}
            onRestore={() => setWinState("open")}
          />
          {winState !== "closed" && (
            <span className="font-mono text-[11px]" style={{ color: "#555" }}>
              {winState === "minimized" ? "— minimized to bottom right" : "— drag titlebar to move · esc to minimize"}
            </span>
          )}
        </div>

        {/* PART 2 — Skill bars */}
        <div className="mb-6">
          <SkillBars />
        </div>

        {/* PART 3 — Token Attention + Semantic Embeddings */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: "#1a1a14" }}>
          <TokenAttention />
          <SemanticEmbeddings />
        </div>

        {/* PART 4 — Live Agent Pipeline */}
        <LiveAgentPipeline />
      </section>
    </>
  )
}
