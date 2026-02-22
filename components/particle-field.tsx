"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ParticleFieldProps {
    density?: number
    color?: string
}

export function ParticleField({ density = 60, color = "#b48f61" }: ParticleFieldProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Since we require random numbers for particles, we generate them strictly on the client
    // after the initial empty render to prevent hydration mismatches.
    const [particles, setParticles] = useState<Array<{ id: number, size: number, x: number, y: number, duration: number, delay: number }>>([])

    useEffect(() => {
        const generated = Array.from({ length: density }).map((_, i) => ({
            id: i,
            size: Math.random() * 3 + 1, // 1px to 4px
            x: Math.random() * 100, // 0% to 100%
            y: Math.random() * 100, // 0% to 100%
            duration: Math.random() * 20 + 20, // 20s to 40s float time
            delay: Math.random() * -30, // Random start time
        }))
        setParticles(generated)
    }, [density])

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: color,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        boxShadow: `0 0 ${p.size * 2}px ${color}`,
                    }}
                    animate={{
                        y: [`${p.y}%`, `${p.y - 30}%`, `${p.y}%`],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                />
            ))}
        </div>
    )
}

import { useState } from "react"
