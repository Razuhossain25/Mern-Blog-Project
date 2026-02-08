import { Link, NavLink } from "react-router";
import { FaBars } from "react-icons/fa";
import useCheckAuth from "../../../hooks/useCheckAuth";
import { useState } from "react";
import { useSiteSettings } from "../../../context/SiteSettingsContext";
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaTachometerAlt, FaUser } from "react-icons/fa";

const Header = () => {
    const [auth, setAuth] = useState(false);
    useCheckAuth().then(res => setAuth(res));

    const { settings } = useSiteSettings();
    const mobile = settings?.contact?.mobile || "";
    const email = settings?.contact?.email || "";
    const address = settings?.contact?.address || "";
    const hasContact = !!(mobile || email || address);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const resolveImageUrl = (value) => {
        if (!value) return "";
        if (typeof value !== "string") return "";
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
        return `${BACKEND_URL}/uploads/${value}`;
    };

    const logoUrl = resolveImageUrl(settings?.logo);
    const logoAlt = settings?.websiteTitle || "Logo";

    return (
        <div>
            {hasContact && (
                <div className="w-full border-b border-stone-200 bg-stone-50">
                    <div className="container mx-auto px-5 md:px-0 py-2">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-1 text-sm text-stone-700">
                            <div className="flex flex-col md:flex-row md:items-center gap-x-5 gap-y-1">
                                {mobile && (
                                    <a className="hover:underline" href={`tel:${mobile}`}>
                                        <span className="inline-flex items-center gap-2">
                                            <FaPhone />
                                            <span>{mobile}</span>
                                        </span>
                                    </a>
                                )}
                                {email && (
                                    <a className="hover:underline" href={`mailto:${email}`}>
                                        <span className="inline-flex items-center gap-2">
                                            <FaEnvelope />
                                            <span>{email}</span>
                                        </span>
                                    </a>
                                )}
                            </div>

                            {address && (
                                <span className="text-stone-700 inline-flex items-center gap-2">
                                    <FaMapMarkerAlt />
                                    <span>{address}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto py-4 flex items-center justify-between flex-wrap md:flex-nowrap px-5 md:px-0">
                <Link to="/" className="inline-flex items-center">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={logoAlt}
                            className="h-10 md:h-12 w-auto object-contain"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-2xl md:text-4xl text-(--theme-color) font-bold">Logo</span>
                    )}
                </Link>
                <label className="md:hidden cursor-pointer peer ml-auto" htmlFor="menu-toggle">
                    <FaBars />
                    <input type="checkbox" className="hidden" id="menu-toggle" />
                </label>
                <ul className="w-full md:w-max hidden peer-has-checked:flex md:flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:gap-6 *:*:text-(--theme-color) *:*:hover:underline *:*:hover:underline-offset-8 *:*:[&.active]:font-bold">
                    <li>
                        <NavLink to="/">Home</NavLink>
                    </li>
                    <li>
                        <NavLink to="/blog">Blog</NavLink>
                    </li>
                    <li>
                        <NavLink to="/about">About</NavLink>
                    </li>
                    <li>
                        <NavLink to="/contact">Contact</NavLink>
                    </li>
                    <li className="mt-3 md:mt-0">
                        {!auth && (
                        <Link to="/login" className="border px-3 py-2 rounded-lg cursor-pointer hover:text-white hover:bg-(--theme-color) hover:no-underline" style={{textDecoration: "none"}}>
                            <span className="inline-flex items-center gap-2">
                                <FaUser />
                                <span>Admin Login</span>
                            </span>
                        </Link>
                        )}
                        {auth && (
                        <Link to="/admin/dashboard" className="border px-3 py-2 rounded-lg cursor-pointer hover:text-white hover:bg-(--theme-color) hover:no-underline" style={{textDecoration: "none"}}>
                            <span className="inline-flex items-center gap-2">
                                <FaTachometerAlt />
                                <span>Dashboard</span>
                            </span>
                        </Link>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Header;