import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";
import AiChatPanel from "../components/AiChatPanel";

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

    const filteredNotes = notes.filter((note) => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return (
            note.title?.toLowerCase().includes(q) ||
            note.content?.toLowerCase().includes(q) ||
            note.tags?.toLowerCase().includes(q) ||
            note.summary?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="bg-background-light min-h-screen font-display">
            <Navbar onChatOpen={() => setShowChat(true)} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                            {getGreeting()}, {user?.name?.split(" ")[0]}
                        </h1>
                        <p className="text-slate-500">
                            You have {notes.length} note{notes.length !== 1 ? "s" : ""} synced across your devices.
                        </p>
                    </div>
                    
                </div>

                {/* Search bar */}
                <div className="mb-10">
                    <div className="relative max-w-3xl group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="block w-full pl-12 pr-16 py-4 bg-white border-none rounded-2xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 text-lg transition-all outline-none"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                            <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-500">
                                ⌘ K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex border-b border-slate-200 space-x-8">
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
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Notes grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
                                <div className="h-3 bg-slate-200 rounded w-1/3 mb-4" />
                                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                                <div className="h-3 bg-slate-200 rounded w-5/6" />
                            </div>
                        ))}
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="relative w-48 h-48 mb-8">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                            <div className="relative flex items-center justify-center h-full">
                                <span className="material-symbols-outlined text-primary/30" style={{ fontSize: "6rem" }}>
                                    lightbulb
                                </span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {searchQuery ? `No notes found for "${searchQuery}"` : "Your mind is a blank canvas"}
                        </h2>
                        <p className="text-slate-500 max-w-sm mb-8">
                            {searchQuery
                                ? "Try rephrasing or using broader terms."
                                : "Capture ideas, meeting notes, or book summaries. Let AI help you organize everything."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                                Create your first note
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => (
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

            {/* Note create modal */}
            {showForm && (
                <NoteForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    loading={creating}
                    aiLoading={aiLoading}
                />
            )}

            {/* AI Chat Panel */}
            {showChat && <AiChatPanel onClose={() => setShowChat(false)} notes={notes} />}
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