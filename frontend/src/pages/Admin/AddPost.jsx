import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { FaPlus, FaSave } from "react-icons/fa";

import "react-quill/dist/quill.snow.css";

const AddPost = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const BACKEND_URL = useMemo(
        () => import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
        []
    );

    const API_BASE = useMemo(
        () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0",
        []
    );

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm();

    const [existingFeaturedImage, setExistingFeaturedImage] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const resolveImageUrl = (value) => {
        if (!value) return "";
        if (typeof value !== "string") return "";
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
        return `${BACKEND_URL}/uploads/${value}`;
    };

    const watchedFiles = watch("featuredImage");

    useEffect(() => {
        const file = watchedFiles?.[0];
        if (!file) {
            setPreviewUrl("");
            return;
        }

        const nextUrl = URL.createObjectURL(file);
        setPreviewUrl(nextUrl);
        return () => URL.revokeObjectURL(nextUrl);
    }, [watchedFiles]);

    useEffect(() => {
        if (!isEdit) {
            setValue("author", "Raju");
            return;
        }

        (async () => {
            const loadingToastId = toast.loading("Loading post...");
            const res = await axios.get(`${API_BASE}/posts/${id}`, {
                validateStatus: () => true,
            });

            if (res.status >= 200 && res.status < 300) {
                reset({
                    title: res.data?.title || "",
                    content: res.data?.content || "",
                    author: res.data?.author || "Raju",
                });
                setExistingFeaturedImage(res.data?.featuredImage || "");
                toast.update(loadingToastId, {
                    render: "Post loaded",
                    type: "success",
                    isLoading: false,
                    autoClose: 1200,
                });
            } else {
                toast.update(loadingToastId, {
                    render: "Failed to load post",
                    type: "error",
                    isLoading: false,
                    autoClose: 2500,
                });
            }
        })();
    }, [API_BASE, id, isEdit, reset, setValue]);

    const onSubmit = async (data) => {
        const submitToastId = toast.loading(isEdit ? "Updating post..." : "Adding post...");
        const hasNewImage = !!(data?.featuredImage && data.featuredImage.length > 0);

        const submitCreate = async () => {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("content", data.content);
            formData.append("author", data.author);
            formData.append("featuredImage", data.featuredImage[0]);
            return axios.post(`${API_BASE}/add-post`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                validateStatus: () => true,
            });
        };

        const submitUpdate = async () => {
            if (hasNewImage) {
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("content", data.content);
                formData.append("author", data.author);
                formData.append("featuredImage", data.featuredImage[0]);
                return axios.put(`${API_BASE}/posts/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    validateStatus: () => true,
                });
            }

            return axios.put(
                `${API_BASE}/posts/${id}`,
                {
                    title: data.title,
                    content: data.content,
                    author: data.author,
                },
                {
                    validateStatus: () => true,
                }
            );
        };

        const res = isEdit ? await submitUpdate() : await submitCreate();

        if (!isEdit && res.status === 201) {
            toast.update(submitToastId, {
                render: "Post added successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });
            reset();
            return;
        }

        if (isEdit && res.status >= 200 && res.status < 300) {
            toast.update(submitToastId, {
                render: "Post updated successfully",
                type: "success",
                isLoading: false,
                autoClose: 1200,
            });
            navigate("/admin/all-post");
            return;
        }

        console.log(res);
        toast.update(submitToastId, {
            render: isEdit ? "Failed to update post" : "Failed to add post",
            type: "error",
            isLoading: false,
            autoClose: 2500,
        });
    };
    return (
        <div className="w-full">
            <Helmet>
                <title>{`${isEdit ? "Edit Post" : "Add Post"} | ${siteTitle}`}</title>
            </Helmet>
            <h2 className="text-4xl mb-6">{isEdit ? "Edit Post" : "Add New Post"}</h2>

            <form
            encType="multipart/form-data"
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-5xl *:mb-4 *:flex *:flex-col *:items-start *:*:first:text-xl"
            >
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        {...register("title", { required: true })}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2"
                    />
                    {errors.title && (
                        <p className="text-red-500 mt-0 text-sm">This field is required</p>
                    )}
                </div>

                <div>
                    <label htmlFor="content">Content</label>
                    <div className="w-full max-w-2xl">
                        <Controller
                            name="content"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field }) => (
                                <ReactQuill
                                    theme="snow"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    {errors.content && (
                        <p className="text-red-500 mt-2 text-sm">
                            {errors.content.message}
                        </p>
                    )}
                </div>

                <input type="hidden" {...register("author")} defaultValue="Raju" />

                <div className="w-full">
                    <label className="mb-2">Featured Image</label>

                    {/* Pretty upload box */}
                    <label
                        htmlFor="featuredImage"
                        className={[
                            "w-full max-w-2xl cursor-pointer rounded-xl border-2 border-dashed p-5 transition",
                            "bg-white hover:bg-stone-50",
                            "border-stone-300 hover:border-stone-400",
                            "focus-within:ring-2 focus-within:ring-stone-400 focus-within:ring-offset-2",
                            errors.featuredImage ? "border-red-400 bg-red-50/30" : ""
                        ].join(" ")}
                    >
                        <div className="flex items-center gap-4">
                            <div className="grid place-items-center h-12 w-12 rounded-lg bg-stone-100 border border-stone-200">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-6 w-6 text-stone-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12 16V8m0 0 3 3m-3-3-3 3"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M7 16.5c-2.5 0-4.5-2-4.5-4.5S4.5 7.5 7 7.5c.2-2.3 2.1-4 4.5-4 2 0 3.8 1.2 4.3 3.1.2-.1.5-.1.7-.1 2.2 0 4 1.8 4 4s-1.8 4-4 4"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <div className="flex-1">
                                <p className="text-base font-medium text-stone-800">
                                    Click to upload an image
                                </p>
                                <p className="text-sm text-stone-500">
                                    JPG, PNG, GIF (recommended 1200×630)
                                </p>
                            </div>

                            <span className="text-sm px-3 py-1.5 rounded-lg bg-stone-800 text-white">
                                Browse
                            </span>
                        </div>

                        <input
                            type="file"
                            id="featuredImage"
                            className="sr-only"
                            {...register("featuredImage", {
                                validate: {
                                    acceptedFormats: (files) => {
                                        const acceptedTypes = [
                                            "image/jpeg",
                                            "image/png",
                                            "image/gif",
                                            "image/jpg"
                                        ];
                                        return (
                                            files.length === 0 ||
                                            acceptedTypes.includes(files[0]?.type) ||
                                            "Only JPG, PNG, and GIF files are accepted"
                                        );
                                    }
                                },
                                ...(isEdit
                                    ? {}
                                    : { required: "Featured Image is required" }),
                            })}
                        />
                    </label>

                    {(previewUrl || existingFeaturedImage) && (
                        <div className="mt-3">
                            <p className="text-sm text-stone-600 mb-2">
                                {previewUrl ? "New image preview" : "Current image"}
                            </p>
                            <img
                                src={previewUrl || resolveImageUrl(existingFeaturedImage)}
                                alt="Featured preview"
                                className="w-full max-w-2xl h-56 object-cover rounded border border-stone-300"
                            />
                        </div>
                    )}

                    {errors.featuredImage && (
                        <p className="text-red-500 mt-2 text-sm">
                            {errors.featuredImage.message}
                        </p>
                    )}
                </div>

                <div>
                    <button type="submit" className="bg-stone-800 text-white w-36 py-2 rounded-md cursor-pointer hover:shadow-md  hover:font-semibold">
                        <span className="inline-flex items-center justify-center gap-2 w-full">
                            {isEdit ? <FaSave /> : <FaPlus />}
                            <span>{isEdit ? "Update Post" : "Add Post"}</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPost;