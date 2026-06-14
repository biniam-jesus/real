/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { useLanguage } from '../lib/translations';
import { UtensilsCrossed, Sparkles, Mail, Key, User, Plus, X, Laptop, Shield, UserCheck, LogIn, HelpCircle } from 'lucide-react';
import { isSupabaseConfigured, supabaseSync, supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // "Create New Account" Facebook-style Registration modal state
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('Waiter');
  const [regBranch, setRegBranch] = useState<'Shegawan' | 'Teyim Shega'>('Shegawan');

  // Interactive Forgot Password Helper
  const [showForgotTip, setShowForgotTip] = useState<boolean>(false);

  // Pre-seed local storage with dummy demonstration accounts so testing is smooth out-of-the-box
  useEffect(() => {
    const dummyKey = 'shega_local_users';
    const existing = localStorage.getItem(dummyKey);
    if (!existing) {
      const demoUsers = [
        { email: 'admin@shega.com', password: '123456', username: 'Super Admin', role: 'Admin', branch: 'Shegawan' },
        { email: 'chef@shega.com', password: '123456', username: 'Head Chef Aster', role: 'Chef', branch: 'Shegawan' },
        { email: 'waiter@shega.com', password: '123456', username: 'Waiter Biniam', role: 'Waiter', branch: 'Shegawan' },
      ];
      localStorage.setItem(dummyKey, JSON.stringify(demoUsers));
    }
  }, []);

  // One-click quick login handler for demo comfort
  const handleQuickDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setErrorMsg('');
    setSuccessMsg('Selected demo credentials populated!');
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = email.trim();
    const targetPassword = password.trim();

    if (!targetEmail || !targetPassword) {
      setErrorMsg('Please supply a valid Email and Password');
      return;
    }

    // --- CASE 1: OFFLINE FALLBACK OR UNCONFIGURED SUPABASE DATABASE ---
    if (!supabase) {
      try {
        setAuthLoading(true);
        // Realistic high-quality platform network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const storedUsers = JSON.parse(localStorage.getItem('shega_local_users') || '[]');
        const found = storedUsers.find(
          (u: any) => u.email.toLowerCase() === targetEmail.toLowerCase() && u.password === targetPassword
        );

        if (!found) {
          setErrorMsg('Invalid email address or incorrect password. Please register or try admin@shega.com');
          return;
        }

        onLogin({
          username: found.username,
          role: found.role as UserRole,
          branch: found.branch as 'Shegawan' | 'Teyim Shega'
        });
      } catch (err) {
        setErrorMsg('Authentication error. Please retry.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    // --- CASE 2: LIVE SUPABASE DEPLOYED PRODUCTION DATABASE ---
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword
      });

      if (error) throw error;

      if (data?.user) {
        const metadata = data.user.user_metadata || {};
        const finalRole: UserRole = (metadata.role as UserRole) || 'Admin';
        const finalBranch = (metadata.branch as 'Shegawan' | 'Teyim Shega') || 'Shegawan';
        const finalUsername = metadata.username || data.user.email?.split('@')[0] || 'Operator';

        onLogin({
          username: finalUsername,
          role: finalRole,
          branch: finalBranch
        });
      }
    } catch (err: any) {
      console.error('Supabase Login Error:', err);
      setErrorMsg(err.message || 'Verification failed. Wrong email/password combination or unconfirmed account.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign up from the classic Facebook-style modal
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetName = regName.trim();
    const targetEmail = regEmail.trim();
    const targetPassword = regPassword.trim();

    if (!targetName || !targetEmail || !targetPassword) {
      setErrorMsg('All fields are required to establish an identity profile.');
      return;
    }

    if (targetPassword.length < 6) {
      setErrorMsg('For security, passcodes must contain at least 6 characters.');
      return;
    }

    if (regRole === 'Admin') {
      setErrorMsg('Admin accounts cannot be registered from the frontend. They must be provisioned directly in Supabase.');
      return;
    }

    // --- CASE 1: LOCAL SANDBOX STORAGE REGISTRATION ---
    if (!supabase) {
      try {
        setAuthLoading(true);
        await new Promise(resolve => setTimeout(resolve, 650));

        const storedUsers = JSON.parse(localStorage.getItem('shega_local_users') || '[]');
        if (storedUsers.some((u: any) => u.email.toLowerCase() === targetEmail.toLowerCase())) {
          setErrorMsg('This email address has already been registered in our database roster.');
          return;
        }

        const newUser = {
          email: targetEmail,
          password: targetPassword,
          username: targetName,
          role: regRole,
          branch: regBranch
        };

        storedUsers.push(newUser);
        localStorage.setItem('shega_local_users', JSON.stringify(storedUsers));

        setShowSignupModal(false);
        setSuccessMsg(`Identity "${targetName}" created successfully! Logging you in...`);
        
        // Auto login on local sandbox success
        onLogin({
          username: targetName,
          role: regRole,
          branch: regBranch
        });
      } catch (err) {
        setErrorMsg('Failed to register identity context.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    // --- CASE 2: LIVE SUPABASE AUTHSIGNUP REGISTRATION ---
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
        options: {
          data: {
            username: targetName,
            role: regRole,
            branch: regBranch
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Automatically save on the database schema matching employee registry
        await supabaseSync.saveEmployee({
          id: data.user.id || `emp-${Date.now()}`,
          username: targetName,
          pin: '0000',
          role: regRole,
          branch: regBranch
        });

        setShowSignupModal(false);
        setSuccessMsg('Registration successful! Logging you in...');

        // Perform auto-login flow by signing in with the registered credentials
        try {
          const { data: signData, error: signInError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: targetPassword
          });
          
          if (!signInError && signData?.user) {
            onLogin({
              username: targetName,
              role: regRole,
              branch: regBranch
            });
            return;
          }
        } catch (autoLoginErr) {
          console.warn('Auto-login sign in step skipped or failed:', autoLoginErr);
        }

        // Fallback if auto-signin requires email verification
        setEmail(targetEmail);
        setPassword(targetPassword);
        setSuccessMsg('Account created! Please check your email to verify your address, then sign in.');
      }
    } catch (err: any) {
      console.error('Supabase Sign Up Error:', err);
      setErrorMsg(err.message || 'Registration failed. Check format or connectivity.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-stretch font-sans text-neutral-900 selection:bg-amber-100 selection:text-amber-900 relative overflow-hidden" id="login_container">
      
      {/* Decorative Brand Top Banner Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/40 via-transparent to-transparent pointer-events-none" />

      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 flex bg-white/70 backdrop-blur-md p-1 rounded-xl border border-neutral-200/80 shadow-sm z-40">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
            language === 'en' 
              ? 'bg-amber-500 text-white shadow' 
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('am')}
          className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
            language === 'am' 
              ? 'bg-amber-500 text-white shadow' 
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          አማ
        </button>
      </div>

      {/* DUAL PANE SPLIT CONTAINER */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-screen">
        
        {/* LEFT PANEL: The iconic Facebook-style welcome text & brand declaration */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-white p-16 flex-col justify-between relative overflow-hidden select-none border-r border-neutral-200">
          
          <div className="relative z-10 max-w-lg my-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md">
                <UtensilsCrossed className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-amber-500 uppercase">
                {t('brand_name')}
              </h1>
            </div>
            
            <p className="text-2xl font-bold text-neutral-800 leading-snug">
              Shega POS helps you connect, manage inventory, track table orders, and monitor real-time kitchen operations.
            </p>
            
            <p className="text-neutral-500 text-sm">
              Use a standard enterprise account to log in. Don't have a personal workspace access code? Simply create a brand new account and select your system level access.
            </p>

            {/* Quick Stats Panel */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-neutral-100">
              <div>
                <span className="text-2xl font-black text-neutral-800">100%</span>
                <p className="text-xs text-neutral-500">Cloud Connected</p>
              </div>
              <div>
                <span className="text-2xl font-black text-neutral-800">0ms</span>
                <p className="text-xs text-neutral-500">Sync Latency</p>
              </div>
              <div>
                <span className="text-2xl font-black text-neutral-800">Active</span>
                <p className="text-xs text-neutral-500">Live Audits</p>
              </div>
            </div>
          </div>

          {/* Humble watermark footer */}
          <div className="relative z-10 text-xs text-neutral-400 mt-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
            <span>Secure Enterprise Single Sign-On</span>
          </div>
        </div>

        {/* RIGHT PANEL: Pure centered classic Facebook-style form */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 bg-neutral-50">
          
          {/* Brand header on mobile screens */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex p-3 bg-amber-500 text-white rounded-xl mb-2 shadow">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-amber-500 uppercase">{t('brand_name')}</h1>
            <p className="text-neutral-500 text-xs mt-1 px-4">
              Real-time culinary operations and staff dashboard
            </p>
          </div>

          <div className="w-full max-w-[396px] space-y-4">
            
            {/* The Main Authentication Card styled just like Facebook login form */}
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-200/70" id="login_card">
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                
                {/* Email address field */}
                <div>
                  <input
                    id="login_email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Email address or phone number"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-[14px] placeholder-neutral-400 font-normal shadow-inner bg-neutral-50/50"
                    required
                  />
                </div>

                {/* Password field */}
                <div>
                  <input
                    id="login_password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-[14px] placeholder-neutral-400 font-normal shadow-inner bg-neutral-50/50"
                    required
                  />
                </div>

                {/* Display Messages */}
                {errorMsg && (
                  <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-semibold" id="error_banner">
                    {errorMsg}
                  </p>
                )}

                {successMsg && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-semibold" id="success_banner">
                    {successMsg}
                  </p>
                )}

                {/* Large main Log In Button (Amber themed corresponding to Shegawan beauty) */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all shadow-md text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                    authLoading ? 'opacity-80 cursor-not-allowed' : 'active:scale-98'
                  }`}
                  id="btn_login_submit"
                >
                  {authLoading ? (
                    <span className="flex items-center gap-2 font-bold text-sm">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      Logging in...
                    </span>
                  ) : (
                    'Log In'
                  )}
                </button>

                {/* Subtle Forgot Password action */}
                <div className="text-center pt-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotTip(prev => !prev);
                      setErrorMsg('');
                    }}
                    className="text-xs text-amber-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                  {showForgotTip && (
                    <div className="mt-2 text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-left leading-relaxed">
                      💡 Sandbox accounts use password <span className="font-bold text-neutral-700">123456</span>. If you registered a production password, please try it or create an additional test account.
                    </div>
                  )}
                </div>

                {/* Facebook style divider line */}
                <hr className="border-t border-neutral-100 my-4" />

                {/* Facebook style CREATE NEW ACCOUNT secondary action */}
                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignupModal(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow hover:shadow-md cursor-pointer text-sm font-extrabold animate-pulse inline-block"
                    id="btn_register_new"
                  >
                    Create new account
                  </button>
                </div>

              </form>
            </div>

            {/* QUICK ONE-CLICK ACCESS DRAWER (Super comforting for rapid user evaluations!) */}
            <div className="bg-white px-5 py-4 rounded-xl border border-neutral-200/80 shadow-md">
              <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400 block mb-2.5 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Quick Access Accounts
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Login Admin', email: 'admin@shega.com', bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200/60 text-amber-800' },
                  { label: 'Login Chef', email: 'chef@shega.com', bg: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200/60 text-indigo-800' },
                  { label: 'Login Waiter', email: 'waiter@shega.com', bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/60 text-emerald-800' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickDemoClick(item.email)}
                    className={`px-2 py-2.5 rounded-lg border text-[10px] font-black cursor-pointer leading-tight text-center transition-all ${item.bg}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display database connection info context for transparency */}
            <p className="text-[10px] text-center text-neutral-400">
              {isSupabaseConfigured() 
                ? '🌐 Active production database session linked' 
                : '💾 Local memory storage sandbox active'}
            </p>

          </div>
        </div>

      </div>

      {/* --- ICONIC FACEBOOK-STYLE SIGNUP DIALOG OVERLAY (MODAL) --- */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="signup_modal">
          <div className="bg-white w-full max-w-[432px] rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Sign Up</h2>
                <p className="text-xs text-neutral-500 mt-0.5">It's quick and easy.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignupModal(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-black transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-4">
              
              {/* Full Display Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Almaz Kebede"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 bg-neutral-50/50 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Email Address Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-neutral-400 w-4 h-4" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. almaz@shega.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 bg-neutral-50/50 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 text-neutral-400 w-4 h-4" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 bg-neutral-50/50 font-medium font-mono"
                    required
                  />
                </div>
              </div>

              {/* ERP Settings division: Access Role & Target operating branch */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    System Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full py-2.5 px-3 border border-neutral-200 rounded-xl text-xs bg-white text-neutral-800 focus:border-amber-500 font-bold"
                  >
                    <option value="Chef">Chef (Kitchen Hub)</option>
                    <option value="Waiter">Waiter (Tables &amp; POS)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    ERP Branch
                  </label>
                  <select
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value as any)}
                    className="w-full py-2.5 px-3 border border-neutral-200 rounded-xl text-xs bg-white text-neutral-800 focus:border-amber-500 font-bold"
                  >
                    <option value="Shegawan">Shegawan Cafe</option>
                    <option value="Teyim Shega">Teyim Shega</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow active:scale-98 cursor-pointer text-sm"
                >
                  {authLoading ? 'Establishing identity context...' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignupModal(false)}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
