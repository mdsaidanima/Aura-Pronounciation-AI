import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { User, Mail, Lock, UserPlus, Mic } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await signup(data.name, data.email, data.password);
    if (result.success) {
      toastSuccess('Registration successful. Welcome to Aura Pronunciation AI!');
      navigate('/dashboard');
    } else {
      toastError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 relative p-4 transition-colors duration-300">
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
            Create Account
          </h2>
          <p className="text-sm text-slate-500">Register to start pronunciation training</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 dark:border-rose-500/40'
                    : 'border-slate-200 dark:border-dark-800/80 text-slate-800 dark:text-white'
                }`}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-semibold text-rose-500 pl-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1">
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
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="Min 6 characters"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 dark:border-rose-500/40'
                    : 'border-slate-200 dark:border-dark-800/80 text-slate-800 dark:text-white'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-rose-500 pl-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="Confirm password"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus ${
                  errors.confirmPassword
                    ? 'border-rose-400 focus:border-rose-500 dark:border-rose-500/40'
                    : 'border-slate-200 dark:border-dark-800/80 text-slate-800 dark:text-white'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-semibold text-rose-500 pl-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
