import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";

export function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const data = await api.get(`/content/blogs/${slug}`);
        setBlog(data.blog);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadBlog();
  }, [slug]);

  if (error) {
    return (
      <main className="container page">
        <p className="admin-form-error">{error}</p>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="container page">
        <p className="page-muted">Loading article...</p>
      </main>
    );
  }

  return (
    <main className="container page blog-detail-page">
      <Link className="back-link" to="/blog">
        <ArrowLeft size={17} /> Back to blog
      </Link>

      <article className="blog-detail-card">
        <img src={blog.image} alt={blog.title} className="blog-detail-image" />
        <div className="blog-detail-body">
          <div className="blog-tag-row">
            {blog.tags?.map((tag) => (
              <span key={tag} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
          <h1>{blog.title}</h1>
          <p className="page-muted">{new Date(blog.createdAt).toLocaleDateString()}</p>
          <p>{blog.description}</p>
        </div>
      </article>
    </main>
  );
}
