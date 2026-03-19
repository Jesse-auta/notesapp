import { useState, useEffect } from "react";

const NoteForm = ({ onSubmit, onCancel, initialData = null, loading, aiLoading }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        content: initialData?.content || "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ title: initialData.title || "", content: initialData.content || "" });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const wordCount = formData.content.trim()
        ? formData.content.trim().split(/\s+/).length
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 border border-primary/5 dark:border-slate-800 overflow-hidden transition-colors duration-300">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-base">edit_note</span>
                        <span>{initialData ? "Editing Note" : "New Note"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            {loading ? "Saving..." : "Save Note"}
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className="px-6 pt-6">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter note title..."
                        className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                    />
                </div>

                {/* Content */}
                <div className="px-6 pb-4">
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Start typing your thoughts here..."
                        rows={10}
                        className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none"
                    />
                </div>

                {/* AI Processing indicator */}
                {aiLoading && (
                    <div className="px-6 py-3 bg-primary/5 dark:bg-primary/10 border-t border-primary/10 dark:border-primary/20 flex items-center gap-3">
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-75" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-150" />
                        </div>
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            AI is summarizing & tagging...
                        </span>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-400 dark:text-slate-600">
                    <div className="flex gap-6">
                        <button className="flex items-center gap-2 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">history</span>
                            Version History
                        </button>
                        <button className="flex items-center gap-2 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">share</span>
                            Share
                        </button>
                    </div>
                    <div className="text-xs font-mono">
                        {wordCount} words
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteForm;