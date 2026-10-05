import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_ENDPOINTS } from '@/lib/apiConfig';
import { fallbackData } from '@/lib/serverFallback';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(BACKEND_ENDPOINTS.CHECKIN, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const checkIns = await response.json();
      return NextResponse.json(checkIns);
    }
  } catch (_e) {
    // Backend offline
  }

  return NextResponse.json(fallbackData.checkins);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const isDepart = body.action === 'depart';
  const targetUrl = isDepart ? `${BACKEND_ENDPOINTS.CHECKIN}/depart` : `${BACKEND_ENDPOINTS.CHECKIN}/arrive`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const checkIn = await response.json();
      return NextResponse.json(checkIn, { status: 201 });
    }
  } catch (_e) {
    // Backend offline
  }

  const newCheckIn = {
    id: Date.now().toString(),
    ...body,
    checkInTime: new Date().toISOString()
  };
  fallbackData.checkins.push(newCheckIn);
  return NextResponse.json(newCheckIn, { status: 201 });
}
