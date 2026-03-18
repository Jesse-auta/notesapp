import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const NoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [saving, setSaving] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchNote();
    }, [id]);

    const fetchNote = async () => {
        try {
            const res = await api.get(`/notes/${id}`);
            setNote(res.data);
            setFormData({ title: res.data.title, content: res.data.content });
        } catch (err) {
            setError("Failed to load note");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
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

    if (loading) return <div className="loading-text">Loading note...</div>;
    if (error && !note) return <div className="error-banner">{error}</div>;

    return (
        <div className="note-detail-container">
            <button className="btn-back" onClick={() => navigate("/notes")}>
                ← Back to Notes
            </button>

            {error && <div className="error-banner">{error}</div>}
            {successMessage && <div className="success-banner">{successMessage}</div>}

            {editing ? (
                <form onSubmit={handleUpdate} className="note-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={8}
                            required
                        />
                    </div>
                    <div className="detail-actions">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="note-detail">
                    <div className="note-detail-header">
                        <h1>{note.title || "Untitled"}</h1>
                        <div className="detail-actions">
                            <button
                                className="btn-primary"
                                onClick={() => setEditing(true)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn-summarize"
                                onClick={handleSummarize}
                                disabled={summarizing}
                            >
                                {summarizing ? "Summarizing..." : "✨ Summarize"}
                            </button>
                        </div>
                    </div>

                    <p className="note-content">{note.content}</p>

                    {note.tags && (
                        <div className="note-tags">
                            {note.tags.split(",").map((tag, i) => (
                                <span key={i} className="tag">{tag.trim()}</span>
                            ))}
                        </div>
                    )}

                    {note.summary && (
                        <div className="summary-box">
                            <h3>📝 AI Summary</h3>
                            <p>{note.summary}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoteDetail;