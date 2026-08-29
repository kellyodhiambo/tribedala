import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '@/lib/queries';
import type { BlogPost } from '@/lib/queries';

const categories = ['All', 'Industry', 'Recommendations', 'Behind the Scenes', 'Guide'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filtered = posts.filter((post) => {
    const matchCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-8 md:pb-12 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-500/10 text-xs font-semibold text-secondary-500 mb-4">
              <i className="ri-article-line" />
              Blog
            </span>
            <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground-50 mb-4">
              TribeDala Stories
            </h1>
            <p className="text-sm md:text-lg text-foreground-400 max-w-2xl mx-auto">
              Thoughts, insights, and stories from the creative frontlines of East Africa.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-600 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-background-200 border border-background-300/50 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-500 text-background-50'
                    : 'bg-background-200 text-foreground-400 hover:text-foreground-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="section-padding py-8 md:py-12 bg-background-100">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <span className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-article-line text-foreground-600 text-3xl mb-3" />
              <p className="text-sm text-foreground-500">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  className="card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[3/2] overflow-hidden bg-background-200">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-image-line text-2xl text-foreground-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-background-50/80 text-xs font-medium text-foreground-200">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-50 group-hover:text-primary-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-foreground-500 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-xs text-foreground-600">
                        <span>{post.author || 'Unknown Author'}</span>
                        <span>{post.readTime || '5'} min read</span>
                      </div>
                      <span className="text-xs text-foreground-700">{post.published_at}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
            Want to Write for TribeDala?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            We&apos;re always looking for fresh voices to contribute to our blog. Pitch your story idea.
          </p>
          <Link to="/get-involved" className="btn-primary text-sm md:text-base inline-flex px-8 py-3">
            <i className="ri-pencil-line mr-2" />
            Submit a Pitch
          </Link>
        </div>
      </section>
    </div>
  );
}