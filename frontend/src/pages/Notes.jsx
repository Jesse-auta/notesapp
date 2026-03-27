import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";
import AIChatPanel from "../components/AIChatPanel";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

const Notes = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [showChat, setShowChat] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSemanticSearch, setIsSemanticSearch] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await api.get("/notes/");
            setNotes(res.data);
        } catch (err) {
            setError("Failed to load notes");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        setCreating(true);
        setAiLoading(false);
        try {
            const res = await api.post("/notes/", formData);
            const newNoteId = res.data.note_id;

            setAiLoading(true);
            try {
                await api.post(`/notes/${newNoteId}/summarize`);
            } catch (_) {}
            setAiLoading(false);

            setShowForm(false);
            fetchNotes();
        } catch (err) {
            setError("Failed to create note");
        } finally {
            setCreating(false);
            setAiLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this note?")) return;
        try {
            await api.delete(`/notes/${id}`);
            setNotes(notes.filter((n) => n.id !== id));
        } catch (err) {
            setError("Failed to delete note");
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (!value.trim()) {
            setSearchResults([]);
            setIsSemanticSearch(false);
            setIsSearching(false);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            setIsSemanticSearch(true);
            try {
                const res = await api.get(`/notes/search?q=${encodeURIComponent(value)}`);
                setSearchResults(res.data.results);
            } catch (err) {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 600);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setIsSemanticSearch(false);
        setSearchResults([]);
        setIsSearching(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display transition-colors duration-300">
            <Navbar onChatOpen={() => setShowChat(true)} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                            {getGreeting()}, {user?.name?.split(" ")[0]}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            You have {notes.length} note{notes.length !== 1 ? "s" : ""} synced across your devices.
                        </p>
                    </div>
                </div>

                {/* Search bar */}
                <div className="mb-10">
                    <div className="relative max-w-3xl group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            {isSearching ? (
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined">search</span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Ask anything about your notes..."
                            className="block w-full pl-12 pr-16 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 text-lg transition-all outline-none"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            )}
                            {!searchQuery && (
                                <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    ⌘ K
                                </kbd>
                            )}
                        </div>
                    </div>
                    {isSemanticSearch && !isSearching && (
                        <p className="mt-2 ml-1 text-xs text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            AI-powered semantic search
                        </p>
                    )}
                </div>

                {/* Tabs — hide during search */}
                {!isSemanticSearch && (
                    <div className="mb-6">
                        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
                            {[
                                { key: "all", label: "All Notes", icon: "description" },
                                { key: "recent", label: "Recent", icon: "history" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                                        activeTab === tab.key
                                            ? "border-primary text-primary"
                                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                            </div>
                        ))}
                    </div>

                ) : isSearching ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            AI is searching your notes...
                        </p>
                    </div>

                ) : isSemanticSearch && searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="size-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-slate-400 mb-6">
                            <span className="material-symbols-outlined" style={{ fontSize: "3rem" }}>search_off</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No notes found for "{searchQuery}"
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                            Try rephrasing your question or using broader terms.
                        </p>
                    </div>

                ) : isSemanticSearch && searchResults.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                                Results for <span className="text-primary italic">"{searchQuery}"</span>
                                <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                                    ({searchResults.length} found)
                                </span>
                            </h3>
                            <button
                                onClick={clearSearch}
                                className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Clear
                            </button>
                        </div>
                        {searchResults.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => navigate(`/notes/${note.id}`)}
                                className="group flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-slate-900 dark:text-white text-lg font-semibold">
                                            {note.title || "Untitled"}
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 line-clamp-2">
                                            {note.content}
                                        </p>
                                        {note.reason && (
                                            <div className="mt-2 py-1.5 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg inline-flex items-center gap-2 border border-slate-100 dark:border-slate-700 w-fit">
                                                <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs italic">
                                                    Matched because: <span className="font-bold text-slate-800 dark:text-slate-200">{note.reason}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center self-center">
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="relative w-48 h-48 mb-8">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                            <div className="relative flex items-center justify-center h-full">
                                <span className="material-symbols-outlined text-primary/30" style={{ fontSize: "6rem" }}>
                                    lightbulb
                                </span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Your mind is a blank canvas
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                            Capture ideas, meeting notes, or book summaries. Let AI help you organize everything.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">edit_note</span>
                            Create your first note
                        </button>
                    </div>

                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onDelete={handleDelete}
                                onClick={() => navigate(`/notes/${note.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showForm && (
                <NoteForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    loading={creating}
                    aiLoading={aiLoading}
                />
            )}

            {showChat && <AIChatPanel onClose={() => setShowChat(false)} notes={notes} />}

            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="fixed bottom-8 right-8 size-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
                    title="New Note"
                >
                    <span className="material-symbols-outlined text-2xl">add</span>
                </button>
            )}
        </div>
    );
};

export default Notes;