import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Post from "../../components/admin/post";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const AllPost = () => {
    const { settings } = useSiteSettings();
    const siteTitle = settings?.websiteTitle || "MERN Blog";
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        (async () => {
            await axios.get("http://localhost:4000/api/v1.0.0/posts").then(res => {
                setPosts(res.data);
            })
        })();
    }, []);

    const handleEdit = (post) => {
        const id = post?._id || post?.id;
        if (!id) return;
        navigate(`/admin/edit-post/${id}`);
    };

    const handleDelete = async (post) => {
        const id = post?._id || post?.id;
        if (!id) return;

        const res = await axios.delete(
            `http://localhost:4000/api/v1.0.0/posts/${id}`,
            { validateStatus: () => true }
        );

        if (res.status >= 200 && res.status < 300) {
            setPosts((prev) => prev.filter((p) => (p?._id || p?.id) !== id));
        } else {
            console.log(res);
        }
    };

    return (
        <div>
            <Helmet>
                <title>{`All Posts | ${siteTitle}`}</title>
            </Helmet>
            {!posts.length && <p>Loading...</p>}
            <Post posts={posts} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
};

export default AllPost;