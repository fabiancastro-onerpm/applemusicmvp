import jwt from 'jsonwebtoken';

/**
 * Generates an Apple App Store Connect Token (JWT) for Music Analytics API.
 * This should ONLY be run on the server.
 */
export function generateAppleDeveloperToken() {
  const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
  const APPLE_ISSUER_ID = process.env.APPLE_UUID; // MUST use UUID for Analytics!
  let APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

  if (!APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_PRIVATE_KEY) {
    console.error("Missing Apple Analytics API environment variables.");
    return null;
  }

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
      aud: 'appstoreconnect-v1',
      iat: iat,
      exp: iat + (15 * 60) + 60, // Total 15 mins + buffer
    };

    const token = jwt.sign(payload, APPLE_PRIVATE_KEY, {
      algorithm: 'ES256',
      header: header,
    });

    return token;
  } catch (error) {
    console.error("Error generating Apple Analytics Token:", error);
    return null;
  }
}
