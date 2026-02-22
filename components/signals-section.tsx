"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const signals = [
  {
    date: "2025.06.10",
    title: "Signal Field",
    note: "New interface paradigm for ambient computing environments.",
  },
  {
    date: "2025.05.28",
    title: "Silent Agent",
    note: "Orchestration layer for autonomous design systems.",
  },
  {
    date: "2025.05.15",
    title: "Noir Grid",
    note: "Typographic system for editorial interfaces.",
  },
  {
    date: "2025.04.30",
    title: "Project Lattice",
    note: "Structural framework for adaptive layouts.",
  },
  {
    date: "2025.04.12",
    title: "Echo Chamber",
    note: "Audio-visual synthesis in browser environments.",
  },
]

export function SignalsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const codolioRef = useRef<HTMLDivElement>(null)
  const bento1Ref = useRef<HTMLDivElement>(null)
  const bento2Ref = useRef<HTMLDivElement>(null)
  const bento3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            },
          },
        )
      }

      // Synchronized timeline for the Bento Grid and Codolio Card
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play reverse play reverse",
        }
      });

      if (codolioRef.current) {
        tl.fromTo(
          codolioRef.current,
          { x: -150, opacity: 0, rotationY: -25, scale: 0.9 },
          { x: 0, opacity: 1, rotationY: 0, scale: 1, duration: 1.2, ease: "power3.out" },
          0
        )
      }

      if (bento1Ref.current) {
        tl.fromTo(
          bento1Ref.current,
          { y: -100, x: 100, opacity: 0, scale: 0.9 },
          { y: 0, x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
          0.1 // slight stagger
        )
      }

      if (bento2Ref.current) {
        tl.fromTo(
          bento2Ref.current,
          { y: 150, x: -100, opacity: 0, scale: 0.9 },
          { y: 0, x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
          0.2 // stagger
        )
      }

      if (bento3Ref.current) {
        tl.fromTo(
          bento3Ref.current,
          { y: 150, x: 100, opacity: 0, scale: 0.9 },
          { y: 0, x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
          0.3 // stagger
        )
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="signals" ref={sectionRef} className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Stats</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">CODOLIO PROFILE</h2>
        <p className="mt-4 font-mono text-xs text-muted-foreground max-w-md">Hover over the card to view Competitive Programming statistics.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center lg:items-start justify-center lg:justify-start w-full">
        {/* Left Side: The 3D Flipping Profile Image */}
        <div ref={codolioRef} className="opacity-0 flex-shrink-0 relative z-10 w-full max-w-[340px] flex justify-center [perspective:1000px]">
          <CodolioCard />
        </div>

        {/* Right Side: The Stats Bento Grid */}
        <div className="flex-grow w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 lg:pt-10">

          {/* Bento Box 1 */}
          <div ref={bento1Ref} className="opacity-0 col-span-1 md:col-span-2 bg-[#1a1a1a]/50 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col justify-between hover:bg-[#1a1a1a]/80 transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[50px] group-hover:bg-green-500/20 transition-all duration-500 transform translate-x-1/2 -translate-y-1/2"></div>
            <div>
              <h3 className="text-white/50 font-mono text-xs uppercase tracking-[0.2em] mb-2">Problem Solving Engine</h3>
              <div className="text-white text-3xl font-light tracking-tight mb-2"><span className="text-green-500 font-bold">1200+</span> Questions Dominated</div>
              <p className="text-white/40 text-sm">Consistent daily practice across GeeksforGeeks, LeetCode, and HackerRank over the last 450+ days.</p>
            </div>
          </div>

          {/* Bento Box 2 */}
          <div ref={bento2Ref} className="opacity-0 col-span-1 bg-[#1a1a1a]/50 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:bg-[#1a1a1a]/80 transition-colors duration-300 relative overflow-hidden group min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] group-hover:bg-orange-500/20 transition-all duration-500 transform translate-x-1/2 -translate-y-1/2"></div>
            <div>
              <h3 className="text-white/50 font-mono text-[10px] uppercase tracking-[0.2em] mb-2">Primary Arsenal</h3>
              <div className="text-white text-2xl font-light tracking-tight mb-1">C++ <span className="text-white/20">&</span> Python</div>
              <p className="text-white/40 text-[10px]">Data Structures & Algorithms</p>
            </div>
          </div>

          {/* Bento Box 3 */}
          <div ref={bento3Ref} className="opacity-0 col-span-1 bg-[#1a1a1a]/50 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:bg-[#1a1a1a]/80 transition-colors duration-300 relative overflow-hidden group min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 transition-all duration-500 transform translate-x-1/2 -translate-y-1/2"></div>
            <div>
              <h3 className="text-white/50 font-mono text-[10px] uppercase tracking-[0.2em] mb-2">Mentorship</h3>
              <div className="text-white text-2xl font-light tracking-tight mb-1"><span className="text-blue-400 font-bold">DSA</span> Mentor</div>
              <p className="text-white/40 text-[10px]">Guiding the next generation of engineers through logic.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

import Image from "next/image"

function CodolioCard() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="group relative w-full max-w-[340px] aspect-[340/600] [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "w-full h-full transition-transform duration-[800ms] [transform-style:preserve-3d] shadow-2xl rounded-3xl",
          // Hover on desktop, Tap state on mobile
          isFlipped ? "[transform:rotateY(180deg)]" : "md:group-hover:[transform:rotateY(180deg)]"
        )}
      >

        {/* FRONT FACE: devCard.png */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl overflow-hidden border border-white/20">
          <Image
            src="/devCard.png"
            alt="Arkaprabha Banerjee Codolio Dev Card"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* BACK FACE: profileCard.png */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden border border-white/20">
          <Image
            src="/profileCard.png"
            alt="Arkaprabha Banerjee Codolio Profile Card"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </div>
  )
}
