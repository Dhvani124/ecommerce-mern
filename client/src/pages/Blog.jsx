import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await api.get("/content/blogs");
        setBlogs(data.blogs);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadBlogs();
  }, []);

  return (
    <main className="container page">
      <div className="section-title">
        <p className="eyebrow">Journal</p>
        <h1>Studio notes and handmade care tips.</h1>
      </div>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="blog-grid">
        {blogs.map((blog) => (
          <article className="blog-card blog-card--dynamic" key={blog._id}>
            <img src={blog.image} alt={blog.title} className="blog-card__image" />
            <div className="blog-card__body">
              <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
              <h2>{blog.title}</h2>
              <span>{blog.description}</span>
              <div className="blog-tag-row">
                {blog.tags?.map((tag) => (
                  <span key={tag} className="blog-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <Link to={`/blog/${blog.slug}`}>Read more</Link>
            </div>
          </article>
        ))}
      </div>

      {!blogs.length && !error ? <p className="page-muted">No blog posts found.</p> : null}
    </main>
  );
};
