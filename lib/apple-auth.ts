import jwt from 'jsonwebtoken';

/**
 * Generates an Apple Developer Token (JWT) for the Apple Music API.
 * This should ONLY be run on the server.
 */
export function generateAppleDeveloperToken() {
  const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
  const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
  const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

  if (!APPLE_KEY_ID || !APPLE_TEAM_ID || !APPLE_PRIVATE_KEY) {
    console.error("Missing Apple Music API environment variables.");
    return null;
  }

  try {
    // Standard JWT header: alg is ES256, kid is your Key ID
    const header = {
      alg: 'ES256',
      kid: APPLE_KEY_ID,
    };

    // Standard JWT payload
    const payload = {
      iss: APPLE_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expires in 1 hour
    };

    // Sign the token using the private key and ES256 algorithm
    // Note: private key must be handled as a string
    const token = jwt.sign(payload, APPLE_PRIVATE_KEY, {
      algorithm: 'ES256',
      header: header,
    });

    return token;
  } catch (error) {
    console.error("Error generating Apple Music Developer Token:", error);
    return null;
  }
}
