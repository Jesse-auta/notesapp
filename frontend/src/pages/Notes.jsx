import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import NoteCard from "../components/NoteCard";

const Notes = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [creating, setCreating] = useState(false);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await api.post("/notes/", formData);
            setFormData({ title: "", content: "" });
            setShowForm(false);
            fetchNotes();
        } catch (err) {
            setError("Failed to create note");
        } finally {
            setCreating(false);
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

    return (
        <div className="notes-container">
            <header className="notes-header">
                <div>
                    <h1>My Notes</h1>
                    <p className="notes-subtitle">Welcome back, {user?.name}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "+ New Note"}
                    </button>
                    <button className="btn-logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            {showForm && (
                <form className="note-form" onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Note title"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your note here..."
                            rows={5}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={creating}>
                        {creating ? "Creating..." : "Create Note"}
                    </button>
                </form>
            )}

            {loading ? (
                <p className="loading-text">Loading notes...</p>
            ) : notes.length === 0 ? (
                <div className="empty-state">
                    <p>No notes yet. Create your first one!</p>
                </div>
            ) : (
                <div className="notes-grid">
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
        </div>
    );
};

export default Notes;