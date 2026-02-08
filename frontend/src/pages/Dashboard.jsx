import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../context/SiteSettingsContext";

const Dashboard = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
    return (
        <div className="w-full">
            <Helmet>
                <title>{`Dashboard | ${siteTitle}`}</title>
            </Helmet>
            <h2 className="text-4xl mb-6">Dashboard</h2>

            <div className="w-full max-w-5xl rounded border border-stone-200 bg-white p-5">
                <p className="text-lg">Welcome to the admin dashboard.</p>
            </div>
        </div>
    );
};

export default Dashboard;