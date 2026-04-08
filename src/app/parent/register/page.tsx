'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

type PasswordStrength = 'weak' | 'fair' | 'strong';
type FieldError = string;

function getPasswordStrength(password: string): {
  strength: PasswordStrength;
  score: number;
  label: string;
  checks: { label: string; met: boolean }[];
} {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains an uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains a special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;

  let strength: PasswordStrength = 'weak';
  let label = 'Weak';

  if (score >= 4) {
    strength = 'strong';
    label = 'Strong';
  } else if (score >= 3) {
    strength = 'fair';
    label = 'Fair';
  }

  return { strength, score, label, checks };
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: 'bg-kids-coral',
  fair: 'bg-kids-sun',
  strong: 'bg-kids-grass',
};

const strengthBarBg: Record<PasswordStrength, string> = {
  weak: 'bg-kids-coral/20',
  fair: 'bg-kids-sun/20',
  strong: 'bg-kids-grass/20',
};

const strengthBarWidth: Record<PasswordStrength, string> = {
  weak: 'w-1/3',
  fair: 'w-2/3',
  strong: 'w-full',
};

const strengthTextColor: Record<PasswordStrength, string> = {
  weak: 'text-kids-coral',
  fair: 'text-kids-warning',
  strong: 'text-kids-success',
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [nameError, setNameError] = useState<FieldError>('');
  const [emailError, setEmailError] = useState<FieldError>('');
  const [passwordError, setPasswordError] = useState<FieldError>('');
  const [confirmError, setConfirmError] = useState<FieldError>('');

  const passwordAnalysis = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const justRegistered = searchParams.get('registered') === 'true';

  const validateForm = (): boolean => {
    let valid = true;

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setServerError('');

    if (!name.trim() || name.trim().length < 2) {
      setNameError('Please enter your full name (at least 2 characters).');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Please create a password.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter.');
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setServerError(
          'An account with this email already exists. Try signing in instead.',
        );
      } else if (res.status === 400) {
        setServerError(
          data.error || 'Please check your information and try again.',
        );
      } else if (!res.ok) {
        setServerError('Something went wrong. Please try again later.');
      } else {
        router.push('/parent/login?registered=true');
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    name.trim().length >= 2 &&
    email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-kids-offwhite flex items-center justify-center p-4 safe-top safe-bottom">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl sm:text-5xl font-nunito font-black text-gradient-rainbow"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            KidsVerse
          </motion.h1>
          <p className="text-kids-text-secondary font-nunito mt-2">
            Create a free parent account to get started
          </p>
        </div>

        {/* Registration Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-kids-lg p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Success Banner (from redirect) */}
          {justRegistered && (
            <motion.div
              className="mb-6 p-3 bg-kids-grass/10 border border-kids-grass/20 rounded-2xl text-kids-success text-sm font-nunito"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="size-4 inline-block mr-1" aria-hidden="true" />
              Account created! You can now sign in below.
            </motion.div>
          )}

          {/* Server Error */}
          {serverError && (
            <motion.div
              className="mb-6 p-3 bg-kids-coral/10 border border-kids-coral/20 rounded-2xl text-kids-coral text-sm font-nunito"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
            >
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-nunito font-bold text-kids-dark mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted"
                  aria-hidden="true"
                />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-kids-offwhite font-nunito text-kids-dark placeholder:text-kids-text-muted focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors ${
                    nameError
                      ? 'border-kids-coral focus:border-kids-coral'
                      : 'border-kids-lightgray focus:border-kids-sky'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {nameError && (
                <motion.p
                  className="mt-1.5 text-xs text-kids-coral font-nunito flex items-center gap-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  role="alert"
                >
                  <X className="size-3 shrink-0" aria-hidden="true" />
                  {nameError}
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-nunito font-bold text-kids-dark mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted"
                  aria-hidden="true"
                />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-kids-offwhite font-nunito text-kids-dark placeholder:text-kids-text-muted focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors ${
                    emailError
                      ? 'border-kids-coral focus:border-kids-coral'
                      : 'border-kids-lightgray focus:border-kids-sky'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <motion.p
                  className="mt-1.5 text-xs text-kids-coral font-nunito flex items-center gap-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  role="alert"
                >
                  <X className="size-3 shrink-0" aria-hidden="true" />
                  {emailError}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-nunito font-bold text-kids-dark mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted"
                  aria-hidden="true"
                />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className={`w-full pl-11 pr-11 py-3 rounded-2xl border-2 bg-kids-offwhite font-nunito text-kids-dark placeholder:text-kids-text-muted focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors ${
                    passwordError
                      ? 'border-kids-coral focus:border-kids-coral'
                      : 'border-kids-lightgray focus:border-kids-sky'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kids-text-muted hover:text-kids-dark transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>

              {/* Password Error */}
              {passwordError && (
                <motion.p
                  className="mt-1.5 text-xs text-kids-coral font-nunito flex items-center gap-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  role="alert"
                >
                  <X className="size-3 shrink-0" aria-hidden="true" />
                  {passwordError}
                </motion.p>
              )}

              {/* Password Strength Indicator */}
              {password.length > 0 && !passwordError && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {/* Strength Bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`flex-1 h-2 rounded-full ${strengthBarBg[passwordAnalysis.strength]}`}
                    >
                      <motion.div
                        className={`h-full rounded-full ${strengthColors[passwordAnalysis.strength]} ${strengthBarWidth[passwordAnalysis.strength]}`}
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            passwordAnalysis.score === 1
                              ? '33%'
                              : passwordAnalysis.score === 2
                                ? '33%'
                                : passwordAnalysis.score === 3
                                  ? '66%'
                                  : '100%',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span
                      className={`text-xs font-nunito font-bold ${strengthTextColor[passwordAnalysis.strength]}`}
                    >
                      {passwordAnalysis.label}
                    </span>
                  </div>

                  {/* Requirements Checklist */}
                  <ul className="space-y-1">
                    {passwordAnalysis.checks.map((check) => (
                      <li
                        key={check.label}
                        className={`text-xs font-nunito flex items-center gap-1.5 transition-colors ${
                          check.met
                            ? 'text-kids-success'
                            : 'text-kids-text-muted'
                        }`}
                      >
                        {check.met ? (
                          <Check className="size-3 shrink-0" aria-hidden="true" />
                        ) : (
                          <X className="size-3 shrink-0" aria-hidden="true" />
                        )}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-nunito font-bold text-kids-dark mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted"
                  aria-hidden="true"
                />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError('');
                  }}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  className={`w-full pl-11 pr-11 py-3 rounded-2xl border-2 bg-kids-offwhite font-nunito text-kids-dark placeholder:text-kids-text-muted focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors ${
                    confirmError
                      ? 'border-kids-coral focus:border-kids-coral'
                      : confirmPassword &&
                          password &&
                          confirmPassword === password
                        ? 'border-kids-grass focus:border-kids-grass'
                        : 'border-kids-lightgray focus:border-kids-sky'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kids-text-muted hover:text-kids-dark transition-colors p-1"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {confirmError && (
                <motion.p
                  className="mt-1.5 text-xs text-kids-coral font-nunito flex items-center gap-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  role="alert"
                >
                  <X className="size-3 shrink-0" aria-hidden="true" />
                  {confirmError}
                </motion.p>
              )}
              {confirmPassword &&
                password &&
                confirmPassword === password &&
                !confirmError && (
                  <motion.p
                    className="mt-1.5 text-xs text-kids-success font-nunito flex items-center gap-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Check className="size-3 shrink-0" aria-hidden="true" />
                    Passwords match
                  </motion.p>
                )}
            </div>

            {/* Create Account Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-3.5 rounded-2xl bg-kids-sky text-white font-nunito font-bold text-lg shadow-kids hover:bg-kids-blue hover:shadow-kids-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky focus-visible:ring-offset-2"
              whileHover={isLoading ? {} : { scale: 1.02 }}
              whileTap={isLoading ? {} : { scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.span
                    className="size-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-kids-lightgray" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-kids-text-muted font-nunito">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <motion.button
            type="button"
            onClick={() => {
              const callbackUrl = encodeURIComponent('/parent');
              window.location.href = `/api/auth/signin/google?callbackUrl=${callbackUrl}`;
            }}
            className="w-full py-3.5 rounded-2xl border-2 border-kids-lightgray bg-white text-kids-dark font-nunito font-bold text-base shadow-kids hover:border-kids-sky/30 hover:shadow-kids-hover transition-all flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky focus-visible:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </motion.button>

          {/* Terms */}
          <p className="text-center mt-5 text-xs text-kids-text-muted font-nunito leading-relaxed">
            By creating an account, you agree to our{' '}
            <a
              href="#"
              className="text-kids-sky underline underline-offset-1 hover:text-kids-blue transition-colors"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="text-kids-sky underline underline-offset-1 hover:text-kids-blue transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </motion.div>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-kids-text-secondary font-nunito">
          Already have an account?{' '}
          <a
            href="/parent/login"
            className="text-kids-sky font-bold hover:text-kids-blue underline underline-offset-2 transition-colors"
          >
            Sign in
          </a>
        </p>

        {/* COPPA Notice */}
        <p className="text-center mt-4 text-xs text-kids-text-muted font-nunito max-w-sm mx-auto">
          <Sparkles
            className="size-3 inline-block mr-1"
            aria-hidden="true"
          />
          COPPA compliant — We never collect data from children. All data is
          tied to your parent account.
        </p>
      </motion.div>
    </div>
  );
}
