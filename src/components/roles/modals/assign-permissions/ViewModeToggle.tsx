'use client';

interface ViewModeToggleProps {
    viewMode: 'matrix' | 'list';
    onViewModeChange: (mode: 'matrix' | 'list') => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => onViewModeChange('matrix')}
                className={`px-4 py-2 rounded-md transition-all font-medium ${viewMode === 'matrix'
                        ? 'bg-white shadow-sm text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Matrix View
                </div>
            </button>
            <button
                onClick={() => onViewModeChange('list')}
                className={`px-4 py-2 rounded-md transition-all font-medium ${viewMode === 'list'
                        ? 'bg-white shadow-sm text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List View
                </div>
            </button>
        </div>
    );
}
