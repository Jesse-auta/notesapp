const NoteCard = ({ note, onDelete, onClick }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const tags = note.tags ? note.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

    return (
        <div
            onClick={onClick}
            className="group flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            {/* Top row — tags + date */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? tags.map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded"
                        >
                            {tag}
                        </span>
                    )) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded">
                            No tags
                        </span>
                    )}
                </div>
                <span className="text-xs text-slate-400 shrink-0 ml-2">{formatDate(note.created_at)}</span>
            </div>

            {/* Title */}
            <h3 className="text-slate-900 text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {note.title || "Untitled"}
            </h3>

            {/* Content preview */}
            <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {note.content || "No content yet."}
            </p>

            {/* AI Summary */}
            <div className="mt-auto border-t border-slate-50 pt-4">
                {note.summary ? (
                    <p className="text-slate-500 text-xs italic flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-0.5">smart_toy</span>
                        {note.summary}
                    </p>
                ) : (
                    <p className="text-slate-400 text-xs flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                        No summary yet
                    </p>
                )}
            </div>

            {/* Delete button */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="mt-3 self-end text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete
            </button>
        </div>
    );
};

export default NoteCard;