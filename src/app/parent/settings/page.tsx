'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertTriangle,
  Trash2,
  Shield,
  KeyRound,
  Check,
  X,
} from 'lucide-react';

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─── Password Strength ─── */

interface StrengthResult {
  score: number;       // 0-4
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function evaluateStrength(password: string): StrengthResult {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-kids-coral', checks };
  if (score === 2) return { score, label: 'Fair', color: 'bg-kids-peach', checks };
  if (score === 3) return { score, label: 'Good', color: 'bg-kids-sun', checks };
  return { score, label: 'Strong', color: 'bg-kids-grass', checks };
}

/* ─── Password Toggle Input ─── */

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-nunito font-bold text-kids-dark text-sm">
        {label}
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-kids-text-muted pointer-events-none" />
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="font-nunito pl-9 pr-10 rounded-2xl border-kids-lightgray focus-visible:ring-kids-sky/40 focus-visible:border-kids-sky h-11"
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-kids-text-muted hover:text-kids-dark transition-colors p-0.5"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-kids-coral font-nunito font-semibold flex items-center gap-1">
          <X className="size-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function SettingsPage() {
  const { data: session, status } = useSession();

  /* Password state */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  /* Danger zone state */
  const [deleteInput, setDeleteInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* Derived values */
  const provider = useMemo(() => {
    if (!session?.user) return null;
    return session.user.image ? 'Google' : 'Email';
  }, [session]);

  const strength = useMemo(() => evaluateStrength(newPassword), [newPassword]);

  const canChangePassword = useMemo(() => {
    return (
      currentPassword.length > 0 &&
      newPassword.length >= 8 &&
      strength.checks.uppercase &&
      strength.checks.number &&
      confirmPassword === newPassword &&
      confirmPassword.length > 0
    );
  }, [currentPassword, newPassword, confirmPassword, strength]);

  const canDelete = useMemo(() => {
    return deleteInput.trim() === 'DELETE';
  }, [deleteInput]);

  /* Handlers */
  const handleChangePassword = useCallback(async () => {
    if (!canChangePassword) return;
    setIsChangingPassword(true);
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to change password');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  }, [canChangePassword, currentPassword, newPassword]);

  const handleDeleteAccount = useCallback(async () => {
    if (!canDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account');
        setShowDeleteConfirm(false);
        return;
      }

      toast.success('Account deleted. Goodbye!');
      signOut({ callbackUrl: '/parent/login' });
    } catch {
      toast.error('Something went wrong. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }, [canDelete]);

  /* Loading guard */
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-10 h-10 rounded-full border-4 border-kids-sky/30 border-t-kids-sky"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const user = session.user;

  return (
    <motion.section
      className="max-w-2xl mx-auto space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Account Settings"
    >
      {/* Page heading */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl sm:text-3xl font-nunito font-black text-kids-dark tracking-tight">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-kids-text-secondary font-nunito">
          Manage your account, security, and preferences
        </p>
      </motion.div>

      {/* ─── 1. Account Info Card ─── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-kids border border-kids-lightgray/50 p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center size-10 rounded-2xl bg-kids-sky/10">
            <User className="size-5 text-kids-sky" />
          </div>
          <h2 className="text-lg font-nunito font-bold text-kids-dark">
            Account Information
          </h2>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-3 border-b border-kids-lightgray/60">
            <span className="text-sm text-kids-text-muted font-nunito font-semibold w-32 shrink-0">
              Name
            </span>
            <span className="font-nunito font-bold text-kids-dark flex items-center gap-2">
              <User className="size-4 text-kids-text-muted" />
              {user.name || 'Not set'}
            </span>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-3 border-b border-kids-lightgray/60">
            <span className="text-sm text-kids-text-muted font-nunito font-semibold w-32 shrink-0">
              Email
            </span>
            <span className="font-nunito font-bold text-kids-dark flex items-center gap-2">
              <Mail className="size-4 text-kids-text-muted" />
              {user.email || 'Not set'}
            </span>
          </div>

          {/* Provider */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-3">
            <span className="text-sm text-kids-text-muted font-nunito font-semibold w-32 shrink-0">
              Sign-in Method
            </span>
            <span className="inline-flex items-center gap-2 font-nunito font-bold">
              <Shield className="size-4 text-kids-grass" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-kids-grass/10 text-kids-grass text-xs font-bold">
                {provider}
              </span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── 2. Change Password Card ─── */}
      {provider === 'Email' ? (
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-kids border border-kids-lightgray/50 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center size-10 rounded-2xl bg-kids-lavender/30">
              <KeyRound className="size-5 text-kids-purple" />
            </div>
            <h2 className="text-lg font-nunito font-bold text-kids-dark">
              Change Password
            </h2>
          </div>

          {passwordSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="flex items-center justify-center size-16 rounded-full bg-kids-grass/10 mb-4">
                <Check className="size-8 text-kids-grass" />
              </div>
              <p className="font-nunito font-bold text-kids-dark text-lg">
                Password Updated!
              </p>
              <p className="font-nunito text-sm text-kids-text-secondary mt-1">
                Your password has been changed successfully.
              </p>
              <Button
                variant="outline"
                onClick={() => setPasswordSuccess(false)}
                className="mt-5 rounded-2xl font-nunito font-bold border-kids-lightgray text-kids-text-secondary hover:bg-kids-lightgray/50"
              >
                Change Again
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <PasswordField
                id="current-password"
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                disabled={isChangingPassword}
              />

              <PasswordField
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password"
                disabled={isChangingPassword}
              />

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-nunito font-semibold text-kids-text-secondary">
                      Password Strength
                    </span>
                    <span className="text-xs font-nunito font-bold text-kids-dark">
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-kids-lightgray overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${strength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.score / 4) * 100}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <StrengthCheck label="8+ characters" pass={strength.checks.length} />
                    <StrengthCheck label="Uppercase letter" pass={strength.checks.uppercase} />
                    <StrengthCheck label="Number" pass={strength.checks.number} />
                    <StrengthCheck label="Special character" pass={strength.checks.special} />
                  </div>
                </motion.div>
              )}

              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                disabled={isChangingPassword}
                error={
                  confirmPassword.length > 0 && confirmPassword !== newPassword
                    ? 'Passwords do not match'
                    : undefined
                }
              />

              <Button
                onClick={handleChangePassword}
                disabled={!canChangePassword || isChangingPassword}
                className="w-full h-11 rounded-2xl font-nunito font-bold text-sm bg-kids-sky hover:bg-kids-blue text-white shadow-kids disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {isChangingPassword ? (
                  <motion.span
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Updating Password...
                  </motion.span>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-kids border border-kids-lightgray/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center size-10 rounded-2xl bg-kids-lavender/30">
              <KeyRound className="size-5 text-kids-purple" />
            </div>
            <h2 className="text-lg font-nunito font-bold text-kids-dark">
              Change Password
            </h2>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-kids-sun/10 border border-kids-sun/30 p-4">
            <Shield className="size-5 text-kids-warning shrink-0 mt-0.5" />
            <p className="text-sm font-nunito text-kids-text-secondary leading-relaxed">
              Your account uses <span className="font-bold text-kids-dark">Google Sign-In</span>.
              Password management is handled through your Google account settings.
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── 3. Danger Zone Card ─── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-kids border-2 border-kids-coral/20 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center size-10 rounded-2xl bg-kids-coral/10">
            <AlertTriangle className="size-5 text-kids-coral" />
          </div>
          <div>
            <h2 className="text-lg font-nunito font-bold text-kids-coral">
              Danger Zone
            </h2>
            <p className="text-xs font-nunito text-kids-text-muted">
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-kids-coral/5 border border-kids-coral/15 p-4 space-y-4">
          <div>
            <h3 className="font-nunito font-bold text-kids-dark text-sm">
              Delete Account
            </h3>
            <p className="text-xs font-nunito text-kids-text-secondary mt-1 leading-relaxed">
              Permanently delete your account and all associated data, including child profiles,
              progress, and subscriptions. This action cannot be undone.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(true);
                setDeleteInput('');
              }}
              className="rounded-2xl font-nunito font-bold text-sm border-kids-coral/30 text-kids-coral hover:bg-kids-coral/10 hover:text-kids-coral transition-all"
            >
              <Trash2 className="size-4" />
              Delete My Account
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="delete-confirm"
                  className="font-nunito font-bold text-kids-dark text-sm"
                >
                  Type <span className="font-black text-kids-coral">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE here"
                  className="font-nunito rounded-2xl border-kids-coral/30 focus-visible:ring-kids-coral/30 focus-visible:border-kids-coral h-11"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!canDelete || isDeleting}
                  className="flex-1 h-11 rounded-2xl font-nunito font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <motion.span
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.span
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Deleting...
                    </motion.span>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Permanently Delete Account
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput('');
                  }}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-2xl font-nunito font-bold text-sm border-kids-lightgray text-kids-text-secondary hover:bg-kids-lightgray/50"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ─── Strength Checklist Item ─── */

function StrengthCheck({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {pass ? (
        <Check className="size-3.5 text-kids-grass shrink-0" />
      ) : (
        <X className="size-3.5 text-kids-text-muted shrink-0" />
      )}
      <span
        className={`text-xs font-nunito font-semibold ${
          pass ? 'text-kids-grass' : 'text-kids-text-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
