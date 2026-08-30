import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';

const logoUrl = 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/f58dfcce-93e8-4fa3-a8d4-b82a8b19c9dc_compressed_c89e2e3e7e3dc1f6adaa98235aa55554.webp';

const roleOptions = [
  { value: 'member', label: 'Community Member', description: 'Follow content, buy tickets, join the newsletter' },
  { value: 'creator', label: 'Creator', description: 'Podcaster, DJ, MC, Videographer, Blogger, etc.' },
  { value: 'organizer', label: 'Event Organizer', description: 'List and sell tickets for your events' },
  { value: 'business', label: 'Business / Brand', description: 'Request marketing, sponsor content, book creators' },
];

const creatorCategories = [
  { value: 'podcaster', label: 'Podcaster' },
  { value: 'dj', label: 'DJ' },
  { value: 'mc', label: 'MC / Host' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'blogger', label: 'Blogger / Writer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'other', label: 'Other' },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [creatorCategory, setCreatorCategory] = useState('podcaster');
  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, signInWithOAuth } = useAuth();

  const handleNext = () => {
    setErrMsg('');

    if (step === 1) {
      if (!fullName.trim()) {
        setErrMsg('Please enter your name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrMsg('Please enter a valid email address.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (password.length < 6) {
      setErrMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    const metadata: Record<string, unknown> = {
      full_name: fullName,
      role: selectedRole,
    };

    if (selectedRole === 'creator') {
      metadata.creator_category = creatorCategory;
    }

    const { error } = await signUp(email, password, metadata);

    if (error) {
      setErrMsg(error || 'Failed to create account. Please try again.');
      setSubmitting(false);
      console.error('Signup error:', error); // Log for debugging
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
              <i className="ri-mail-check-line text-3xl text-primary-500" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground-50 mb-3">
              Check your email
            </h1>
            <p className="text-sm text-foreground-400 mb-8 leading-relaxed">
              We sent a confirmation link to <strong className="text-foreground-200">{email}</strong>.
              Click the link to verify your account and join the Tribe.
            </p>
            <Link to="/login" className="btn-primary text-sm">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-6">
              <img src={logoUrl} alt="TribeDala" className="h-9 w-auto object-contain mx-auto" />
            </Link>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground-50 mb-2">
              Join the Tribe
            </h1>
            <p className="text-sm text-foreground-400">
              Step {step} of 2 — {step === 1 ? 'About you' : 'Set your password'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary-500' : 'bg-background-300'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary-500' : 'bg-background-300'}`} />
          </div>

          {/* OAuth Buttons */}
          {step === 1 && (
            <>
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => signInWithOAuth('google')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-background-300/60 bg-background-50 text-sm font-medium text-foreground-200 hover:bg-background-100 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </button>

                <button
                  type="button"
                  onClick={() => signInWithOAuth('apple')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-background-300/60 bg-foreground-50 text-sm font-medium text-background-50 hover:bg-foreground-100 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Sign up with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-background-300/40" />
                <span className="text-xs text-foreground-600 font-medium">or use email</span>
                <div className="flex-1 h-px bg-background-300/40" />
              </div>
            </>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
            {errMsg && (
              <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400 mb-5">
                {errMsg}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-foreground-200 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    name="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-foreground-200 mb-1.5">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-200 mb-3">
                    I want to join as a...
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`w-full text-left p-3 rounded-md border transition-all duration-200 ${
                          selectedRole === role.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-background-300/60 bg-background-100 hover:border-background-400'
                        }`}
                      >
                        <span className="block text-sm font-medium text-foreground-100">{role.label}</span>
                        <span className="block text-xs text-foreground-500 mt-0.5">{role.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedRole === 'creator' && (
                  <div>
                    <label htmlFor="creator-category" className="block text-sm font-medium text-foreground-200 mb-1.5">
                      Creator Category
                    </label>
                    <select
                      id="creator-category"
                      value={creatorCategory}
                      onChange={(e) => setCreatorCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      {creatorCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="w-full btn-primary py-3 text-sm">
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="p-4 rounded-md bg-background-100 border border-background-300/60">
                  <p className="text-sm text-foreground-200">
                    <span className="text-foreground-500">Joining as:</span>{' '}
                    {roleOptions.find((r) => r.value === selectedRole)?.label}
                    {selectedRole === 'creator' && (
                      <> &middot; {creatorCategories.find((c) => c.value === creatorCategory)?.label}</>
                    )}
                  </p>
                  <p className="text-xs text-foreground-500 mt-1">{fullName} &middot; {email}</p>
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-foreground-200 mb-1.5">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground-200 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    name="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrMsg(''); }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 py-3 text-sm"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-foreground-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
                Sign in
              </Link>
            </p>
            <p>
              <Link to="/" className="text-xs text-foreground-500 hover:text-foreground-300 transition-colors">
                &larr; Back to homepage
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}