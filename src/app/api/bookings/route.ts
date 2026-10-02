import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_ENDPOINTS } from '@/lib/apiConfig';
import { fallbackData, FallbackBooking } from '@/lib/serverFallback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const url = userId ? `${BACKEND_ENDPOINTS.BOOKINGS}?userId=${userId}` : BACKEND_ENDPOINTS.BOOKINGS;
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const bookings = await response.json();
      return NextResponse.json(bookings);
    }
  } catch (_e) {
    // Backend offline
  }

  let bookings = [...fallbackData.bookings];
  if (userId) {
    bookings = bookings.filter((b: FallbackBooking) => String(b.userId) === String(userId));
  }
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const body = await request.json();
  const userId = searchParams.get('userId') || body.userId || '3';
  const roomId = searchParams.get('roomId') || body.roomId || '1';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${BACKEND_ENDPOINTS.BOOKINGS}?userId=${userId}&roomId=${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const booking = await response.json();
      return NextResponse.json(booking, { status: 201 });
    }
  } catch (_e) {
    // Backend offline
  }

  const room = fallbackData.rooms.find(r => String(r.id) === String(roomId)) || fallbackData.rooms[0];
  const newBooking: FallbackBooking = {
    id: Date.now().toString(),
    bookingReference: `BK-${Date.now().toString().slice(-4)}`,
    userId: userId,
    guestName: body.guestName || 'Guest User',
    guestEmail: body.guestEmail || 'guest@example.com',
    guestPhone: body.guestPhone || '+91 98765 43210',
    roomId: roomId,
    roomNumber: room.roomNumber,
    roomType: room.type,
    checkInDate: body.checkInDate || new Date().toISOString().split('T')[0],
    checkOutDate: body.checkOutDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    nights: Number(body.nights) || 1,
    guestsCount: Number(body.guestsCount) || 1,
    totalAmount: Number(body.totalPrice) || Number(body.totalAmount) || ((Number(body.nights) || 1) * room.pricePerNight),
    status: body.status ? String(body.status).toUpperCase() : 'CONFIRMED',
    paymentStatus: body.paymentStatus || 'PAID',
    specialRequests: body.specialRequests || '',
    kyc: body.kyc || {
      verified: true,
      documentType: 'Aadhaar Card',
      documentNumber: '•••• •••• 9012',
      verifiedAt: new Date().toISOString()
    }
  };
  fallbackData.bookings.push(newBooking);
  return NextResponse.json(newBooking, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status, paymentStatus, ...updates } = body;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    let response;
    if (status) {
      response = await fetch(`${BACKEND_ENDPOINTS.BOOKINGS}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal: controller.signal
      });
    } else if (paymentStatus) {
      response = await fetch(`${BACKEND_ENDPOINTS.BOOKINGS}/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
        signal: controller.signal
      });
    }
    clearTimeout(timeoutId);

    if (response && response.ok) {
      const booking = await response.json();
      return NextResponse.json(booking);
    }
  } catch (_e) {
    // Backend offline
  }

  const idx = fallbackData.bookings.findIndex((b: FallbackBooking) => String(b.id) === String(id));
  if (idx !== -1) {
    if (status) fallbackData.bookings[idx].status = status;
    if (paymentStatus) fallbackData.bookings[idx].paymentStatus = paymentStatus;
    fallbackData.bookings[idx] = { ...fallbackData.bookings[idx], ...updates };
    return NextResponse.json(fallbackData.bookings[idx]);
  }
  return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${BACKEND_ENDPOINTS.BOOKINGS}/${id}`, { method: 'DELETE', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
  } catch (_e) {
    // Backend offline
  }

  fallbackData.bookings = fallbackData.bookings.filter((b: FallbackBooking) => String(b.id) !== String(id));
  return NextResponse.json({ success: true });
}
