import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Blog = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
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

    const stripHtml = (html) => {
        if (!html) return "";
        return String(html)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [query, setQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(0);

    const pageSize = 8;

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/posts`, { validateStatus: () => true });
            if (res.status >= 200 && res.status < 300) {
                setPosts(Array.isArray(res.data) ? res.data : []);
            } else {
                setPosts([]);
            }
            setLoading(false);
        })();
    }, [API_BASE]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const items = Array.isArray(posts) ? posts.slice() : [];
        items.sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        if (!q) return items;
        return items.filter((p) => {
            const haystack = [p?.title, p?.author, stripHtml(p?.content)]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [posts, query]);

    const pageCount = useMemo(() => {
        return Math.max(1, Math.ceil(filtered.length / pageSize));
    }, [filtered.length]);

    const safePageIndex = Math.min(pageIndex, pageCount - 1);

    const currentPage = useMemo(() => {
        const start = safePageIndex * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, safePageIndex]);

    return (
        <div className="container mx-auto px-5 md:px-0 py-10">
            <Helmet>
                <title>{`Blog | ${siteTitle}`}</title>
            </Helmet>
            <h1 className="text-3xl md:text-5xl font-bold text-center">Blog</h1>

            <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setPageIndex(0);
                    }}
                    placeholder="Search posts..."
                    className="w-full md:w-[420px] rounded border border-stone-400 p-2"
                />
                <p className="text-sm text-stone-600">
                    {loading ? "" : `${filtered.length} post(s)`}
                </p>
            </div>

            {loading && <p className="mt-8 text-center text-stone-600">Loading...</p>}

            {!loading && filtered.length === 0 && (
                <p className="mt-8 text-center text-stone-600">No posts found</p>
            )}

            {!loading && filtered.length > 0 && (
                <>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentPage.map((post) => {
                            const id = post?._id || post?.id;
                            const title = post?.title || "Untitled";
                            const author = post?.author || "";
                            const createdAt = post?.createdAt
                                ? new Date(post.createdAt).toLocaleDateString()
                                : "";
                            const imageSrc = resolveImageUrl(post?.featuredImage);
                            const contentText = stripHtml(post?.content);
                            const excerpt = contentText.slice(0, 120);

                            return (
                                <div
                                    key={id || title}
                                    className="border border-stone-200 rounded-lg overflow-hidden bg-white"
                                >
                                    <div className="w-full h-44 bg-stone-100">
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={title}
                                                className="w-full h-44 object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-44 grid place-items-center text-stone-500">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-stone-900 line-clamp-2">
                                            {title}
                                        </h3>
                                        <p className="mt-1 text-sm text-stone-600">
                                            {author && <span>By {author}</span>}
                                            {author && createdAt && <span> · </span>}
                                            {createdAt && <span>{createdAt}</span>}
                                        </p>

                                        {excerpt && (
                                            <p className="mt-3 text-sm text-stone-700">
                                                {excerpt}{contentText.length > 120 ? "..." : ""}
                                            </p>
                                        )}

                                        {id && (
                                            <div className="mt-4">
                                                <Link
                                                    to={`/post/${id}`}
                                                    className="inline-block rounded border border-stone-400 px-3 py-1.5 text-sm hover:bg-stone-50"
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <span>Read more</span>
                                                        <FaArrowRight />
                                                    </span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3">
                        <p className="text-sm text-stone-600">
                            Page {safePageIndex + 1} of {pageCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                                disabled={safePageIndex === 0}
                                className="rounded border border-stone-400 px-3 py-2 disabled:opacity-50"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaChevronLeft />
                                    <span>Prev</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                                }
                                disabled={safePageIndex >= pageCount - 1}
                                className="rounded border border-stone-400 px-3 py-2 disabled:opacity-50"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <span>Next</span>
                                    <FaChevronRight />
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Blog;
