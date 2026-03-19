import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NoteForm from "../components/NoteForm";

const NoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchNote();
    }, [id]);

    const fetchNote = async () => {
        try {
            const res = await api.get(`/notes/${id}`);
            setNote(res.data);
        } catch (err) {
            setError("Failed to load note");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        setSaving(true);
        try {
            await api.put(`/notes/${id}`, formData);
            setNote({ ...note, ...formData });
            setEditing(false);
            showSuccess("Note updated successfully");
        } catch (err) {
            setError("Failed to update note");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this note?")) return;
        try {
            await api.delete(`/notes/${id}`);
            navigate("/notes");
        } catch (err) {
            setError("Failed to delete note");
        }
    };

    const handleSummarize = async () => {
        setSummarizing(true);
        setError("");
        try {
            const res = await api.post(`/notes/${id}/summarize`);
            setNote({ ...note, summary: res.data.summary, tags: res.data.tags });
            showSuccess("Note summarized successfully");
        } catch (err) {
            setError("Failed to summarize note");
        } finally {
            setSummarizing(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const tags = note?.tags
        ? note.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    const wordCount = note?.content
        ? note.content.trim().split(/\s+/).length
        : 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !note) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display transition-colors duration-300">
            <Navbar onChatOpen={() => setShowChat(true)} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

                {/* Toasts */}
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm">
                        {successMessage}
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {/* Breadcrumb + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <button
                                onClick={() => navigate("/notes")}
                                className="hover:text-primary transition-colors"
                            >
                                My Notes
                            </button>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <span className="text-slate-900 dark:text-white">
                                {note?.title || "Untitled"}
                            </span>
                        </nav>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 rounded-lg h-9 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 rounded-lg h-9 px-3 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Title + meta */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-extrabold leading-tight tracking-tight">
                            {note?.title || "Untitled"}
                        </h1>
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                <span>Created {formatDate(note?.created_at)}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">text_fields</span>
                                <span>{wordCount} words</span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {tags.map((tag, i) => (
                                <div
                                    key={i}
                                    className="flex h-7 items-center gap-x-1.5 rounded-full bg-primary/10 px-3 border border-primary/20"
                                >
                                    <div className="size-1.5 rounded-full bg-primary" />
                                    <p className="text-primary text-xs font-bold uppercase tracking-wider">{tag}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* AI Summary box */}
                    <div className="p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">AI Summary</h3>
                                </div>
                                <button
                                    onClick={handleSummarize}
                                    disabled={summarizing}
                                    className="flex items-center gap-2 rounded-xl h-9 px-4 bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-md"
                                >
                                    <span className="material-symbols-outlined text-base">refresh</span>
                                    {summarizing ? "Summarizing..." : "Re-summarize"}
                                </button>
                            </div>
                            <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 border border-white/50 dark:border-slate-700/50">
                                {note?.summary ? (
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        {note.summary}
                                    </p>
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-500 text-base italic">
                                        No summary yet. Click Re-summarize to generate one.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Note content */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px]">
                        <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                            {note?.content || "No content."}
                        </p>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-lg">share</span>
                                Share
                            </button>
                            <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Export
                            </button>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 text-xs">{wordCount} words</div>
                    </div>
                </div>
            </main>

            {/* Edit modal */}
            {editing && (
                <NoteForm
                    initialData={note}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditing(false)}
                    loading={saving}
                />
            )}
        </div>
    );
};

export default NoteDetail;