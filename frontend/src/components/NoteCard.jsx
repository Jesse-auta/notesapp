const NoteCard = ({ note, onDelete, onClick }) => {
    return (
        <div className="note-card" onClick={onClick}>
            <div className="note-card-header">
                <h3>{note.title || "Untitled"}</h3>
                <button
                    className="btn-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                    }}
                >
                    Delete
                </button>
            </div>

            <p className="note-preview">
                {note.content?.slice(0, 100)}{note.content?.length > 100 ? "..." : ""}
            </p>

            {note.tags && (
                <div className="note-tags">
                    {note.tags.split(",").map((tag, i) => (
                        <span key={i} className="tag">{tag.trim()}</span>
                    ))}
                </div>
            )}

            {note.summary && (
                <p className="note-summary">📝 {note.summary}</p>
            )}

            <p className="note-date">
                {new Date(note.created_at).toLocaleDateString()}
            </p>
        </div>
    );
};

export default NoteCard;