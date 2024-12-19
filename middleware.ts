import { NextResponse } from 'next/server';
import { getSession, setSession, clearSession } from './lib/sessionState';

export function middleware(request: Request) {
  const url = new URL(request.url);

  // Skip validation for the home page and API routes
  if (url.pathname === '/' || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const myCode = process.env.MY_CODE;
  const wifeCode = process.env.WIFE_CODE;
  const code = url.searchParams.get('code');
  const user = url.searchParams.get('user');
  const instanceId = url.searchParams.get('instanceId') || '';

  // Validate user type and code
  if ((user === 'me' && code !== myCode) || (user === 'wife' && code !== wifeCode)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const activeSession = getSession();

  // If there's an active session for the same user, clear it
  if (activeSession && activeSession.user === user && activeSession.instanceId !== instanceId) {
    clearSession(activeSession.instanceId);
  }

  // Set the new session
  setSession(user, instanceId);
  

  return NextResponse.next();
}
