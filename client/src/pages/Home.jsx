import { useEffect, useState } from "react";
import { ArrowRight, PackageCheck, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CategorySection } from "../components/CategorySection.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { gallery, products } from "../data/catalog.js";
import { api } from "../lib/api.js";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState(products.slice(0, 4));

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const data = await api.get("/products?featured=true&limit=4");
        if (data.products?.length) {
          setFeaturedProducts(data.products);
        }
      } catch {
        setFeaturedProducts(products.slice(0, 4));
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Handmade with love</p>
            <h1>Crafted with love, touched by creativity.</h1>
            <p>
              Explore soft pastel handmade pieces, thoughtful gifts, nail art,
              crochet keepsakes, floral details, and custom creations.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" to="/shop">
                Shop now <ArrowRight size={18} />
              </Link>
              <Link className="ghost-button" to="/gallery">
                View gallery
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=1100&q=80"
              alt="Pastel handmade product flatlay"
            />
          </div>
        </div>
      </section>
      <CategorySection />
      <section className="container section">
        <div className="section-title">
          <p className="eyebrow">Featured products</p>
          <h2>Soft picks for the season</h2>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="container split-feature">
        <img
          src="https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1000&q=80"
          alt="Handmade packaging"
        />
        <div>
          <p className="eyebrow">Made for you</p>
          <h2>Every detail feels personal.</h2>
          <p>
            From color pairing to careful packaging, each piece is created to feel
            warm, feminine, minimal, and beautifully handmade.
          </p>
          <div className="promise-list">
            <span><Sparkles size={18} /> Handmade with care</span>
            <span><PackageCheck size={18} /> Secure packaging</span>
            <span><Wand2 size={18} /> Custom orders available</span>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-title">
          <p className="eyebrow">From Instagram</p>
          <h2>Little moments from our studio</h2>
        </div>
        <div className="mini-gallery">
          {gallery.slice(0, 6).map((image) => (
            <img key={image} src={image} alt="Instagram style gallery item" />
          ))}
        </div>
      </section>
    </>
  );
};
