"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

type Message = {
    role: "user" | "assistant"
    content: string
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm Arka AI. I represent Arkaprabha. How can I help you today?"
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput("")
        setMessages((prev) => [...prev, { role: "user", content: userMsg }])
        setIsLoading(true)

        try {
            // Map existing messages to API history format
            const history = messages.map(msg => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content
            }))

            const response = await fetch("https://portfolio-chatbot-8isd.onrender.com/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: history,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to fetch response")
            }

            const data = await response.json()

            // Filter out <think>blocks</think> if the model hallucinated its internal chain of thought
            const cleanedResponse = data.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

            setMessages((prev) => [...prev, { role: "assistant", content: cleanedResponse }])
        } catch (error) {
            console.error(error)
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "I'm having trouble connecting right now. Please try again later or contact Arkaprabha directly at arkaofficial13@gmail.com." }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-24 right-5 md:right-12 w-[340px] sm:w-[380px] h-[500px] max-h-[70vh] bg-[#121212]/95 backdrop-blur-xl border border-[#b48f61]/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] shadow-[#b48f61]/10 z-[9999] flex flex-col overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b48f61]/10 blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#b48f61]/40 shadow-[0_0_10px_rgba(180,143,97,0.3)]">
                                    <Bot className="w-4 h-4 text-[#b48f61]" />
                                </div>
                                <div>
                                    <h3 className="font-mono text-xs uppercase tracking-widest text-[#b48f61]">ARKA AI</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-[9px] text-white/50 uppercase tracking-widest font-mono">Agent Active</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors relative z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                        >
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex flex-col w-full",
                                        msg.role === "user" ? "items-end" : "items-start"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1 opacity-50 px-1">
                                        <span className="text-[10px] font-mono tracking-wider">{msg.role === "user" ? "GUEST" : "ARKA AI"}</span>
                                    </div>
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl relative max-w-[85%] leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-[#b48f61]/20 text-white rounded-tr-sm border border-[#b48f61]/30 mr-1 shadow-[0_2px_10px_rgba(180,143,97,0.1)]"
                                                : "bg-white/5 text-white/90 rounded-tl-sm border border-white/10 ml-1 whitespace-pre-wrap style-markdown"
                                        )}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#b48f61] hover:underline break-words" />
                                                ),
                                                p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 leading-relaxed" />,
                                                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />,
                                                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 mb-2 space-y-1" />,
                                                li: ({ node, ...props }) => <li {...props} className="marker:text-[#b48f61]" />,
                                                strong: ({ node, ...props }) => <strong {...props} className="text-[#b48f61] font-semibold" />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex flex-col w-full items-start">
                                    <div className="flex items-center gap-2 mb-1 opacity-50 px-1">
                                        <span className="text-[10px] font-mono tracking-wider">ARKA AI</span>
                                    </div>
                                    <div className="p-3 ml-1 rounded-2xl bg-white/5 text-white/80 rounded-tl-sm border border-white/10 flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#b48f61]" />
                                        <span className="text-[11px] font-mono tracking-widest uppercase">Processing</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <div className="p-4 border-t border-white/10 bg-[#121212]/95 backdrop-blur-md">
                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about my expertise..."
                                    className="w-full bg-black/40 border border-white/10 rounded-full py-3.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#b48f61]/50 focus:ring-1 focus:ring-[#b48f61]/50 transition-all font-sans"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 w-9 h-9 flex items-center justify-center bg-[#b48f61] hover:bg-[#cda676] text-black rounded-full transition-all disabled:opacity-50 disabled:scale-90 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(180,143,97,0.3)]"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 md:bottom-8 md:right-12 w-14 h-14 bg-[#1a1a1a] border border-[#b48f61]/30 rounded-full shadow-[0_0_20px_rgba(180,143,97,0.2)] flex items-center justify-center z-[9998] hover:scale-110 transition-transform overflow-hidden group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#b48f61]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? (
                    <X className="w-6 h-6 text-[#b48f61]" />
                ) : (
                    <Bot className="w-6 h-6 text-[#b48f61]" />
                )}

                {/* Unread indicator / attention dot */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 flex items-center justify-center translate-x-[-15%] translate-y-[15%]">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b48f61] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b48f61]"></span>
                    </span>
                )}
            </motion.button>
        </>
    )
}
