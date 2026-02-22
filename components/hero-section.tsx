"use client"

import { useEffect, useRef } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ParticleField } from "@/components/particle-field"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center pl-6 md:pl-28 pr-6 md:pr-12 bg-background/50">
      <AnimatedNoise opacity={0.03} />

      {/* Floating Particles */}
      <ParticleField density={40} color="#b48f61" />

      {/* Deep glowing ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none float-element"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none float-element-delayed"></div>

      {/* Smooth organic background blur instead of a harsh divided slab */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,theme(colors.background)_0%,transparent_100%)] pointer-events-none z-0"></div>

      {/* Left vertical labels */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent -rotate-90 origin-left block whitespace-nowrap drop-shadow-[0_0_8px_rgba(180,143,97,0.5)]">
          CONNECTING SYSTEMS
        </span>
      </div>

      {/* Main content */}
      <div ref={contentRef} className="flex-1 w-full z-10">
        <SplitFlapAudioProvider>
          <div className="relative">
            <SplitFlapText text="ARKAPRABHA BANERJEE" speed={40} />
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="font-[var(--font-bebas)] text-[clamp(1.5rem,4vw,3rem)] mt-6 tracking-wide bg-gradient-to-r from-[#b48f61] via-[#e2c792] to-[#b48f61] text-transparent bg-clip-text drop-shadow-lg">
          The Architect of Impact
        </h2>

        <p className="mt-12 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed pl-6 border-l border-accent/40 bg-gradient-to-r from-accent/5 via-transparent to-transparent py-4">
          Building Generative AI solutions that bridge the digital divide. Specialized in RAG, Low-Resource NLP, and Enterprise Analytics.
        </p>

        <div className="mt-16 flex items-center gap-8">
          <a
            href="#work"
            className="group relative inline-flex items-center gap-3 border border-accent/40 bg-accent/10 hover:bg-accent/20 px-8 py-4 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-white transition-all duration-300 overflow-hidden rounded-sm"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] skew-x-[-45deg] group-hover:animate-shine" />
            <ScrambleTextOnHover text="View Experiments" as="span" duration={0.6} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
          </a>
          <a
            href="#signals"
            className="group font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center gap-2"
          >
            <span className="w-8 h-[1px] bg-accent/40 group-hover:w-12 transition-all duration-300"></span>
            Latest Stats
          </a>
        </div>
      </div>

      {/* Floating info tag */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-10">
        <div className="border border-accent/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-accent bg-background/80 backdrop-blur-md shadow-[0_0_15px_rgba(180,143,97,0.15)] rounded-sm">
          CS-DS Final Year / Heritage Institute of Technology
        </div>
      </div>
    </section>
  )
}
