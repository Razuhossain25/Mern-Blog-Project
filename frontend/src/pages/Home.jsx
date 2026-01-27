import Hero from "../components/frontend/home/Hero";

const Home = () => {
    return (
        <div>
            <Hero />
            <div className="container mx-auto px-5 md:px-0 py-3 md:py-6">
                <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center">Latest Articles</h2>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. In vitae ex exercitationem facere tempora impedit esse ea minima sint sapiente.</p>
            </div>
        </div>
    );
};

export default Home;