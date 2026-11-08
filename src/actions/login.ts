import { env } from 'cloudflare:workers';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { createSession } from '@/lib/session';

const encoder = new TextEncoder();

const safeReturnTo = (value: string | undefined) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'https://wedding.invalid');
    return url.origin === 'https://wedding.invalid'
      && !url.pathname.startsWith('/__auth/')
      && url.pathname !== '/login'
      && url.pathname !== '/login/'
      ? `${url.pathname}${url.search}${url.hash}`
      : '/';
  } catch {
    return '/';
  }
};

const passwordMatches = async (suppliedPassword: string, expectedPassword: string) => {
  const [suppliedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(suppliedPassword)),
    crypto.subtle.digest('SHA-256', encoder.encode(expectedPassword)),
  ]);
  const suppliedBytes = new Uint8Array(suppliedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < suppliedBytes.length; index += 1) {
    difference |= suppliedBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
};

export const login = defineAction({
  accept: 'form',
  input: z.object({
    password: z.string(),
    next: z.string().optional(),
  }),
  handler: async ({ password, next }, { cookies }) => {
    const expectedPassword = env.SITE_PASSWORD;
    if (!expectedPassword) {
      throw new ActionError({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Site password protection is not configured.',
      });
    }

    if (!await passwordMatches(password, expectedPassword)) {
      return { authenticated: false, next: safeReturnTo(next) };
    }

    const session = await createSession(expectedPassword);
    cookies.set('auth_token', session.token, {
      path: '/',
      maxAge: session.maxAge,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    return { authenticated: true, next: safeReturnTo(next) };
  },
});
