const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;
const encoder = new TextEncoder();

const sessionKey = (password: string) => crypto.subtle.importKey(
  'raw',
  encoder.encode(password),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify'],
);

const toBase64Url = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replaceAll('+', '-')
  .replaceAll('/', '_')
  .replace(/=+$/, '');

const fromBase64Url = (value: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) return null;

  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '='));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return toBase64Url(bytes.buffer) === value ? bytes : null;
};

export const createSession = async (password: string) => {
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

export const verifySession = async (token: string, password: string) => {
  const [expiresAtText, signatureText, ...extraParts] = token.split('.');
  if (!expiresAtText || !signatureText || extraParts.length || !/^[1-9]\d*$/.test(expiresAtText)) return false;

  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const signature = fromBase64Url(signatureText);
  if (!signature || signature.length !== 32) return false;

  return crypto.subtle.verify(
    'HMAC',
    await sessionKey(password),
    signature,
    encoder.encode(expiresAtText),
  );
};
