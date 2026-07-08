import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Mail, Lock, LogIn, Mic } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Display session expired toast if redirected from auth interceptor
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      // Small timeout to allow ToastProvider initialization
      setTimeout(() => {
        toastWarning('Your login session has expired. Please sign in again.');
      }, 300);
    }
  }, [searchParams, toastWarning]);

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toastSuccess('Successfully signed in. Welcome back!');
      navigate('/dashboard');
    } else {
      toastError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-955 relative p-4 transition-colors duration-300">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-card max-w-md w-full p-8 rounded-3xl z-10 backdrop-blur-md">
        {/* Brand logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md transform hover:scale-105 transition-transform">
            <Mic size={24} />
          </Link>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white mt-2">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500">Sign in to assess your pronunciation</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="name@company.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 dark:border-rose-500/40'
                    : 'border-slate-200 dark:border-dark-800/80 text-slate-800 dark:text-white'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500 pl-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 dark:border-rose-500/40'
                    : 'border-slate-200 dark:border-dark-800/80 text-slate-800 dark:text-white'
                }`}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-rose-500 pl-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={16} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
