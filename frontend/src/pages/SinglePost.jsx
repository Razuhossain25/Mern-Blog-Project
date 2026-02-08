import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { useSiteSettings } from "../context/SiteSettingsContext";

const SinglePost = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
    const { id } = useParams();

    const API_BASE = useMemo(
        () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0",
        []
    );

    const BACKEND_URL = useMemo(
        () => import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
        []
    );

    const resolveImageUrl = (value) => {
        if (!value) return "";
        if (typeof value !== "string") return "";
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
        return `${BACKEND_URL}/uploads/${value}`;
    };

    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [error, setError] = useState("");

    const [commentsLoading, setCommentsLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentName, setCommentName] = useState("");
    const [commentEmail, setCommentEmail] = useState("");
    const [commentMessage, setCommentMessage] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            setError("");

            const res = await axios.get(`${API_BASE}/posts/${id}`, {
                validateStatus: () => true,
            });

            if (res.status >= 200 && res.status < 300) {
                setPost(res.data);
            } else {
                setPost(null);
                setError(res.data?.error || "Post not found");
            }

            setLoading(false);
        })();
    }, [API_BASE, id]);

    const fetchComments = async () => {
        if (!id) return;
        setCommentsLoading(true);

        const res = await axios.get(`${API_BASE}/posts/${id}/comments`, {
            validateStatus: () => true,
        });

        if (res.status >= 200 && res.status < 300) {
            setComments(Array.isArray(res.data) ? res.data : []);
        } else {
            setComments([]);
        }

        setCommentsLoading(false);
    };

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE, id]);

    const submitComment = async (e) => {
        e.preventDefault();
        if (!id) return;

        if (!commentName.trim() || !commentMessage.trim()) {
            toast.error("Name and comment are required");
            return;
        }

        setCommentSubmitting(true);
        const tId = toast.loading("Posting comment...");

        const res = await axios.post(
            `${API_BASE}/posts/${id}/comments`,
            {
                name: commentName,
                email: commentEmail,
                message: commentMessage,
            },
            { validateStatus: () => true }
        );

        if (res.status >= 200 && res.status < 300) {
            toast.update(tId, {
                render: "Comment submitted for approval",
                type: "success",
                isLoading: false,
                autoClose: 1200,
            });
            setCommentMessage("");
            await fetchComments();
        } else {
            toast.update(tId, {
                render: res.data?.error || "Failed to post comment",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }

        setCommentSubmitting(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-5 md:px-0 py-10">
                <Helmet>
                    <title>{`Loading... | ${siteTitle}`}</title>
                </Helmet>
                <p className="text-stone-600">Loading...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-5 md:px-0 py-10">
                <Helmet>
                    <title>{`Post Not Found | ${siteTitle}`}</title>
                </Helmet>
                <p className="text-stone-700">{error || "Post not found"}</p>
                <Link to="/" className="text-blue-600 underline mt-3 inline-block">
                    Back to home
                </Link>
            </div>
        );
    }

    const title = post?.title || "Untitled";
    const imageSrc = resolveImageUrl(post?.featuredImage);
    const author = post?.author || "";
    const createdAt = post?.createdAt ? new Date(post.createdAt).toLocaleString() : "";

    return (
        <div className="container mx-auto px-5 md:px-0 py-10">
            <Helmet>
                <title>{`${title} | ${siteTitle}`}</title>
            </Helmet>
            <Link to="/" className="text-blue-600 underline">
                ← Back
            </Link>

            <h1 className="mt-4 text-3xl md:text-5xl font-bold text-stone-900">{title}</h1>
            <p className="mt-2 text-stone-600">
                {author && <span>By {author}</span>}
                {author && createdAt && <span> · </span>}
                {createdAt && <span>{createdAt}</span>}
            </p>

            <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
                {imageSrc && (
                    <div className="w-full md:w-5/12">
                        <img
                            src={imageSrc}
                            alt={title}
                            className="w-full h-64 md:h-80 object-cover rounded border border-stone-200"
                            loading="lazy"
                        />
                    </div>
                )}

                <div className={imageSrc ? "w-full md:w-7/12" : "w-full"}>
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: post?.content || "" }}
                    />
                </div>
            </div>

            <div className="mt-10 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold text-stone-900">Comments</h2>

                <div className="mt-4">
                    {commentsLoading && <p className="text-stone-600">Loading comments...</p>}

                    {!commentsLoading && comments.length === 0 && (
                        <p className="text-stone-700">No comments yet. Be the first to comment.</p>
                    )}

                    {!commentsLoading && comments.length > 0 && (
                        <div className="space-y-3">
                            {comments.map((c) => {
                                const date = c?.createdAt
                                    ? new Date(c.createdAt).toLocaleString()
                                    : "";
                                return (
                                    <div key={c?._id || `${c?.name}-${c?.createdAt}`} className="rounded border border-stone-200 bg-white p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="text-sm font-semibold text-stone-900">
                                                {c?.name || "Anonymous"}
                                            </div>
                                            <div className="text-xs text-stone-500">{date}</div>
                                        </div>
                                        <p className="mt-2 text-sm text-stone-700 whitespace-pre-wrap wrap-break-word">
                                            {c?.message}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <form onSubmit={submitComment} className="mt-6 rounded border border-stone-200 bg-white p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-stone-700 mb-1">Name *</label>
                            <input
                                value={commentName}
                                onChange={(e) => setCommentName(e.target.value)}
                                type="text"
                                placeholder="Your name"
                                className="w-full rounded border border-stone-200 px-3 py-2 outline-none focus:border-stone-300"
                                disabled={commentSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-stone-700 mb-1">Email (optional)</label>
                            <input
                                value={commentEmail}
                                onChange={(e) => setCommentEmail(e.target.value)}
                                type="email"
                                placeholder="you@example.com"
                                className="w-full rounded border border-stone-200 px-3 py-2 outline-none focus:border-stone-300"
                                disabled={commentSubmitting}
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="block text-sm text-stone-700 mb-1">Comment *</label>
                        <textarea
                            value={commentMessage}
                            onChange={(e) => setCommentMessage(e.target.value)}
                            rows={4}
                            placeholder="Write your comment..."
                            className="w-full rounded border border-stone-200 px-3 py-2 outline-none focus:border-stone-300"
                            disabled={commentSubmitting}
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={commentSubmitting}
                            className="rounded bg-stone-800 px-4 py-2 text-white disabled:opacity-50"
                        >
                            {commentSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SinglePost;
