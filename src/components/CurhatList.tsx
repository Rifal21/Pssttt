'use client'

import { useEffect, useState, useRef } from 'react'
import supabase from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import OneSignal from 'react-onesignal'

type Curhat = {
    id: string
    message: string
    created_at: string
    x?: number
    y?: number
}

export default function CurhatList() {
    const [curhats, setCurhats] = useState<Curhat[]>([])
    const [newId, setNewId] = useState<string | null>(null)
    const [highlightedId, setHighlightedId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const generateRandomPosition = () => {
        const x = Math.random() * 80 // % dari lebar container
        const y = Math.random() * 80 // % dari tinggi container
        return { x, y }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            OneSignal.Notifications.requestPermission()
        }, 5000)

        return () => clearTimeout(timer)
    }, [])


    useEffect(() => {
        supabase
            .from<string, Curhat>('curhat_anonim')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(30)
            .then(({ data, error }) => {
                if (error) console.error(error)
                else if (data) {
                    const positioned = data.map(d => ({ ...d, ...generateRandomPosition() }))
                    setCurhats(positioned)
                }
            })

        const channel = supabase
            .channel('realtime-curhatan')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'curhat_anonim' },
                async (payload) => {
                    const newData = payload.new as Curhat
                    const { x, y } = generateRandomPosition()
                    const withPosition = { ...newData, x, y }

                    setCurhats(prev => {
                        const alreadyExists = prev.some(item => item.id === withPosition.id)
                        if (alreadyExists) return prev
                        return [...prev, withPosition]
                    })
                    setNewId(newData.id)
                    setHighlightedId(newData.id)

                    setTimeout(() => setNewId(null), 5000)
                    setTimeout(() => setHighlightedId(null), 5000)

                    await fetch('/api/send-notif', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: 'Curhatan Baru Datang!',
                            message: newData.message.substring(0, 60) + '...',
                        }),
                    })

                }
            )
            .subscribe()

        return () => void supabase.removeChannel(channel)
    }, [])

    return (
        <div
            ref={containerRef}
            className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-white to-pink-50"
        >
            <AnimatePresence initial={false}>
                {curhats.map((c) => {
                    const isNew = c.id === newId
                    const isHighlighted = c.id === highlightedId

                    return (
                        <motion.div
                            key={c.id}
                            drag
                            dragConstraints={containerRef}
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, scale: 0.6, y: 100 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: [0, 10, 0],
                                x: [0, 5, 0],
                            }}
                            exit={{ opacity: 0, y: -100 }}
                            transition={{
                                duration: 0.5,
                                ease: 'easeOut',
                                y: { duration: 5, repeat: Infinity, repeatType: 'mirror' },
                                x: { duration: 7, repeat: Infinity, repeatType: 'mirror' },
                            }}
                            style={{
                                position: 'absolute',
                                top: `${c.y}%`,
                                left: `${c.x}%`,
                            }}
                            className={`
                                p-4 rounded-2xl shadow-md cursor-grab touch-pan-y w-[180px]
                                ${isHighlighted ? 'bg-yellow-200' : 'bg-gradient-to-br from-pink-100 to-purple-200'}
                            `}
                        >
                            <p className="text-sm leading-relaxed break-words">{c.message}</p>
                            <span className="text-[10px] text-gray-500 block mt-2 text-right">
                                {new Date(c.created_at).toLocaleTimeString()}
                            </span>
                            {isNew && (
                                <span className="absolute top-0 -right-1 bg-red-500 w-3 h-3 rounded-full shadow-md animate-ping" />
                            )}
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
