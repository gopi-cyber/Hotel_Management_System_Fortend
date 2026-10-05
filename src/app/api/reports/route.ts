import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/apiConfig';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_BASE_URL}/reports`, {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (_e) {
    // Backend offline fallback handled downstream
  }

  return NextResponse.json({
    totalRevenue: 0,
    totalBookings: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
    adr: 0,
    revPar: 0,
    totalStaff: 0,
    totalUsers: 0,
    totalCheckIns: 0
  });
}
