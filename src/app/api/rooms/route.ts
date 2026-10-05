import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_ENDPOINTS } from '@/lib/apiConfig';
import { fallbackData, FallbackRoom } from '@/lib/serverFallback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const url = status ? `${BACKEND_ENDPOINTS.ROOMS}?status=${status}` : BACKEND_ENDPOINTS.ROOMS;
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const rooms = await response.json();
      return NextResponse.json(rooms);
    }
  } catch (_e) {
    // Backend offline
  }

  let rooms = [...fallbackData.rooms];
  if (status) {
    rooms = rooms.filter((r: FallbackRoom) => r.status.toLowerCase() === status.toLowerCase());
  }
  return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(BACKEND_ENDPOINTS.ROOMS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const room = await response.json();
      return NextResponse.json(room, { status: 201 });
    }
  } catch (_e) {
    // Backend offline
  }

  const newRoom: FallbackRoom = {
    id: Date.now().toString(),
    roomNumber: body.roomNumber || `${Date.now() % 900 + 100}`,
    name: body.name || 'New Suite',
    type: body.type || 'Standard',
    pricePerNight: Number(body.pricePerNight) || 150,
    capacity: Number(body.capacity) || 2,
    status: body.status || 'available',
    description: body.description || '',
    amenities: body.amenities || 'WiFi, AC',
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
    ...(body.galleryImages ? { galleryImages: body.galleryImages } : {})
  };
  fallbackData.rooms.push(newRoom);
  return NextResponse.json(newRoom, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_ENDPOINTS.ROOMS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const room = await response.json();
      return NextResponse.json(room);
    }
  } catch (_e) {
    // Backend offline
  }

  const idx = fallbackData.rooms.findIndex((r: FallbackRoom) => String(r.id) === String(id));
  if (idx !== -1) {
    fallbackData.rooms[idx] = { ...fallbackData.rooms[idx], ...updates };
    return NextResponse.json(fallbackData.rooms[idx]);
  }
  return NextResponse.json({ error: 'Room not found' }, { status: 404 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_ENDPOINTS.ROOMS}/${id}`, { method: 'DELETE', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
  } catch (_e) {
    // Backend offline
  }

  fallbackData.rooms = fallbackData.rooms.filter((r: FallbackRoom) => String(r.id) !== String(id));
  return NextResponse.json({ success: true });
}
