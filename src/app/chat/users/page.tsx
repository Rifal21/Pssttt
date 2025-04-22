'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type User = { id: string; name: string, gender: string, online: boolean }

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const me = typeof window !== 'undefined' ? localStorage.getItem('anon-user') : null
    const router = useRouter()

    useEffect(() => {
        if (!me) return router.replace('/chat/register')
        supabase
            .from<User>('anon_users')
            .select('*')
            .eq('online', true)
            .neq('id', me)
            .then(({ data }) => data && setUsers(data))
    }, [me])

    const startChat = async (them: string) => {
        const { data, error } = await supabase
            .from('chat_rooms')
            .select('*')
            .or(`user1_id.eq.${me},user2_id.eq.${me}`)
            .or(`user1_id.eq.${them},user2_id.eq.${them}`)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking room:', error)
            return
        }

        if (!data) {
            const { data: newRoom, error: createError } = await supabase
                .from('chat_rooms')
                .insert([{ user1_id: me, user2_id: them }])
                .select('id')
                .single()

            if (createError) {
                console.error('Error creating room:', createError)
                return
            }

            localStorage.setItem('chat-room', newRoom.id)
            router.push('/chat/room')
        } else {
            localStorage.setItem('chat-room', data.id)
            router.push('/chat/room')
        }
    }

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col">
            <div className="p-6 max-w-2xl w-full mx-auto flex-1">
                <h1 className="text-3xl font-bold mb-6 mt-24 text-center text-pink-600">Cari Teman Ngobrol</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {users.map(u => (
                        <button
                            key={u.id}
                            onClick={() => startChat(u.id)}
                            className="bg-white hover:bg-pink-100 text-pink-600 font-semibold py-3 px-4 rounded-xl shadow transition-all duration-200"
                        >
                            {u.name}
                        </button>
                    ))}
                </div>

                {users.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">Lagi sepi nih... tungguin bentar ya 😌</p>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-inner border-t flex justify-center z-10">
                <Button
                    onClick={() => {
                        localStorage.clear()
                        router.replace('/chat')
                    }}
                    className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-lg transition"
                >
                    Akhiri Obrolan
                </Button>
            </div>
        </div>
    )
}
