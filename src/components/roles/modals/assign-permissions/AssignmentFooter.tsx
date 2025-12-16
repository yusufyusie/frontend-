'use client';

interface AssignmentFooterProps {
    hasChanges: boolean;
    onReset: () => void;
    onPreview: () => void;
    submitting: boolean;
}

export function AssignmentFooter({ hasChanges, onReset, onPreview, submitting }: AssignmentFooterProps) {
    if (!hasChanges) return null;

    return (
        <div className="flex gap-3 justify-end">
            <button
                type="button"
                onClick={onReset}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={submitting}
            >
                Reset Changes
            </button>
            <button
                type="button"
                onClick={onPreview}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Preview & Save Changes
                </div>
            </button>
        </div>
    );
}
