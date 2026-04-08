/**
 * Password utility for credential-based authentication
 * Uses Bun's built-in crypto for password hashing (compatible with bcrypt)
 */
import { createHash, randomBytes } from 'crypto';

// Simple password hashing using SHA-256 with salt (for demo purposes)
// In production, use bcrypt with the bcryptjs library

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const computedHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return hash === computedHash;
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
