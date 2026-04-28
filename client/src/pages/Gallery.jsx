import { Instagram, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

export const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await api.get("/content/gallery");
        setGalleryItems(data.galleryItems);
        setCategories(data.categories);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadGallery();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return galleryItems;
    return galleryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, galleryItems]);

  return (
    <main className="container page">
      <div className="section-title">
        <p className="eyebrow">Gallery</p>
        <h1>A glimpse of creations made with love.</h1>
      </div>

      <div className="gallery-filter-row">
        <button
          type="button"
          className={`gallery-filter${activeCategory === "all" ? " active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={`gallery-filter${activeCategory === category ? " active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="gallery-grid gallery-grid--dynamic">
        {filteredItems.map((item, index) => (
          <article
            className={index % 5 === 0 || index % 7 === 0 ? "gallery-tile large" : "gallery-tile"}
            key={item._id}
            onClick={() => setSelectedItem(item)}
          >
            <img src={item.image} alt={item.altText || item.title} />
            <span>
              <Instagram size={18} />
            </span>
          </article>
        ))}
      </div>

      {!filteredItems.length && !error ? <p className="page-muted">No gallery images found.</p> : null}

      {selectedItem ? (
        <div className="gallery-lightbox" onClick={() => setSelectedItem(null)}>
          <button type="button" className="gallery-lightbox__close" onClick={() => setSelectedItem(null)}>
            <X size={18} />
          </button>
          <div className="gallery-lightbox__card" onClick={(event) => event.stopPropagation()}>
            <img src={selectedItem.image} alt={selectedItem.altText || selectedItem.title} />
            <div className="gallery-lightbox__body">
              <h2>{selectedItem.title}</h2>
              <p>{selectedItem.category}</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
