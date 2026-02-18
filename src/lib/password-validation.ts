export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  requirements: PasswordRequirement[];
  strength: "weak" | "medium" | "strong";
}

/**
 * Validates password against requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (@$!%*?&)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const requirements: PasswordRequirement[] = [
    {
      label: "Minimum 8 characters",
      met: password.length >= 8,
    },
    {
      label: "At least one uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      label: "At least one number (0-9)",
      met: /[0-9]/.test(password),
    },
    {
      label: "At least one special character (@$!%*?&)",
      met: /[@$!%*?&]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const isValid = metCount === requirements.length;

  // Calculate strength: weak (0-40%), medium (60-80%), strong (100%)
  const percentage = (metCount / requirements.length) * 100;
  let strength: "weak" | "medium" | "strong" = "weak";
  if (percentage === 100) {
    strength = "strong";
  } else if (percentage >= 60) {
    strength = "medium";
  }

  return {
    isValid,
    requirements,
    strength,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates username format (3-50 chars, alphanumeric, underscores, hyphens)
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * Validates phone number (flexible format)
 */
export function validatePhone(phone: string): boolean {
  // Allow international format (+231 XX XXX XXXX) or local format
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 8;
}

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
const NUMBERS = "23456789";
const SPECIAL = "@$!%*?&";

/**
 * Generates a strong password that meets all validation requirements:
 * 12+ chars, uppercase, lowercase, number, special character.
 */
export function generateStrongPassword(length: number = 16): string {
  const all = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL;
  const pick = (str: string) => str[Math.floor(Math.random() * str.length)];
  let password = pick(UPPERCASE) + pick(LOWERCASE) + pick(NUMBERS) + pick(SPECIAL);
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
