'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/parent');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', {
        callbackUrl: '/parent',
      });
    } catch {
      setError('Could not connect to Google. Please try again.');
      setGoogleLoading(false);
    }
  };

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
            Parent Portal — Sign in to manage your child&apos;s learning
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-kids-lg p-6 sm:p-8">
          {/* Success Banner (after registration) */}
          {justRegistered && (
            <motion.div
              className="mb-6 p-3 bg-kids-grass/10 border border-kids-grass/20 rounded-2xl text-kids-success text-sm font-nunito"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="size-4 inline-block mr-1" aria-hidden="true" />
              Account created successfully! Please sign in below.
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-3 bg-kids-coral/10 border border-kids-coral/20 rounded-2xl text-kids-coral text-sm font-nunito"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-nunito font-bold text-kids-dark mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-kids-lightgray bg-kids-offwhite font-nunito text-kids-dark placeholder:text-kids-text-muted focus:border-kids-sky focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-nunito font-bold text-kids-dark mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border-2 border-kids-lightgray bg-kids-offwhite font-nunito text-kids-dark placeholder:text-kids-text-muted focus:border-kids-sky focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kids-text-muted hover:text-kids-dark transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-2xl bg-kids-sky text-white font-nunito font-bold text-lg shadow-kids hover:bg-kids-blue hover:shadow-kids-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky focus-visible:ring-offset-2"
              whileHover={isLoading ? {} : { scale: 1.02 }}
              whileTap={isLoading ? {} : { scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.span
                    className="size-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
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
              <span className="bg-white px-3 text-kids-text-muted font-nunito">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3.5 rounded-2xl border-2 border-kids-lightgray bg-white text-kids-dark font-nunito font-bold text-base shadow-kids hover:border-kids-sky/30 hover:shadow-kids-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky focus-visible:ring-offset-2"
            whileHover={googleLoading ? {} : { scale: 1.02 }}
            whileTap={googleLoading ? {} : { scale: 0.98 }}
          >
            {googleLoading ? (
              <>
                <motion.span
                  className="size-5 border-2 border-kids-sky border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </motion.button>
        </div>

        {/* Register Link */}
        <p className="text-center mt-6 text-sm text-kids-text-secondary font-nunito">
          Don&apos;t have an account?{' '}
          <a
            href="/parent/register"
            className="text-kids-sky font-bold hover:text-kids-blue underline underline-offset-2 transition-colors"
          >
            Create one free
          </a>
        </p>

        {/* COPPA Notice */}
        <p className="text-center mt-4 text-xs text-kids-text-muted font-nunito max-w-sm mx-auto">
          <Sparkles className="size-3 inline-block mr-1" aria-hidden="true" />
          COPPA compliant — We never collect data from children. All data is tied to your parent account.
        </p>
      </motion.div>
    </div>
  );
}
