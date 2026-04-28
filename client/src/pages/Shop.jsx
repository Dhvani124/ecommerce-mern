import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard.jsx";
import { CategorySection } from "../components/CategorySection.jsx";
import { api } from "../lib/api.js";

export const Shop = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sort: "-createdAt"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/content/categories");
        setCategories(data.categories || []);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const loadProducts = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.minRating) params.append("minRating", filters.minRating);
      params.append("page", page);
      params.append("limit", 12);
      params.append("sort", filters.sort);

      const data = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.search, filters.category, filters.minPrice, filters.maxPrice, filters.minRating, filters.sort]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
    loadProducts(newPage);
  };

  const sortedProducts = useMemo(() => {
    const nextProducts = [...products];
    if (filters.sort === "price-asc") nextProducts.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") nextProducts.sort((a, b) => b.price - a.price);
    return nextProducts;
  }, [products, filters.sort]);

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Shop handmade</p>
          <h1>Delicate pieces for soft everyday joy.</h1>
        </div>
      </section>
      <CategorySection />
      <section className="container section">
        {/* Filters */}
        <div className="shop-filters">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="filter-input"
          />
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.slug || category._id || category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Min Price" 
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="filter-input"
          />
          <input 
            type="number" 
            placeholder="Max Price" 
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="filter-input"
          />
          <select 
            value={filters.minRating} 
            onChange={(e) => handleFilterChange("minRating", e.target.value)}
            className="filter-select"
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>

        <div className="shop-toolbar">
          <p>{pagination.total} products</p>
          <select 
            aria-label="Sort products" 
            value={filters.sort} 
            onChange={(e) => handleFilterChange("sort", e.target.value)}
          >
            <option value="-createdAt">Newest</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
            <option value="-rating">Highest rated</option>
          </select>
        </div>

        {loading ? <p>Loading...</p> : error ? <p className="admin-form-error">{error}</p> : null}

        <div className="product-grid">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button 
              disabled={pagination.page === 1} 
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button 
              disabled={pagination.page === pagination.pages} 
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
};
