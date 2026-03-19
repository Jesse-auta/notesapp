import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AIChatPanel = ({ onClose, notes }) => {
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            role: "ai",
            text: "Hello! I can help you find information across your notes. What would you like to know?",
            relatedNotes: [],
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const suggestions = ["Summarize my notes", "What did I write recently?", "Find my work notes"];

    const handleSend = async (text) => {
        const query = text || input.trim();
        if (!query) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: query }]);
        setLoading(true);

        try {
            const matched = notes.filter((note) => {
                const q = query.toLowerCase();
                return (
                    note.title?.toLowerCase().includes(q) ||
                    note.content?.toLowerCase().includes(q) ||
                    note.tags?.toLowerCase().includes(q) ||
                    note.summary?.toLowerCase().includes(q)
                );
            }).slice(0, 3);

            const context = matched.length > 0
                ? matched.map((n) => `Title: ${n.title}\nSummary: ${n.summary || ""}\nContent: ${n.content?.slice(0, 300)}`).join("\n\n")
                : notes.slice(0, 5).map((n) => `Title: ${n.title}\nSummary: ${n.summary || ""}`).join("\n\n");

            const res = await api.post("/notes/chat", {
                question: query,
                context,
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    text: res.data.answer,
                    relatedNotes: matched,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    text: "Sorry, I couldn't process that. Please try again.",
                    relatedNotes: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-white dark:bg-background-dark shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors duration-300">

            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl">psychology</span>
                    </div>
                    <div>
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">NoteMind AI</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 bg-emerald-500 rounded-full" />
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMessages([{
                            role: "ai",
                            text: "Hello! I can help you find information across your notes. What would you like to know?",
                            relatedNotes: [],
                        }])}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                        title="Clear chat"
                    >
                        <span className="material-symbols-outlined">history</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i}>
                        {msg.role === "ai" ? (
                            <div className="flex items-start gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                </div>
                                <div className="flex flex-col gap-2 max-w-[85%]">
                                    <p className="text-slate-900 dark:text-slate-200 text-sm font-medium ml-1">NoteMind AI</p>
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
                                        <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed">{msg.text}</p>
                                    </div>
                                    {/* Related notes */}
                                    {msg.relatedNotes?.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-1">
                                            {msg.relatedNotes.map((note) => (
                                                <div
                                                    key={note.id}
                                                    onClick={() => { onClose(); navigate(`/notes/${note.id}`); }}
                                                    className="group cursor-pointer flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 hover:border-primary dark:hover:border-primary transition-all shadow-sm"
                                                >
                                                    <div className="bg-primary/5 dark:bg-primary/10 rounded-lg size-10 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-primary text-base">description</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold truncate">{note.title}</p>
                                                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{note.summary || "No summary"}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 flex-row-reverse">
                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">person</span>
                                </div>
                                <div className="flex flex-col gap-1 items-end max-w-[85%]">
                                    <p className="text-slate-900 dark:text-slate-200 text-sm font-medium mr-1">You</p>
                                    <div className="bg-primary rounded-2xl rounded-tr-none px-4 py-3">
                                        <p className="text-white text-[15px] leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <footer className="p-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-3">
                    {/* Suggestion chips */}
                    <div className="flex gap-2 flex-wrap">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask anything about your notes..."
                            rows={1}
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1.5 size-9 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 disabled:opacity-50 transition-transform"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold">
                        Powered by NoteMind AI
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AIChatPanel;