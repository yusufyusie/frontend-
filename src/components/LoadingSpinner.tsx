export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} border-4 border-teal-200 border-t-blue-600 rounded-full animate-spin`} />
        </div>
    );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
}
