'use client'

import { useState } from 'react'
import supabase from '@/lib/supabase'

type Props = {
    onSend: () => void
}

const CurhatForm = ({ onSend }: Props) => {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setLoading(true)

        const { error } = await supabase.from('curhat_anonim').insert([
            {
                message,
            },
        ])

        if (!error) {
            setMessage('')
            onSend() // refresh data
        }

        setLoading(false)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="fixed bottom-0 left-0 right-0 p-4  flex gap-2 md:w-1/2 justify-center mx-auto"
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis curhatanmu..."
                className="flex-1 p-3 border rounded-full bg-white/10 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={loading}
            />
            <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-full"
                disabled={loading}
            >
                Kirim
            </button>
        </form>
    )
}

export default CurhatForm
