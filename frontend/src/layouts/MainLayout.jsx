import { Outlet } from "react-router";
import Footer from "../components/frontend/common/Footer";
import Header from "../components/frontend/common/Header";

const MainLayout = () => {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
};

export default MainLayout;