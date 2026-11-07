import { env } from 'cloudflare:workers';
import { defineMiddleware } from 'astro:middleware';
import { verifySession } from './scripts/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  const token = cookies.get('auth_token')?.value;
  const password = env.SITE_PASSWORD;
  const hasValidSession = token && password
    ? await verifySession(token, password)
    : false;

  const notLoginPage = url.pathname !== '/login';

  if (notLoginPage && !hasValidSession) {
    return redirect('/login');
  }

  const response = await next();

  try {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex');
    return response;
  } catch (error) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noimageindex');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
});
