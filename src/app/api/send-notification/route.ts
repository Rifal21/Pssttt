import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { roomId, message } = await req.json()

    const ONESIGNAL_APP_ID = '3395d970-94a5-48aa-afe9-f8d0097e112f'
    const ONESIGNAL_REST_API_KEY = 'os_v2_app_gok5s4euuvekvl7j7dias7qrf43h3coq442eehu2ah7dwmc2nq7dhbt5vkr3lgitcqzdz5wqlled65ecxrsg5x6tcklig6f6kd5jjya'

    try {
        const res = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                filters: [
                    { field: 'tag', key: 'room_id', relation: '=', value: roomId }
                ],
                headings: { en: 'New message!' },
                contents: { en: message },
            }),
        })

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error sending OneSignal notification:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
