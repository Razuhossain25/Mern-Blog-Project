import React, { useMemo, useState } from "react";
import {
    FaChevronLeft,
    FaChevronRight,
    FaEdit,
    FaTimes,
    FaTrashAlt,
} from "react-icons/fa";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const resolveImageUrl = (value) => {
    if (!value) return "";
    if (typeof value !== "string") return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
    return `${BACKEND_URL}/uploads/${value}`;
};

const Post = ({ posts = [], onEdit, onDelete }) => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    const openDeleteModal = (post) => {
        setPostToDelete(post || null);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setPostToDelete(null);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            onDelete?.(postToDelete);
        }
        closeDeleteModal();
    };

    const data = useMemo(() => {
        const items = Array.isArray(posts) ? posts.slice() : [];
        items.sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
        return items;
    }, [posts]);

    const columns = useMemo(
        () => [
            columnHelper.display({
                id: "sn",
                header: "SN",
                cell: (info) => info.row.index + 1,
                enableGlobalFilter: false,
            }),
            columnHelper.accessor("featuredImage", {
                header: "Image",
                enableGlobalFilter: false,
                cell: (info) => {
                    const src = resolveImageUrl(info.getValue());
                    if (!src) return "-";
                    return (
                        <img
                            src={src}
                            alt="Featured"
                            className="h-12 w-12 object-cover"
                            loading="lazy"
                        />
                    );
                },
            }),
            columnHelper.accessor("title", {
                header: "Title",
            }),
            columnHelper.accessor("author", {
                header: "Author",
            }),
            columnHelper.accessor("createdAt", {
                header: "Created At",
                cell: (info) => new Date(info.getValue()).toLocaleString(),
            }),
            columnHelper.accessor("updatedAt", {
                header: "Updated At",
                cell: (info) => new Date(info.getValue()).toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                header: "Action",
                enableGlobalFilter: false,
                cell: (info) => {
                    const post = info.row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onEdit?.(post)}
                                className="rounded border border-stone-400 px-3 py-1.5"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaEdit />
                                    <span>Edit</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    openDeleteModal(post);
                                }}
                                className="rounded border border-stone-400 px-3 py-1.5"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaTrashAlt />
                                    <span>Delete</span>
                                </span>
                            </button>
                        </div>
                    );
                },
            }),
        ],
        [onEdit, onDelete]
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: "includesString",
    });

    return (
        <div className="w-full">
            <div className="mb-3 flex items-center justify-between gap-3">
                <input
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                    className="w-96 rounded border border-stone-400 p-2"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>

                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="rounded border border-stone-400 p-2"
                    >
                        {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded border border-stone-400 px-3 py-2 disabled:opacity-50"
                    >
                        <span className="inline-flex items-center gap-2">
                            <FaChevronLeft />
                            <span>Prev</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded border border-stone-400 px-3 py-2 disabled:opacity-50"
                    >
                        <span className="inline-flex items-center gap-2">
                            <span>Next</span>
                            <FaChevronRight />
                        </span>
                    </button>
                </div>
            </div>

            <table className="w-full border-collapse border border-stone-400">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="bg-gray-100">
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="border border-stone-400 p-2 text-left"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={table.getAllLeafColumns().length}
                                className="border border-stone-400 p-3 text-center"
                            >
                                No posts found
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="border border-stone-400 p-2"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {deleteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-modal-title"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-md">
                        <h3 id="delete-modal-title" className="text-xl font-semibold text-stone-900">
                            Delete Post
                        </h3>
                        <p className="mt-2 text-stone-700">
                            Are you sure you want to delete this post?
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="rounded border border-stone-400 px-4 py-2"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaTimes />
                                    <span>Cancel</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded bg-stone-800 px-4 py-2 text-white"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaTrashAlt />
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

export default Post;