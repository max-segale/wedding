import { ActionError, defineAction } from 'astro:actions';
import { env } from 'cloudflare:workers';
import { z } from 'astro/zod';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

const sessionKey = password => crypto.subtle.importKey(
  'raw',
  encoder.encode(password),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify'],
);

const safeReturnTo = value => {
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

const toBase64Url = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replaceAll('+', '-')
  .replaceAll('/', '_')
  .replace(/=+$/, '');

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

const createSession = async (password: string) => {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign(
    'HMAC',
    await sessionKey(password),
    encoder.encode(payload),
  );
  return {
    token: `${payload}.${toBase64Url(signature)}`,
    maxAge: SESSION_TTL_SECONDS,
  };
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
      console.error('SITE_PASSWORD Cloudflare secret is not configured.');
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
