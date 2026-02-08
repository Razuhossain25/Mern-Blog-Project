import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { FiCheck, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const Comments = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";

    const API_BASE = useMemo(
        () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0",
        []
    );

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [query, setQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const [approvingId, setApprovingId] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    const pageSize = 10;

    const fetchComments = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            toast.error("Please login first");
            return;
        }

        setLoading(true);
        const tId = toast.loading("Loading comments...");

        const res = await axios.get(`${API_BASE}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true,
        });

        if (res.status >= 200 && res.status < 300) {
            setComments(Array.isArray(res.data) ? res.data : []);
            toast.update(tId, {
                render: "Comments loaded",
                type: "success",
                isLoading: false,
                autoClose: 1000,
            });
        } else {
            setComments([]);
            toast.update(tId, {
                render: res.data?.error || "Failed to load comments",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE]);

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => {
            const at = new Date(a?.createdAt || 0).getTime();
            const bt = new Date(b?.createdAt || 0).getTime();
            return bt - at;
        });
    }, [comments]);

    const filteredComments = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sortedComments;

        return sortedComments.filter((c) => {
            const postTitle = c?.postId?.title || "";
            const haystack = [postTitle, c?.name, c?.email, c?.message]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [sortedComments, query]);

    const pageCount = useMemo(() => {
        return Math.max(1, Math.ceil(filteredComments.length / pageSize));
    }, [filteredComments.length]);

    const safePageIndex = Math.min(pageIndex, pageCount - 1);

    const pagedComments = useMemo(() => {
        const start = safePageIndex * pageSize;
        return filteredComments.slice(start, start + pageSize);
    }, [filteredComments, safePageIndex]);

    useEffect(() => {
        if (safePageIndex !== pageIndex) setPageIndex(safePageIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safePageIndex]);

    const openDeleteModal = (comment) => {
        setDeleteCandidate(comment || null);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deletingId) return;
        setDeleteModalOpen(false);
        setDeleteCandidate(null);
    };

    const deleteComment = async (id) => {
        if (!id) return false;

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            return false;
        }

        setDeletingId(id);
        const tId = toast.loading("Deleting comment...");

        const res = await axios.delete(`${API_BASE}/comments/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true,
        });

        if (res.status >= 200 && res.status < 300) {
            setComments((prev) => prev.filter((c) => c?._id !== id));
            toast.update(tId, {
                render: "Comment deleted",
                type: "success",
                isLoading: false,
                autoClose: 1200,
            });
            setDeletingId(null);
            return true;
        }

        toast.update(tId, {
            render: res.data?.error || "Failed to delete comment",
            type: "error",
            isLoading: false,
            autoClose: 2500,
        });
        setDeletingId(null);
        return false;
    };

    const approveComment = async (id) => {
        if (!id) return;

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            return;
        }

        setApprovingId(id);
        const tId = toast.loading("Approving comment...");

        const res = await axios.put(
            `${API_BASE}/comments/${id}/approve`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true,
            }
        );

        if (res.status >= 200 && res.status < 300) {
            setComments((prev) => prev.map((c) => (c?._id === id ? { ...c, ...res.data } : c)));
            toast.update(tId, {
                render: "Comment approved",
                type: "success",
                isLoading: false,
                autoClose: 1200,
            });
        } else {
            toast.update(tId, {
                render: res.data?.error || "Failed to approve comment",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }

        setApprovingId(null);
    };

    const confirmDelete = async () => {
        const id = deleteCandidate?._id;
        if (!id) return;
        const ok = await deleteComment(id);
        if (ok) closeDeleteModal();
    };

    return (
        <div className="w-full">
            <Helmet>
                <title>{`Comments | ${siteTitle}`}</title>
            </Helmet>

            <div className="w-full max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <h2 className="text-4xl">Comments</h2>

                <div className="w-full md:w-[380px] relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPageIndex(0);
                        }}
                        type="text"
                        placeholder="Search post, name, email, comment..."
                        className="w-full rounded border border-stone-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-stone-300"
                    />
                </div>
            </div>

            {loading && <p className="text-stone-600">Loading...</p>}

            {!loading && filteredComments.length === 0 && (
                <div className="w-full max-w-6xl rounded border border-stone-200 bg-white p-5">
                    <p className="text-stone-700">
                        {comments.length === 0
                            ? "No comments found"
                            : "No comments match your search"}
                    </p>
                </div>
            )}

            {!loading && filteredComments.length > 0 && (
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-sm text-stone-600">
                        <div>
                            Showing {filteredComments.length === 0 ? 0 : safePageIndex * pageSize + 1}-
                            {Math.min((safePageIndex + 1) * pageSize, filteredComments.length)} of {filteredComments.length}
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
                                    <th className="p-3 text-sm font-semibold text-stone-700">Post</th>
                                    <th className="p-3 text-sm font-semibold text-stone-700">Name</th>
                                    <th className="p-3 text-sm font-semibold text-stone-700">Email</th>
                                    <th className="p-3 text-sm font-semibold text-stone-700">Comment</th>
                                    <th className="p-3 text-sm font-semibold text-stone-700">Status</th>
                                    <th className="p-3 text-sm font-semibold text-stone-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedComments.map((c) => {
                                    const date = c?.createdAt
                                        ? new Date(c.createdAt).toLocaleString()
                                        : "";
                                    const postTitle = c?.postId?.title || "(deleted post)";
                                    const isApproved = c?.approved !== false;

                                    return (
                                        <tr key={c?._id} className="border-b border-stone-100">
                                            <td className="p-3 text-sm text-stone-700 whitespace-nowrap">{date}</td>
                                            <td className="p-3 text-sm text-stone-900 whitespace-nowrap">{postTitle}</td>
                                            <td className="p-3 text-sm text-stone-900 whitespace-nowrap">{c?.name}</td>
                                            <td className="p-3 text-sm text-stone-700 whitespace-nowrap">{c?.email || "-"}</td>
                                            <td className="p-3 text-sm text-stone-700 min-w-[320px]">{c?.message}</td>
                                            <td className="p-3 text-sm whitespace-nowrap">
                                                <span className={isApproved ? "text-stone-800" : "text-stone-500"}>
                                                    {isApproved ? "Approved" : "Pending"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {!isApproved && (
                                                        <button
                                                            type="button"
                                                            onClick={() => approveComment(c?._id)}
                                                            disabled={!c?._id || approvingId === c?._id}
                                                            className="inline-flex items-center gap-2 rounded border border-stone-200 bg-white px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                                                            title="Approve comment"
                                                        >
                                                            <FiCheck />
                                                            Approve
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(c)}
                                                        disabled={!c?._id || deletingId === c?._id}
                                                        className="inline-flex items-center gap-2 rounded border border-stone-200 bg-white px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                        title="Delete comment"
                                                    >
                                                        <FiTrash2 />
                                                        Delete
                                                    </button>
                                                </div>
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
                    aria-labelledby="delete-comment-modal-title"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-md">
                        <h3
                            id="delete-comment-modal-title"
                            className="text-xl font-semibold text-stone-900"
                        >
                            Delete Comment
                        </h3>
                        <p className="mt-2 text-stone-700">
                            Are you sure you want to delete this comment?
                        </p>
                        {(deleteCandidate?.name || deleteCandidate?.postId?.title) && (
                            <p className="mt-2 text-sm text-stone-600">
                                From {deleteCandidate?.name || "Unknown"}
                                {deleteCandidate?.postId?.title
                                    ? ` on "${deleteCandidate.postId.title}"`
                                    : ""}
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

export default Comments;
