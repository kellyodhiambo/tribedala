import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCreators } from '@/lib/queries';
import type { Profile } from '@/lib/queries';

const categories = ['All', 'Podcaster', 'DJ', 'MC', 'Videographer', 'Photographer', 'Blogger', 'Dancer', 'Producer', 'Content Creator', 'Writer'];

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCreators()
      .then((data) => {
        setCreators(data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = creators.filter((creator) => {
    const matchCategory = activeCategory === 'All' || creator.creator_category === activeCategory;
    const matchSearch =
      !searchQuery ||
      creator.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-foreground-500 mt-3">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-8 md:pb-12 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-xs font-semibold text-primary-500 mb-4">
              <i className="ri-user-star-line" />
              Verified Creators
            </span>
            <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground-50 mb-4">
              Meet the Creators
            </h1>
            <p className="text-sm md:text-lg text-foreground-400 max-w-2xl mx-auto">
              The podcasters, DJs, videographers, writers, and visionaries who power TribeDala.
              Every creator here is verified by our team.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-5">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-600 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators..."
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-background-200 border border-background-300/50 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
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

      {/* Creators Grid */}
      <section className="section-padding py-8 md:py-12 bg-background-100">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-user-search-line text-foreground-600 text-3xl mb-3" />
              <p className="text-sm text-foreground-500">No creators found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
              {filtered.map((creator) => (
                <div
                  key={creator.id}
                  className="card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={creator.avatar_url}
                      alt={creator.full_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/20 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-background-50/80 text-[10px] md:text-xs font-medium text-foreground-200">
                        {creator.creator_category}
                      </span>
                    </div>
                    {creator.featured && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary-500/80 text-[10px] font-medium text-background-50">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 -mt-8 relative">
                    <h3 className="font-heading font-bold text-sm md:text-base text-foreground-50">
                      {creator.full_name}
                    </h3>
                    <p className="text-[11px] md:text-xs text-primary-500 font-medium mb-1">
                      {creator.role}
                    </p>
                    <p className="text-[10px] md:text-xs text-foreground-500 line-clamp-2 mb-2">
                      {creator.bio}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {Object.entries(creator.social_links).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-500 hover:text-background-50 transition-all"
                          aria-label={platform}
                        >
                          <i className={`ri-${platform === 'twitter' ? 'twitter-x' : platform}-line text-[10px] md:text-xs`} />
                        </a>
                      ))}
                    </div>
                  </div>
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
            Are You a Creator?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            Apply to become a verified TribeDala creator and get featured in our directory,
            access exclusive opportunities, and join our community.
          </p>
          <Link to="/get-involved" className="btn-primary text-sm md:text-base inline-flex px-8 py-3">
            <i className="ri-user-add-line mr-2" />
            Apply as a Creator
          </Link>
        </div>
      </section>
    </div>
  );
}
