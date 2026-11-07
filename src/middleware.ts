import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  const hasSession = cookies.has('auth_token');

  const notLoginPage = url.pathname !== '/login';

  if (notLoginPage && !hasSession) {
    return redirect('/login');
  }

  const response = await next();

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const newHeaders = new Headers(response.headers);

  newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noimageindex');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});
