import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const Messages = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";

    const API_BASE = useMemo(
        () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0",
        []
    );

    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const pageSize = 10;

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                toast.error("Please login first");
                return;
            }

            setLoading(true);
            const tId = toast.loading("Loading messages...");
            const res = await axios.get(`${API_BASE}/contact-messages`, {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true,
            });

            if (res.status >= 200 && res.status < 300) {
                setMessages(Array.isArray(res.data) ? res.data : []);
                toast.update(tId, {
                    render: "Messages loaded",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                });
            } else {
                setMessages([]);
                toast.update(tId, {
                    render: res.data?.error || "Failed to load messages",
                    type: "error",
                    isLoading: false,
                    autoClose: 2500,
                });
            }
            setLoading(false);
        })();
    }, [API_BASE]);

    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => {
            const at = new Date(a?.createdAt || 0).getTime();
            const bt = new Date(b?.createdAt || 0).getTime();
            return bt - at;
        });
    }, [messages]);

    const filteredMessages = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sortedMessages;

        return sortedMessages.filter((m) => {
            const haystack = [m?.name, m?.email, m?.message]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [sortedMessages, query]);

    const pageCount = useMemo(() => {
        return Math.max(1, Math.ceil(filteredMessages.length / pageSize));
    }, [filteredMessages.length]);

    const safePageIndex = Math.min(pageIndex, pageCount - 1);

    const pagedMessages = useMemo(() => {
        const start = safePageIndex * pageSize;
        return filteredMessages.slice(start, start + pageSize);
    }, [filteredMessages, safePageIndex]);

    useEffect(() => {
        if (safePageIndex !== pageIndex) setPageIndex(safePageIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safePageIndex]);

    const deleteMessage = async (id) => {
        if (!id) return;

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            return;
        }

        setDeletingId(id);
        const tId = toast.loading("Deleting message...");

        const res = await axios.delete(`${API_BASE}/contact-messages/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true,
            }
        );

        if (res.status >= 200 && res.status < 300) {
            setMessages((prev) => prev.filter((m) => m?._id !== id));
            toast.update(tId, {
                render: "Message deleted",
                type: "success",
                isLoading: false,
                autoClose: 1200,
            });
            setDeletingId(null);
            return true;
        } else {
            toast.update(tId, {
                render: res.data?.error || "Failed to delete message",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }
        setDeletingId(null);
        return false;
    };

    const openDeleteModal = (message) => {
        setDeleteCandidate(message || null);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deletingId) return;
        setDeleteModalOpen(false);
        setDeleteCandidate(null);
    };

    const confirmDelete = async () => {
        const id = deleteCandidate?._id;
        if (!id) return;
        const ok = await deleteMessage(id);
        if (ok) closeDeleteModal();
    };

    return (
        <div className="w-full">
            <Helmet>
                <title>{`Messages | ${siteTitle}`}</title>
            </Helmet>

            <div className="w-full max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <h2 className="text-4xl">Contact Messages</h2>

                <div className="w-full md:w-[380px] relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPageIndex(0);
                        }}
                        type="text"
                        placeholder="Search name, email, message..."
                        className="w-full rounded border border-stone-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-stone-300"
                    />
                </div>
            </div>

            {loading && <p className="text-stone-600">Loading...</p>}

            {!loading && filteredMessages.length === 0 && (
                <div className="w-full max-w-6xl rounded border border-stone-200 bg-white p-5">
                    <p className="text-stone-700">
                        {messages.length === 0
                            ? "No messages found"
                            : "No messages match your search"}
                    </p>
                </div>
            )}

            {!loading && filteredMessages.length > 0 && (
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-sm text-stone-600">
                        <div>
                            Showing {filteredMessages.length === 0 ? 0 : safePageIndex * pageSize + 1}-
                            {Math.min((safePageIndex + 1) * pageSize, filteredMessages.length)} of {filteredMessages.length}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-3 py-1 rounded border border-stone-200 bg-white disabled:opacity-50"
                                disabled={safePageIndex === 0}
                                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                            >
                                Prev
                            </button>
                            <div className="min-w-[120px] text-center">
                                Page {safePageIndex + 1} / {pageCount}
                            </div>
                            <button
                                type="button"
                                className="px-3 py-1 rounded border border-stone-200 bg-white disabled:opacity-50"
                                disabled={safePageIndex >= pageCount - 1}
                                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-auto rounded border border-stone-200 bg-white">
                    <table className="min-w-full text-left">
                        <thead className="border-b border-stone-200 bg-stone-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-stone-700">Date</th>
                                <th className="p-3 text-sm font-semibold text-stone-700">Name</th>
                                <th className="p-3 text-sm font-semibold text-stone-700">Email</th>
                                <th className="p-3 text-sm font-semibold text-stone-700">Message</th>
                                <th className="p-3 text-sm font-semibold text-stone-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedMessages.map((m) => {
                                const date = m?.createdAt
                                    ? new Date(m.createdAt).toLocaleString()
                                    : "";
                                return (
                                    <tr key={m?._id || `${m?.email}-${m?.createdAt}`} className="border-b border-stone-100">
                                        <td className="p-3 text-sm text-stone-700 whitespace-nowrap">{date}</td>
                                        <td className="p-3 text-sm text-stone-900 whitespace-nowrap">{m?.name}</td>
                                        <td className="p-3 text-sm text-stone-700 whitespace-nowrap">{m?.email}</td>
                                        <td className="p-3 text-sm text-stone-700 min-w-[320px]">{m?.message}</td>
                                        <td className="p-3 text-sm whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(m)}
                                                disabled={!m?._id || deletingId === m?._id}
                                                className="inline-flex items-center gap-2 rounded border border-stone-200 bg-white px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                title="Delete message"
                                            >
                                                <FiTrash2 />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                </div>
            )}

            {deleteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-message-modal-title"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-md">
                        <h3
                            id="delete-message-modal-title"
                            className="text-xl font-semibold text-stone-900"
                        >
                            Delete Message
                        </h3>
                        <p className="mt-2 text-stone-700">
                            Are you sure you want to delete this message?
                        </p>
                        {(deleteCandidate?.name || deleteCandidate?.email) && (
                            <p className="mt-2 text-sm text-stone-600">
                                From {deleteCandidate?.name || "Unknown"}
                                {deleteCandidate?.email ? ` (${deleteCandidate.email})` : ""}
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={!!deletingId}
                                className="rounded border border-stone-400 px-4 py-2 disabled:opacity-50"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiX />
                                    <span>Cancel</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={!deleteCandidate?._id || deletingId === deleteCandidate?._id}
                                className="rounded bg-stone-800 px-4 py-2 text-white disabled:opacity-50"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiTrash2 />
                                    <span>Delete</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
