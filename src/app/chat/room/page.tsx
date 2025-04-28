'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import OneSignal from 'react-onesignal'

type ChatMessage = {
    id: string
    room_id: string
    sender_id: string
    message: string
    created_at: string
}

export default function ChatRoomPage() {
    const router = useRouter()
    const [roomId, setRoomId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const endRef = useRef<HTMLDivElement>(null)

    const senderId = typeof window !== 'undefined' ? localStorage.getItem('anon-user') : null

    let isOneSignalInitialized = false

    useEffect(() => {
        const initOneSignal = async () => {
            if (typeof window !== 'undefined' && !isOneSignalInitialized) {
                await OneSignal.init({
                    appId: '3395d970-94a5-48aa-afe9-f8d0097e112f',
                    autoResubscribe: true,
                })
                OneSignal.Slidedown.promptPush(); // ⬅️ langsung minta izin notifikasi
                isOneSignalInitialized = true
            }
        }
        initOneSignal()
    }, [])

    useEffect(() => {
        const storedRoom = localStorage.getItem('chat-room')
        if (!storedRoom || !senderId) {
            router.replace('/chat/users')
            return
        }
        setRoomId(storedRoom)

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', storedRoom)
                .order('created_at', { ascending: true })
            if (error) console.error('Error fetching messages:', error)
            else setMessages(data || [])

            endRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
        fetchMessages()
    }, [router, senderId])

    useEffect(() => {
        if (!roomId) return
        const channel = supabase
            .channel(`room-${roomId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
                ({ new: msg }) => {
                    setMessages(prev => [...prev, msg as ChatMessage])
                    endRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
            )
            .subscribe()

        return () => void supabase.removeChannel(channel)
    }, [roomId, senderId])

    useEffect(() => {
        if (roomId) {
            // ⬅️ Assign tag ke OneSignal user
            OneSignal.User.addTags({
                room_id: roomId,
            })
        }
    }, [roomId])

    const handleSend = async () => {
        if (!input.trim() || !roomId || !senderId) return
        const { error } = await supabase.from('chat_messages').insert([
            { room_id: roomId, sender_id: senderId, message: input.trim() }
        ])
        if (error) {
            console.error('Failed to send message:', error)
        } else {
            setInput('')
            endRef.current?.scrollIntoView({ behavior: 'smooth' })
            sendNotification(input.trim())
        }
    }

    const sendNotification = async (message: string) => {
        try {
            await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    message,
                })
            })
        } catch (err) {
            console.error('Failed to send notification:', err)
        }
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="absolute top-20 right-5 flex items-center">
                <Button onClick={() => router.replace('/chat/users')}>Kembali</Button>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50 pt-32 pb-20">
                {messages.map(msg => {
                    const isMine = msg.sender_id === senderId
                    return (
                        <div
                            key={msg.id}
                            className={`rounded-lg px-3 py-2 shadow max-w-[70%] md:max-w-[30%] ${isMine ? 'bg-pink-400 text-white ml-auto' : 'bg-white text-gray-800'}`}
                        >
                            <p className="text-base">{msg.message}</p>
                            <div className="text-[12px] text-gray-500 text-right mt-1">
                                {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                        </div>
                    )
                })}
                <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="fixed bottom-0 left-0 right-0 flex items-center p-4 border-t bg-white">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ketik pesan..."
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} className="ml-2">
                    Kirim
                </Button>
            </div>
        </div>
    )
}
