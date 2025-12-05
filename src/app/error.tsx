'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { FaBug } from 'react-icons/fa';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1014] text-white p-4">
            <div className="text-center space-y-6 max-w-lg">
                <div className="flex justify-center">
                    <FaBug className="text-6xl text-red-500 animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-red-500">
                    Something went wrong!
                </h1>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
                    <p className="font-mono text-sm text-red-300 break-all">
                        {error.message || "An unexpected error occurred."}
                    </p>
                    {error.digest && (
                        <p className="font-mono text-xs text-gray-500 mt-2">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>
                <div className="flex gap-4 justify-center pt-4">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}
