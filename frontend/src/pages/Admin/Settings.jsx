import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { Helmet } from "react-helmet-async";
import { FaSave } from "react-icons/fa";

const Settings = () => {
    const { settings, setSettings: setGlobalSettings } = useSiteSettings();
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

    const [loading, setLoading] = useState(true);

    const [websiteTitle, setWebsiteTitle] = useState("");
    const [themeColor, setThemeColor] = useState("#2563eb");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [existingLogo, setExistingLogo] = useState("");
    const [existingFavicon, setExistingFavicon] = useState("");

    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);

    const logoPreview = useMemo(() => {
        if (!logoFile) return "";
        return URL.createObjectURL(logoFile);
    }, [logoFile]);

    const faviconPreview = useMemo(() => {
        if (!faviconFile) return "";
        return URL.createObjectURL(faviconFile);
    }, [faviconFile]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const tId = toast.loading("Loading settings...");
            const res = await axios.get(`${API_BASE}/settings`, { validateStatus: () => true });

            if (res.status >= 200 && res.status < 300) {
                const s = res.data || {};
                setWebsiteTitle(s.websiteTitle || "");
                setThemeColor(s.themeColor || "#2563eb");
                setMobile(s.contact?.mobile || "");
                setEmail(s.contact?.email || "");
                setAddress(s.contact?.address || "");
                setExistingLogo(s.logo || "");
                setExistingFavicon(s.favicon || "");
                setGlobalSettings(s);

                toast.update(tId, {
                    render: "Settings loaded",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                });
            } else {
                toast.update(tId, {
                    render: "Failed to load settings",
                    type: "error",
                    isLoading: false,
                    autoClose: 2500,
                });
            }

            setLoading(false);
        })();
    }, [API_BASE, setGlobalSettings]);

    useEffect(() => {
        if (!logoPreview) return;
        return () => URL.revokeObjectURL(logoPreview);
    }, [logoPreview]);

    useEffect(() => {
        if (!faviconPreview) return;
        return () => URL.revokeObjectURL(faviconPreview);
    }, [faviconPreview]);

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            return;
        }

        const isMultipart = !!logoFile || !!faviconFile;
        const tId = toast.loading("Saving settings...");

        let res;
        if (isMultipart) {
            const formData = new FormData();
            formData.append("websiteTitle", websiteTitle);
            formData.append("themeColor", themeColor);
            formData.append("mobile", mobile);
            formData.append("email", email);
            formData.append("address", address);
            if (logoFile) formData.append("logo", logoFile);
            if (faviconFile) formData.append("favicon", faviconFile);

            res = await axios.put(`${API_BASE}/settings`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                validateStatus: () => true,
            });
        } else {
            res = await axios.put(
                `${API_BASE}/settings`,
                { websiteTitle, themeColor, mobile, email, address },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    validateStatus: () => true,
                }
            );
        }

        if (res.status >= 200 && res.status < 300) {
            const s = res.data || {};
            setExistingLogo(s.logo || existingLogo);
            setExistingFavicon(s.favicon || existingFavicon);
            setLogoFile(null);
            setFaviconFile(null);
            setGlobalSettings(s);

            toast.update(tId, {
                render: "Settings saved",
                type: "success",
                isLoading: false,
                autoClose: 1500,
            });
        } else {
            toast.update(tId, {
                render: res.data?.error || "Failed to save settings",
                type: "error",
                isLoading: false,
                autoClose: 2500,
            });
        }
    };

    return (
        <div className="w-full">
            <Helmet>
                <title>{`Settings | ${siteTitle}`}</title>
            </Helmet>
            <h2 className="text-4xl mb-6">Settings</h2>

            <form onSubmit={handleSave} className="w-full max-w-5xl *:mb-4">
                <div className="flex flex-col">
                    <label className="text-xl mb-1">Website Title</label>
                    <input
                        value={websiteTitle}
                        onChange={(e) => setWebsiteTitle(e.target.value)}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2"
                        placeholder="Website title"
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-xl mb-1">Main Theme Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="h-10 w-14 border border-stone-400 rounded"
                            disabled={loading}
                        />
                        <input
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="border border-stone-400 rounded w-full max-w-xs p-2"
                            placeholder="#2563eb"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-xl mb-1">Logo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2"
                        disabled={loading}
                    />
                    {(logoPreview || existingLogo) && (
                        <img
                            src={logoPreview || resolveImageUrl(existingLogo)}
                            alt="Logo preview"
                            className="mt-3 w-full max-w-md h-32 object-contain rounded border border-stone-300 bg-white"
                        />
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-xl mb-1">Favicon</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2"
                        disabled={loading}
                    />
                    {(faviconPreview || existingFavicon) && (
                        <img
                            src={faviconPreview || resolveImageUrl(existingFavicon)}
                            alt="Favicon preview"
                            className="mt-3 h-16 w-16 object-contain rounded border border-stone-300 bg-white"
                        />
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-xl mb-1">Contact Mobile</label>
                    <input
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2"
                        placeholder="+880..."
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-xl mb-1">Contact Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2"
                        placeholder="example@email.com"
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-xl mb-1">Contact Address</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border border-stone-400 rounded w-full max-w-2xl p-2 min-h-24"
                        placeholder="Address"
                        disabled={loading}
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="bg-stone-800 text-white w-40 py-2 rounded-md cursor-pointer hover:shadow-md hover:font-semibold"
                        disabled={loading}
                    >
                        <span className="inline-flex items-center justify-center gap-2 w-full">
                            <FaSave />
                            <span>Save Settings</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
