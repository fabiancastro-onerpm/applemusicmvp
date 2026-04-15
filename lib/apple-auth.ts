import jwt from 'jsonwebtoken';

/**
 * Generates an Apple App Store Connect Token (JWT) for Music Analytics API.
 * Reverted to jsonwebtoken for stability, keeping Vercel-specific sanitization.
 */
export function generateAppleDeveloperToken() {
  const APPLE_KEY_ID = process.env.APPLE_KEY_ID?.trim();
  const APPLE_ISSUER_ID = process.env.APPLE_UUID?.trim(); 
  let APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.trim();

  if (!APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_PRIVATE_KEY) {
    console.error("Missing Apple Analytics API credentials.");
    return null;
  }

  // Aggressive Sanitization for Vercel
  if (APPLE_PRIVATE_KEY.startsWith('"') && APPLE_PRIVATE_KEY.endsWith('"')) APPLE_PRIVATE_KEY = APPLE_PRIVATE_KEY.slice(1, -1);
  if (APPLE_PRIVATE_KEY.startsWith("'") && APPLE_PRIVATE_KEY.endsWith("'")) APPLE_PRIVATE_KEY = APPLE_PRIVATE_KEY.slice(1, -1);
  
  APPLE_PRIVATE_KEY = APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  try {
    const header = {
      alg: 'ES256',
      kid: APPLE_KEY_ID,
      typ: 'JWT'
    };

    const iat = Math.floor(Date.now() / 1000) - 60; // 1 min buffer for clock drift
    const payload = {
      iss: APPLE_ISSUER_ID,
      aud: 'appstoreconnect-v1', // Reverted to working original claim
      iat: iat,
      exp: iat + (15 * 60) + 60,
    };

    const token = jwt.sign(payload, APPLE_PRIVATE_KEY, {
      algorithm: 'ES256',
      header: header,
    });

    return token;
  } catch (error: any) {
    console.error("Token Generation Error:", error.message);
    return null;
  }
}

