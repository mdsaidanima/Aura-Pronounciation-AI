import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldAlert, 
  CheckCircle, 
  Activity, 
  Award,
  TrendingUp,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm();

  // Password Update Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        setStats(response.data.stats);
        
        // Seed form fields
        setProfileValue('name', response.data.name);
        setProfileValue('email', response.data.email);
      } catch (error) {
        console.error('Fetch profile stats error:', error);
        toastError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [setProfileValue, toastError]);

  const onUpdateProfile = async (data) => {
    try {
      const response = await api.put('/profile', { name: data.name, email: data.email });
      updateProfileState(response.data);
      toastSuccess('Profile updated successfully.');
    } catch (error) {
      console.error('Update profile error:', error);
      toastError(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await api.put('/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toastSuccess('Password updated successfully.');
      resetPasswordForm();
    } catch (error) {
      console.error('Change password error:', error);
      toastError(error.response?.data?.message || 'Failed to change password.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-36 bg-slate-200 dark:bg-dark-900 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse"></div>
          <div className="h-44 bg-slate-200 dark:bg-dark-900 rounded-3xl animate-pulse md:col-span-2"></div>
        </div>
      </div>
    );
  }

  // Get Initials for Avatar
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U';

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your credentials, preferences, and review speaking stats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIDE PROFILE SUMMARY CARD & STATISTICS */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="glass-card p-6 rounded-3xl text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg border border-primary-500/25">
              {initials}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl border border-slate-250/20">
              Account Status: Active
            </div>
          </div>

          {/* Quick aggregates card */}
          <div className="glass-card p-6 rounded-3xl text-left space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Metrics Aggregate</h3>
            
            <div className="space-y-3.5 text-xs font-medium text-slate-655 dark:text-slate-350">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-primary-500" />
                  <span>Total Sessions</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{stats?.totalReports || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-accent-500" />
                  <span>Avg Accuracy</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{stats?.averageAccuracy || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span>Avg Fluency</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{stats?.averageFluency || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS FORMS CONTAINER */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE UPDATE FORM */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-800/40 pb-3">
              <Settings size={18} className="text-primary-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Account Details</h3>
            </div>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="grid sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800/80 bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus text-slate-800 dark:text-white"
                    {...registerProfile('name', { required: 'Name is required' })}
                  />
                </div>
                {profileErrors.name && (
                  <p className="text-xs font-semibold text-rose-500 pl-1">{profileErrors.name.message}</p>
                )}
              </div>

              {/* Email */}
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800/80 bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus text-slate-800 dark:text-white"
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-xs font-semibold text-rose-500 pl-1">{profileErrors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="btn-primary text-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {isProfileSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* PASSWORD CHANGE FORM */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-800/40 pb-3">
              <Lock size={18} className="text-primary-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800/80 bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus text-slate-800 dark:text-white"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs font-semibold text-rose-500 pl-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800/80 bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus text-slate-800 dark:text-white"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs font-semibold text-rose-500 pl-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800/80 bg-white/50 dark:bg-dark-900/50 text-sm form-input-focus text-slate-800 dark:text-white"
                      {...registerPassword('confirmNewPassword', {
                        required: 'Please confirm your new password',
                        validate: (val) => val === newPassword || 'Passwords do not match',
                      })}
                    />
                  </div>
                  {passwordErrors.confirmNewPassword && (
                    <p className="text-xs font-semibold text-rose-500 pl-1">{passwordErrors.confirmNewPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="btn-primary text-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {isPasswordSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
