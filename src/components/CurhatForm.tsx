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
            className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md flex gap-2"
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis curhatanmu..."
                className="flex-1 p-3 border rounded-full"
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
