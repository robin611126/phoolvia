import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Chrome } from 'lucide-react';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError, requireEmailVerification } = await register(email, password, name);

            if (authError) throw new Error(authError);

            if (requireEmailVerification) {
                setError('Please check your email to verify your account.');
                setLoading(false);
                return;
            }

            // Immediately navigate after valid registration & session
            navigate('/profile');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            const { error } = await insforge.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            setError('Google login is not fully configured yet in Insforge dashboard.');
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500">Join PHOOLVIAA to track orders and save wishlist</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    className="w-full mb-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Chrome size={20} className="text-blue-500" />
                    Sign up with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400">or sign up with email</span>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/30 focus:border-blush-400 transition-colors"
                                placeholder="John Doe"
                            />
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/30 focus:border-blush-400 transition-colors"
                                placeholder="you@example.com"
                            />
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/30 focus:border-blush-400 transition-colors"
                                placeholder="Min. 6 characters"
                            />
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3.5 bg-blush-500 text-white rounded-xl font-medium hover:bg-blush-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blush-200"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Create Account</>}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="font-semibold text-charcoal hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
