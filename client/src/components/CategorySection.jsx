import { Flower2, Gift, Heart, Palette, Scissors, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { categories as fallbackCategories } from "../data/catalog.js";
import { api } from "../lib/api.js";

const icons = [Sparkles, Scissors, Flower2, Gift, Heart, Palette];

export const CategorySection = () => {
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/content/categories");
        if (data.categories?.length) {
          setCategories(
            data.categories.map((category, index) => ({
              name: category.name,
              subtitle: "Handmade collection",
              icon: icons[index % icons.length]
            }))
          );
        }
      } catch {
        setCategories(fallbackCategories);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="container section">
      <div className="section-title">
        <p className="eyebrow">Shop by craft</p>
        <h2>Categories made for slow gifting</h2>
      </div>
      <div className="category-grid">
        {categories.map(({ name, subtitle, icon: Icon }) => (
          <article className="category-card" key={name}>
            <span><Icon size={26} /></span>
            <h3>{name}</h3>
            <p>{subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
