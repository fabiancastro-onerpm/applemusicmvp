import * as jose from 'jose';

/**
 * Generates an Apple App Store Connect Token (JWT) for Music Analytics API.
 * Uses 'jose' for better compatibility with Vercel/Next.js Serverless environments.
 */
export async function generateAppleDeveloperToken() {
  const APPLE_KEY_ID = process.env.APPLE_KEY_ID?.trim();
  const APPLE_ISSUER_ID = process.env.APPLE_UUID?.trim(); 
  let APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.trim();

  if (!APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_PRIVATE_KEY) {
    console.error("Missing Apple Analytics API credentials.");
    return null;
  }

  // Sanitization
  if (APPLE_PRIVATE_KEY.startsWith('"') && APPLE_PRIVATE_KEY.endsWith('"')) APPLE_PRIVATE_KEY = APPLE_PRIVATE_KEY.slice(1, -1);
  if (APPLE_PRIVATE_KEY.startsWith("'") && APPLE_PRIVATE_KEY.endsWith("'")) APPLE_PRIVATE_KEY = APPLE_PRIVATE_KEY.slice(1, -1);
  
  APPLE_PRIVATE_KEY = APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  try {
    // Import the PKCS8 key using native jose logic
    const ecPrivateKey = await jose.importPKCS8(APPLE_PRIVATE_KEY, 'ES256');

    const token = await new jose.SignJWT({})
      .setProtectedHeader({
        alg: 'ES256',
        kid: APPLE_KEY_ID,
        typ: 'JWT'
      })
      .setIssuer(APPLE_ISSUER_ID)
      .setAudience('mr-v1')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 60)
      .setExpirationTime('15m')
      .sign(ecPrivateKey);

    return token;
  } catch (error: any) {
    console.error("JOSE Token Generation Error:", error.message);
    return null;
  }
}

