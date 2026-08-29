export const config = {
  matcher: ['/admin.html']
};

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="GPGV Site Manager", charset="UTF-8"',
      'Cache-Control': 'no-store'
    }
  });
}

export default function middleware(request) {
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;

  if (!username || !password) {
    return new Response('Admin authentication is not configured', {
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  const auth = request.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  let decoded = '';
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return unauthorized();

  const submittedUser = decoded.slice(0, separator);
  const submittedPass = decoded.slice(separator + 1);

  if (submittedUser !== username || submittedPass !== password) return unauthorized();

  return undefined;
}
