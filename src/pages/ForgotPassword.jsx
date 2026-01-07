
import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Link } from 'react-router-dom';
import { Tent } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('Check your inbox for further instructions');
        } catch (e) {
            setError('Failed to reset password. ' + e.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="glass-panel p-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-900/20">
                        <Tent size={32} />
                    </div>
                    <h1 className="text-3xl font-bold heading-gradient">Reset Password</h1>
                    <p className="text-slate-400 mt-2">Enter your email to restore access</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-3 rounded-lg mb-4 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="input-field w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-lg"
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
