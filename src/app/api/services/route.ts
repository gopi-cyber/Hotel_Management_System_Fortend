import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_ENDPOINTS } from '@/lib/apiConfig';
import { fallbackData, FallbackService } from '@/lib/serverFallback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || searchParams.get('guestId');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const url = userId ? `${BACKEND_ENDPOINTS.SERVICES}?userId=${userId}` : BACKEND_ENDPOINTS.SERVICES;
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const services = await response.json();
      return NextResponse.json(services);
    }
  } catch (_e) {
    // Backend offline
  }

  let services = [...fallbackData.services];
  if (userId) {
    services = services.filter((s: FallbackService) => String(s.userId) === String(userId));
  }
  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const body = await request.json();
  const userId = searchParams.get('userId') || body.userId || '3';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_ENDPOINTS.SERVICES}?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const service = await response.json();
      return NextResponse.json(service, { status: 201 });
    }
  } catch (_e) {
    // Backend offline
  }

  const newService: FallbackService = {
    id: Date.now().toString(),
    userId: userId,
    guestName: body.guestName || 'Alex Morgan',
    roomNumber: body.roomNumber || '101',
    serviceType: body.serviceType || 'Housekeeping',
    description: body.description || '',
    priority: body.priority || 'MEDIUM',
    status: 'PENDING',
    assignedStaff: body.assignedStaff || 'Sarah Jenkins'
  };
  fallbackData.services.push(newService);
  return NextResponse.json(newService, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, assignedStaff } = body;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_ENDPOINTS.SERVICES}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignedStaff }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const service = await response.json();
      return NextResponse.json(service);
    }
  } catch (_e) {
    // Backend offline
  }

  const idx = fallbackData.services.findIndex((s: FallbackService) => String(s.id) === String(id));
  if (idx !== -1) {
    if (status) fallbackData.services[idx].status = status;
    if (assignedStaff) fallbackData.services[idx].assignedStaff = assignedStaff;
    return NextResponse.json(fallbackData.services[idx]);
  }
  return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
}
