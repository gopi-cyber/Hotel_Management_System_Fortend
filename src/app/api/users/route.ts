import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_ENDPOINTS } from '@/lib/apiConfig';
import { fallbackData, FallbackUser } from '@/lib/serverFallback';

const publicUser = (source: FallbackUser) => {
  const user = { ...source };
  delete user.password;
  return user;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(BACKEND_ENDPOINTS.USERS, { 
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      let users = await response.json();
      if (username) {
        users = users.filter((u: FallbackUser) => u.username?.toLowerCase() === username.toLowerCase());
      }
      return NextResponse.json(users.map((user: FallbackUser) => publicUser(user)));
    }
  } catch (_e) {
    // Spring Boot backend offline - use fallback
  }

  let users = [...fallbackData.users];
  if (username) {
    users = users.filter((u: FallbackUser) => u.username.toLowerCase() === username.toLowerCase());
  }
  return NextResponse.json(users.map(publicUser));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Secure Login Action ──
    if (body.action === 'login') {
      const identifier = String(body.username ?? body.email ?? '').toLowerCase().trim();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`${BACKEND_ENDPOINTS.USERS}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password: body.password }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const user = await response.json();
          return NextResponse.json(publicUser(user as FallbackUser));
        }
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return NextResponse.json({ error: errData.error || 'Invalid credentials' }, { status: response.status });
        }
      } catch (_e) {
        // Backend offline - validate against development fallback.
      }

      // Check against fallback users by either username, email, or alias
      const user = fallbackData.users.find((candidate) =>
        (candidate.username.toLowerCase() === identifier ||
         candidate.email.toLowerCase() === identifier ||
         (candidate.username === 'guest' && identifier === 'new_guest')) &&
        candidate.password === body.password
      );

      return user
        ? NextResponse.json(publicUser(user))
        : NextResponse.json({ error: 'Invalid username/email or password' }, { status: 401 });
    }

    // ── New User Registration (Strictly Guest Role Only) ──
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
    }
    // Security enforcement: public registration can ONLY ever create 'guest' accounts.
    const registrationBody = { ...body, role: 'guest' };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${BACKEND_ENDPOINTS.USERS}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const savedUser = await response.json();
        return NextResponse.json(publicUser(savedUser as FallbackUser), { status: 201 });
      } else {
        const errData = await response.json().catch(() => ({}));
        return NextResponse.json({ error: errData.error || 'Registration failed' }, { status: response.status });
      }
    } catch (_e) {
      // Backend offline - use fallback
    }

    const duplicate = fallbackData.users.some((user) =>
      user.username.toLowerCase() === String(body.username).toLowerCase() ||
      user.email.toLowerCase() === String(body.email).toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }

    const newUser: FallbackUser = {
      id: Date.now().toString(),
      username: body.username,
      password: body.password || '123',
      name: body.name || body.username,
      email: body.email || `${body.username}@example.com`,
      phone: body.phone || '',
      role: 'guest' // Strict: public registration is guest only
    };
    fallbackData.users.push(newUser);
    return NextResponse.json(publicUser(newUser), { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Registration error' }, { status: 400 });
  }
}

// ── Admin Updates User Role ──
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and target role are required' }, { status: 400 });
    }

    const validRoles = ['admin', 'receptionist', 'guest'];
    const normalizedRole = String(role).toLowerCase();
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin, receptionist, or guest.' }, { status: 400 });
    }

    const userIndex = fallbackData.users.findIndex((u) => String(u.id) === String(id));
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    fallbackData.users[userIndex].role = normalizedRole;
    return NextResponse.json(publicUser(fallbackData.users[userIndex]));
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Role update error' }, { status: 500 });
  }
}

// ── Admin Deletes User Account ──
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Protect master admin from deletion
  if (String(id) === '1') {
    return NextResponse.json({ error: 'Cannot delete primary root administrator' }, { status: 403 });
  }

  const initialCount = fallbackData.users.length;
  fallbackData.users = fallbackData.users.filter((u) => String(u.id) !== String(id));

  if (fallbackData.users.length === initialCount) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'User deleted successfully' });
}
