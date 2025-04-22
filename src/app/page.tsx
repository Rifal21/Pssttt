'use client'

import CurhatForm from '@/components/CurhatForm'
import CurhatList from '@/components/CurhatList'
import { useState } from 'react'

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main className="w-full mx-auto mt-14">
      <h1 className="text-3xl font-bold text-center pt-10 pb-3 bg-transparent uppercase" >Pssttt.....🤫</h1>
      <p className="text-center">Kirimkan curhatanmu tanpa ketauan </p>
      <CurhatList key={refreshKey} />
      <CurhatForm onSend={() => setRefreshKey((k) => k + 1)} />
    </main>
  )
}
