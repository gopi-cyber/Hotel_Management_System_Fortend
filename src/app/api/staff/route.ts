import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_ENDPOINTS } from '@/lib/apiConfig';
import { fallbackData, FallbackStaff } from '@/lib/serverFallback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const url = department ? `${BACKEND_ENDPOINTS.STAFF}?department=${department}` : BACKEND_ENDPOINTS.STAFF;
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const staff = await response.json();
      return NextResponse.json(staff);
    }
  } catch (_e) {
    // Backend offline
  }

  let staff = [...fallbackData.staff];
  if (department) {
    staff = staff.filter((s: FallbackStaff) => s.department.toLowerCase() === department.toLowerCase());
  }
  return NextResponse.json(staff);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(BACKEND_ENDPOINTS.STAFF, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const member = await response.json();
      return NextResponse.json(member, { status: 201 });
    }
  } catch (_e) {
    // Backend offline
  }

  const newStaff: FallbackStaff = {
    id: Date.now().toString(),
    name: body.name || 'New Staff',
    email: body.email || `staff${Date.now()}@luxestay.com`,
    phone: body.phone || '+1 555-0200',
    role: body.role || 'Front Desk',
    department: body.department || 'Reception',
    shift: body.shift || 'Morning',
    salary: Number(body.salary) || 4000,
    status: body.status || 'Active'
  };
  fallbackData.staff.push(newStaff);
  return NextResponse.json(newStaff, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${BACKEND_ENDPOINTS.STAFF}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const member = await response.json();
      return NextResponse.json(member);
    }
  } catch (_e) {
    // Backend offline
  }

  const idx = fallbackData.staff.findIndex((s: FallbackStaff) => String(s.id) === String(id));
  if (idx !== -1) {
    fallbackData.staff[idx] = { ...fallbackData.staff[idx], ...updates };
    return NextResponse.json(fallbackData.staff[idx]);
  }
  return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${BACKEND_ENDPOINTS.STAFF}/${id}`, { method: 'DELETE', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
  } catch (_e) {
    // Backend offline
  }

  fallbackData.staff = fallbackData.staff.filter((s: FallbackStaff) => String(s.id) !== String(id));
  return NextResponse.json({ success: true });
}
