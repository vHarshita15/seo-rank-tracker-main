import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Search, BarChart3, History, Menu, X, Target, Sun, Moon, ChartNoAxesColumnIcon } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: "/dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
        { path: "/analyze", label: "Analyze", icon: <Search size={18} /> },
        { path: "/rank-tracker", label: "Rank Tracker", icon: <Target size={18} /> },
        { path: "/history", label: "History", icon: <History size={18} /> },
    ];

    return (
        <nav className="fixed top-0 w-full bg-background/70 backdrop-blur-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <ChartNoAxesColumnIcon />
                        <span className="text-xl tracking-tight text-foreground">Rank Pilot</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link key={link.path} to={link.path} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${isActive(link.path) ? "bg-accent/5 text-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}>
                                {link.icon}
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center" aria-label="Toggle theme">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="text-muted-foreground hover:text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-b border-border bg-background origin-top">
                    <div className="px-4 py-3 space-y-1">
                        <div className="py-2 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.path) ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}