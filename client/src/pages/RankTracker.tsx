/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, RefreshCw, Eye, EyeOff, Trash2, TrendingUp, TrendingDown, Minus, X, Globe, Loader2, Target, AlertCircle, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

interface KeywordItem {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    active: boolean;
    lastChecked: string | null;
    status: string;
    createdAt: string;
    competitors: { position: number; url: string; domain: string; title: string; snippet: string }[];
}

export default function RankTracker() {
    const { api } = useApp();
    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyword, setNewKeyword] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");

    const fetchKeywords = async () => {
        try {
            const res = await api.get("/api/rank/list");
            if (res.data.success) {
                setKeywords(res.data.keywords);
            }
        } catch (err) {
            console.error("Failed to fetch keywords:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim() || !newUrl.trim()) return;

        setAdding(true);
        setAddError("");

        try {
            const res = await api.post("/api/rank/add", {
                keyword: newKeyword.trim(),
                url: newUrl.trim(),
            });
            if (res.data.success) {
                setKeywords((prev) => [res.data.tracking, ...prev]);
                setNewKeyword("");
                setNewUrl("");
                setShowAddModal(false);

                const id = res.data.tracking._id;
                const pollInterval = setInterval(async () => {
                    try {
                        const check = await api.get(`/api/rank/${id}`);
                        if (check.data.tracking.status !== "checking") {
                            clearInterval(pollInterval);
                            setKeywords((prev) => prev.map((k) => (k._id === id ? check.data.tracking : k)));
                        }
                    } catch (error: any) {
                        console.error(error);
                    }
                }, 3000);
            }
        } catch (err: any) {
            setAddError(err.response?.data?.message || "Failed to add keyword");
        }
        setAdding(false);
    };

    const handleRefresh = async (id: string) => {
        setRefreshing(id);
        try {
            await api.post(`/api/rank/${id}/refresh`);
            setKeywords((prev) => prev.map((k) => (k._id === id ? { ...k, status: "checking" } : k)));

            const pollInterval = setInterval(async () => {
                try {
                    const check = await api.get(`/api/rank/${id}`);
                    if (check.data.tracking.status !== "checking") {
                        clearInterval(pollInterval);
                        setKeywords((prev) => prev.map((k) => (k._id === id ? check.data.tracking : k)));
                        setRefreshing(null);
                    }
                } catch (error) {
                    console.error(error);
                    setRefreshing(null);
                }
            }, 3000);
        } catch (err) {
            console.error("Refresh failed:", err);
            setRefreshing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this keyword tracking?")) return;
        setDeleting(id);
        try {
            await api.delete(`/api/rank/${id}`);
            setKeywords((prev) => prev.filter((k) => k._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeleting(null);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const res = await api.put(`/api/rank/${id}/toggle`);
            if (res.data.success) {
                setKeywords((prev) => prev.map((k) => (k._id === id ? res.data.tracking : k)));
            }
        } catch (err) {
            console.error("Toggle failed:", err);
        }
    };

    const getChangeIndicator = (change: number) => {
        if (change > 0) return { icon: <TrendingUp size={14} />, text: `+${change}`, class: "text-emerald-500" };
        if (change < 0) return { icon: <TrendingDown size={14} />, text: `${change}`, class: "text-danger" };
        return { icon: <Minus size={14} />, text: "0", class: "text-muted-foreground" };
    };

    const getPositionColor = (pos: number | null) => {
        if (pos === null) return "text-muted-foreground";
        if (pos <= 3) return "text-emerald-500";
        if (pos <= 10) return "text-primary";
        if (pos <= 20) return "text-accent";
        return "text-danger";
    };

    const getPositionBgClass = (pos: number | null) => {
        if (pos === null) return "bg-muted/50 text-muted-foreground border border-border";
        if (pos <= 3) return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
        if (pos <= 10) return "bg-primary/15 text-primary border border-primary/30";
        if (pos <= 20) return "bg-accent/15 text-accent border border-accent/30";
        return "bg-danger/15 text-danger border border-danger/30";
    };

    const getStatusClass = (status: string) => {
        if (status === "completed") return "bg-emerald-500/10 text-emerald-500";
        if (status === "checking") return "bg-yellow-500/10 text-yellow-500";
        if (status === "failed") return "bg-red-500/10 text-red-500";
        return "bg-muted text-muted-foreground";
    };

    const processedData = keywords
        .filter((k) => {
            const matchesSearch =
                k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
                k.domain.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || k.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortOrder === "position") return (a.currentPosition ?? 999) - (b.currentPosition ?? 999);
            return 0;
        });

    useEffect(() => {
        fetchKeywords();
    }, []);

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                            Rank <span className="gradient-text">Tracker</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Track your keyword rankings on Google — updated daily.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0"
                        style={{ color: "var(--background)" }}
                    >
                        <Plus size={18} />
                        Track Keyword
                    </button>
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
                        <Search size={16} className="text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search keywords or domains..."
                            className="bg-transparent text-sm text-foreground outline-none flex-1 placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="glass rounded-xl px-4 py-2.5 text-sm text-foreground outline-none bg-transparent border-0 cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="checking">Checking</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="glass rounded-xl px-4 py-2.5 text-sm text-foreground outline-none bg-transparent border-0 cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="position">Best Position</option>
                    </select>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Target size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No keywords tracked yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">Add your first keyword to start tracking.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ color: "var(--background)" }}
                        >
                            Track Your First Keyword
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {processedData.map((kw) => {
                            const change = getChangeIndicator(kw.positionChange);
                            const isChecking = kw.status === "checking" || refreshing === kw._id;

                            return (
                                <div
                                    key={kw._id}
                                    className={`glass rounded-xl p-4 sm:p-5 transition-all ${!kw.active ? "opacity-50" : ""}`}
                                >
                                    <div className="flex items-center gap-4">

                                        {/* Position Badge */}
                                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${getPositionBgClass(kw.currentPosition)}`}>
                                            {isChecking ? (
                                                <Loader2 size={20} className="animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <span className="text-xs font-medium opacity-70">
                                                        {kw.currentPosition ? "#" : "—"}
                                                    </span>
                                                    <span className="text-lg font-bold leading-none">
                                                        {kw.currentPosition ?? "N/R"}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Keyword Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/rank/${kw._id}`}
                                                className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors truncate block"
                                            >
                                                "{kw.keyword}"
                                            </Link>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Globe size={12} className="text-muted-foreground shrink-0" />
                                                <span className="text-xs text-muted-foreground truncate">{kw.domain}</span>
                                                {kw.currentPage && (
                                                    <span className="text-xs text-muted-foreground">· Page {kw.currentPage}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusClass(kw.status)}`}>
                                                    {kw.status}
                                                </span>
                                                <span className="text-xs text-muted-foreground">—</span>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${change.class}`}>
                                                    {change.icon}
                                                    {change.text}
                                                </div>
                                                {kw.lastChecked && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock size={11} />
                                                        Last checked: {new Date(kw.lastChecked).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Best + Competitors */}
                                        <div className="hidden sm:flex items-center gap-5 shrink-0">
                                            <div className="text-center">
                                                <p className={`text-lg font-bold ${getPositionColor(kw.bestPosition)}`}>
                                                    {kw.bestPosition ?? "—"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Best</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-accent">{kw.competitors.length}</p>
                                                <p className="text-xs text-muted-foreground">Competitors</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleRefresh(kw._id)}
                                                disabled={refreshing === kw._id || kw.status === "checking"}
                                                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all disabled:opacity-40"
                                                title="Refresh"
                                            >
                                                <RefreshCw size={15} className={refreshing === kw._id ? "animate-spin" : ""} />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(kw._id)}
                                                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                                                title={kw.active ? "Pause tracking" : "Resume tracking"}
                                            >
                                                {kw.active ? <Eye size={15} /> : <EyeOff size={15} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(kw._id)}
                                                disabled={deleting === kw._id}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all disabled:opacity-40"
                                                title="Delete"
                                            >
                                                {deleting === kw._id
                                                    ? <Loader2 size={15} className="animate-spin" />
                                                    : <Trash2 size={15} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-foreground">Track New Keyword</h2>
                            <button
                                onClick={() => { setShowAddModal(false); setAddError(""); }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {addError && (
                            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />
                                {addError}
                            </div>
                        )}

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Keyword</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder='e.g., "best seo tools"'
                                        required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Website URL</label>
                                <div className="relative">
                                    <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="e.g., example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full py-3 rounded-xl bg-primary font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                style={{ color: "var(--background)" }}
                            >
                                {adding
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : <><Target size={18} />Start Tracking</>
                                }
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}