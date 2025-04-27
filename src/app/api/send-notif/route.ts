import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const { title, message } = await req.json()

    const ONESIGNAL_APP_ID = '3395d970-94a5-48aa-afe9-f8d0097e112f'
    const ONESIGNAL_API_KEY = 'os_v2_app_gok5s4euuvekvl7j7dias7qrf43h3coq442eehu2ah7dwmc2nq7dhbt5vkr3lgitcqzdz5wqlled65ecxrsg5x6tcklig6f6kd5jjya'

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            headings: { en: title },
            contents: { en: message },
            included_segments: ['All'], // Kirim ke semua user yang subscribe
        }),
    })

    const data = await response.json()
    return NextResponse.json(data)
}
