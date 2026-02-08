/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SiteSettingsContext = createContext({
    settings: null,
    setSettings: () => {},
    loading: true,
});

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1.0.0";
const getBackendUrl = () => import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const resolveImageUrl = (value) => {
    if (!value) return "";
    if (typeof value !== "string") return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const BACKEND_URL = getBackendUrl();
    if (value.startsWith("/")) return `${BACKEND_URL}${value}`;
    return `${BACKEND_URL}/uploads/${value}`;
};

const applySettingsToDom = (settings) => {
    if (typeof document === "undefined" || !settings) return;

    const themeColor = settings.themeColor || "#2563eb";
    document.documentElement.style.setProperty("--theme-color", themeColor);

    const favicon = resolveImageUrl(settings.favicon);
    if (favicon) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "icon");
            document.head.appendChild(link);
        }
        link.setAttribute("href", favicon);
    }
};

export const SiteSettingsProvider = ({ children }) => {
    const API_BASE = useMemo(() => getApiBase(), []);

    const [settings, setSettingsState] = useState(null);
    const [loading, setLoading] = useState(true);

    const setSettings = useCallback((next) => {
        setSettingsState(next);
        applySettingsToDom(next);
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/settings`, { validateStatus: () => true });
            if (res.status >= 200 && res.status < 300) {
                setSettings(res.data);
            }
            setLoading(false);
        })();
    }, [API_BASE]);

    useEffect(() => {
        applySettingsToDom(settings);
    }, [settings]);

    const value = useMemo(
        () => ({ settings, setSettings, loading }),
        [settings, setSettings, loading]
    );

    return (
        <SiteSettingsContext.Provider value={value}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
