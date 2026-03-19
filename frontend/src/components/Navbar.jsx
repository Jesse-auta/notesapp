import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onChatOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("theme") === "dark"
    );
    const menuRef = useRef(null);

    // Apply dark mode class to html element
    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate("/notes")}
                    >
                        <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
                            NoteMind
                        </h2>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">

                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center justify-center size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                            title="Toggle dark mode"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {darkMode ? "light_mode" : "dark_mode"}
                            </span>
                        </button>

                        {/* AI Chat button */}
                        {onChatOpen && (
                            <button
                                onClick={onChatOpen}
                                className="flex items-center justify-center size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                                title="AI Chat"
                            >
                                <span className="material-symbols-outlined text-xl">psychology</span>
                            </button>
                        )}

                        {/* Hamburger menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="size-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                {/* Hamburger lines */}
                                <div className="flex flex-col gap-[4px]">
                                    <span className={`block w-4 h-0.5 bg-slate-600 dark:bg-slate-300 rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
                                    <span className={`block w-4 h-0.5 bg-slate-600 dark:bg-slate-300 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                                    <span className={`block w-4 h-0.5 bg-slate-600 dark:bg-slate-300 rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
                                </div>
                            </button>

                            {/* Dropdown */}
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">

                                    {/* User info */}
                                    <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">
                                                    {user?.name}
                                                </p>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="p-2">
                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                                            <span className="material-symbols-outlined text-lg">person</span>
                                            Profile
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            Settings
                                        </button>

                                        {/* Dark mode toggle inside menu too */}
                                        <button
                                            onClick={() => setDarkMode(!darkMode)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-lg">
                                                    {darkMode ? "light_mode" : "dark_mode"}
                                                </span>
                                                {darkMode ? "Light Mode" : "Dark Mode"}
                                            </div>
                                            {/* Toggle pill */}
                                            <div className={`w-9 h-5 rounded-full transition-colors duration-300 flex items-center px-0.5 ${darkMode ? "bg-primary" : "bg-slate-200"}`}>
                                                <div className={`size-4 rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? "translate-x-4" : "translate-x-0"}`} />
                                            </div>
                                        </button>

                                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                                        >
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;