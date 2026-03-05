import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Store } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/admin/dashboard', { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            navigate('/admin/dashboard', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blush-50 via-white to-blush-50 flex flex-col items-center justify-center p-4 font-body">
            {/* Logo */}
            <div className="text-center mb-8 animate-fade-in">
                <div className="w-20 h-20 bg-blush-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Store className="text-blush-500" size={36} />
                </div>
                <h1 className="text-2xl font-bold tracking-wider text-gray-900">PHOOLVIAA</h1>
                <p className="text-sm text-gray-500 uppercase tracking-[0.3em] mt-1">Admin Portal</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 text-center">Welcome Back</h2>
                <p className="text-sm text-gray-500 text-center mt-1 mb-6">Log in to manage your platform.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@phoolviaa.com"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50 focus:border-blush-400 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <button type="button" className="text-xs text-blush-500 hover:text-blush-600 font-medium">
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50 focus:border-blush-400 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blush-500 to-blush-400 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blush-600 hover:to-blush-500 transition-all disabled:opacity-50 shadow-lg shadow-blush-400/25"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-6 text-gray-400 text-sm">
                <ShieldCheck size={16} />
                <span>Secure Admin Environment</span>
            </div>
        </div>
    );
}
