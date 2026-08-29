import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';

const logoUrl = 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/f58dfcce-93e8-4fa3-a8d4-b82a8b19c9dc_compressed_c89e2e3e7e3dc1f6adaa98235aa55554.webp';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { signIn, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setSubmitting(true);

    const { error, role } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setErrMsg(error);
      return;
    }

    if (role === 'admin' || role === 'official') {
      navigate('/admin');
      return;
    }

    navigate('/dashboard');
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrMsg('Enter your email first, then click Forgot Password.');
      return;
    }
    setErrMsg('');
    try {
      const { default: supabase } = await import('@/hooks/useSupabase');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setErrMsg(error.message);
      } else {
        setForgotSent(true);
      }
    } catch {
      setErrMsg('Failed to send reset email. Try again.');
    }
  };

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
              Welcome Back
            </h1>
            <p className="text-sm text-foreground-400">
              Sign in to your TribeDala account
            </p>
          </div>

          {/* OAuth Buttons */}
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
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => signInWithOAuth('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-background-300/60 bg-foreground-50 text-sm font-medium text-background-50 hover:bg-foreground-100 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-background-300/40" />
            <span className="text-xs text-foreground-600 font-medium">or</span>
            <div className="flex-1 h-px bg-background-300/40" />
          </div>

          <form onSubmit={handleSubmit}>
            {errMsg && (
              <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400 mb-5 flex items-start gap-2">
                <i className="ri-error-warning-line mt-0.5 shrink-0" />
                <span>{errMsg}</span>
              </div>
            )}

            {forgotSent && (
              <div className="p-3 rounded-md bg-primary-500/10 border border-primary-500/30 text-sm text-primary-400 mb-5 flex items-start gap-2">
                <i className="ri-mail-check-line mt-0.5 shrink-0" />
                <span>Password reset link sent! Check your inbox.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-foreground-200 mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground-200">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary-500 hover:text-primary-400 font-medium transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full px-4 py-3 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 text-sm cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-foreground-400">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
                Create one
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