/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Loader2,
  Search,
  Globe,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
} from "lucide-react";

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
  competitors: {
    position: number;
    url: string;
    domain: string;
    title: string;
    snippet: string;
  }[];
}

export default function RankTracker() {
  const { api } = useApp();

  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newKeyword, setNewKeyword] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchKeywords = async () => {
    try {
      const res = await api.get("/api/rank/list");

      if (res.data.success) {
        setKeywords(res.data.keywords);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyword.trim() || !newUrl.trim()) return;

    setAdding(true);

    try {
      const res = await api.post("/api/rank/add", {
        keyword: newKeyword,
        url: newUrl,
      });

      if (res.data.success) {
        setKeywords((prev) => [res.data.tracking, ...prev]);

        setNewKeyword("");
        setNewUrl("");
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRefresh = async (id: string) => {
    setRefreshing(id);

    try {
      await api.post(`/api/rank/${id}/refresh`);

      const check = await api.get(`/api/rank/${id}`);

      setKeywords((prev) =>
        prev.map((k) =>
          k._id === id ? check.data.tracking : k
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Delete this keyword?"
    );

    if (!confirmDelete) return;

    setDeleting(id);

    try {
      await api.delete(`/api/rank/${id}`);

      setKeywords((prev) =>
        prev.filter((k) => k._id !== id)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.put(`/api/rank/${id}/toggle`);

      if (res.data.success) {
        setKeywords((prev) =>
          prev.map((k) =>
            k._id === id ? res.data.tracking : k
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPositionBadge = (pos: number | null) => {
    if (pos === null) {
      return {
        text: "—",
        class:
          "text-muted-foreground bg-muted/50",
      };
    }

    if (pos <= 3) {
      return {
        text: `#${pos}`,
        class:
          "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30",
      };
    }

    if (pos <= 10) {
      return {
        text: `#${pos}`,
        class:
          "text-primary bg-primary/15 border border-primary/30",
      };
    }

    return {
      text: `#${pos}`,
      class:
        "text-accent bg-accent/15 border border-accent/30",
    };
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return {
        icon: <TrendingUp size={14} />,
        text: `+${change}`,
        class: "text-emerald-500",
      };
    }

    if (change < 0) {
      return {
        icon: <TrendingDown size={14} />,
        text: `${change}`,
        class: "text-red-500",
      };
    }

    return {
      icon: <Minus size={14} />,
      text: "0",
      class: "text-muted-foreground",
    };
  };

  let processedData = [...keywords];

  if (searchQuery) {
    processedData = processedData.filter(
      (k) =>
        k.keyword
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        k.domain
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  if (statusFilter === "active") {
    processedData = processedData.filter(
      (k) => k.active
    );
  }

  if (statusFilter === "paused") {
    processedData = processedData.filter(
      (k) => !k.active
    );
  }

  processedData.sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    }

    if (sortBy === "rank_asc") {
      return (
        (a.currentPosition ?? 999) -
        (b.currentPosition ?? 999)
      );
    }

    return 0;
  });

  return (
    <div className="min-h-screen pt-16 md:pt-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">
              <span className="gradient-text">
                Rank Tracker
              </span>
            </h1>

            <p className="text-sm text-muted-foreground">
              Track your keyword rankings on Google
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition"
          >
            <Plus size={18} />
            Track Keyword
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="glass flex-1 px-4 py-3 rounded-xl flex items-center gap-2">
            <Search size={18} />

            <input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search keywords..."
              className="bg-transparent outline-none flex-1"
            />
          </div>

          <div className="glass px-4 py-3 rounded-xl flex items-center gap-2">
            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="bg-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="glass px-4 py-3 rounded-xl flex items-center gap-2">
            <ArrowUpDown size={16} />

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="bg-transparent outline-none"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="rank_asc">
                Highest Ranked
              </option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : processedData.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">
              No keywords found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedData.map((kw) => {
              const pos = getPositionBadge(
                kw.currentPosition
              );

              const change = getChangeIndicator(
                kw.positionChange
              );

              return (
                <div
                  key={kw._id}
                  className="glass p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center font-semibold ${pos.class}`}
                    >
                      {pos.text}
                    </div>

                    <div>
                      <Link
                        to={`/rank/${kw._id}`}
                        className="font-semibold hover:text-primary transition"
                      >
                        "{kw.keyword}"
                      </Link>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Globe size={12} />
                        {kw.domain}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock size={10} />

                        Last checked:
                        {kw.lastChecked
                          ? new Date(
                              kw.lastChecked
                            ).toLocaleString()
                          : " Never"}
                      </div>

                      <div
                        className={`flex items-center gap-1 mt-2 text-sm ${change.class}`}
                      >
                        {change.icon}
                        {change.text}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      disabled={refreshing === kw._id}
                      onClick={() =>
                        handleRefresh(kw._id)
                      }
                      className="p-2 rounded-lg hover:bg-muted transition"
                    >
                      <RefreshCw
                        size={18}
                        className={
                          refreshing === kw._id
                            ? "animate-spin"
                            : ""
                        }
                      />
                    </button>

                    <button
                      onClick={() =>
                        handleToggle(kw._id)
                      }
                      className="p-2 rounded-lg hover:bg-muted transition"
                    >
                      {kw.active ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>

                    <button
                      disabled={deleting === kw._id}
                      onClick={() =>
                        handleDelete(kw._id)
                      }
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition"
                    >
                      {deleting === kw._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <form
              onSubmit={handleAdd}
              className="bg-background w-full max-w-md rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">
                Track New Keyword
              </h2>

              <input
                type="text"
                placeholder="Keyword"
                value={newKeyword}
                onChange={(e) =>
                  setNewKeyword(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 bg-transparent"
              />

              <input
                type="url"
                placeholder="Target URL"
                value={newUrl}
                onChange={(e) =>
                  setNewUrl(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 bg-transparent"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="bg-primary text-white px-4 py-2 rounded-xl"
                >
                  {adding ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Add Keyword"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}