
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Utility untuk generate nama anonim acak
const adjectives = ['Gokil', 'Santuy', 'Kocak', 'Nyeleneh', 'Gesit', 'Asoy']
const nouns = ['Panda', 'Kucing', 'Unta', 'Tupai', 'Naga', 'Ikan']
function generateRandomName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 100)
    return `${adj}${noun}${num.toString().padStart(2, '0')}`
}

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState<string>('')
    const [gender, setGender] = useState<'male' | 'female' | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Cek apakah user sudah ada di localStorage
        const existingId = localStorage.getItem('anon-user')
        if (existingId) {
            router.replace('/chat/users') // langsung redirect
            return
        }
        // generate nama awal
        setName(generateRandomName())
    }, [])

    const handleRegister = async () => {
        if (!name.trim() || !gender) return
        setLoading(true)

        const { data, error } = await supabase
            .from('anon_users')
            .insert([{ name: name.trim(), gender, online: true }])
            .select('id')
            .single()

        setLoading(false)

        if (error || !data) {
            console.error('Gagal registrasi:', error)
            return
        }

        // simpan ke localStorage
        localStorage.setItem('anon-user', data.id)
        localStorage.setItem('anon-name', name.trim())
        localStorage.setItem('anon-gender', gender)

        // navigasi ke daftar users
        router.push('/chat/users')
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-pink-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center text-pink-600 mb-4">Daftar Anonim</h1>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nama (anonim)</label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nama anonim"
                        disabled={loading}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <div className="flex gap-4">
                        <Button
                            variant={gender === 'male' ? 'default' : 'outline'}
                            onClick={() => setGender('male')}
                            disabled={loading}
                        >
                            Cowok
                        </Button>
                        <Button
                            variant={gender === 'female' ? 'default' : 'outline'}
                            onClick={() => setGender('female')}
                            disabled={loading}
                        >
                            Cewek
                        </Button>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleRegister}
                    disabled={loading || !name.trim() || !gender}
                >
                    {loading ? 'Mendaftar...' : 'Lanjut'}
                </Button>
            </div>
        </div>
    )
}