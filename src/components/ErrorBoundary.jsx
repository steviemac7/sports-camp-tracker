import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center font-sans">
                    <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-6 shadow-xl border border-red-500/50">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
                        <p className="text-slate-300 mb-4">
                            The application encountered a critical error and could not render.
                        </p>
                        <div className="bg-black/50 p-4 rounded-md overflow-auto max-h-60 mb-6">
                            <code className="text-red-400 font-mono text-sm">
                                {this.state.error && this.state.error.toString()}
                            </code>
                            {this.state.errorInfo && (
                                <pre className="text-slate-500 text-xs mt-2">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors w-full"
                        >
                            Clear Data & Reload (Emergency Reset)
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
