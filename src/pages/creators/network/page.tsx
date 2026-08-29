import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import { getCreators } from '@/lib/queries';
import type { Profile } from '@/lib/queries';

interface FollowState {
  [creatorId: string]: boolean;
}

export default function CreatorNetworkPage() {
  const { user, profile } = useAuth();
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState<FollowState>({});
  const [followingCount, setFollowingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loadingFollows, setLoadingFollows] = useState(false);

  const categories = ['All', 'Podcaster', 'DJ', 'MC', 'Videographer', 'Photographer', 'Blogger', 'Dancer', 'Producer', 'Content Creator', 'Writer'];

  useEffect(() => {
    getCreators()
      .then((data) => setCreators(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadFollows = useCallback(async () => {
    if (!user?.id) return;
    setLoadingFollows(true);
    try {
      const { data } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id);

      const followed: FollowState = {};
      if (data) {
        data.forEach((f) => { followed[f.followed_id] = true; });
      }
      setFollowState(followed);

      const { data: myFollows } = await supabase
        .from('follows')
        .select('followed_id', { count: 'exact' })
        .eq('follower_id', user.id);
      setFollowingCount(myFollows?.length || 0);

    } catch {
      // silent fail
    } finally {
      setLoadingFollows(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFollows();
  }, [loadFollows]);

  const handleFollow = async (creatorId: string) => {
    if (!user?.id) return;
    if (followState[creatorId]) {
      setFollowState((prev) => ({ ...prev, [creatorId]: false }));
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('followed_id', creatorId);
    } else {
      setFollowState((prev) => ({ ...prev, [creatorId]: true }));
      await supabase.from('follows').insert({ follower_id: user.id, followed_id: creatorId });
    }
  };

  const creatorsWithIds = creators.map((c) => ({
    ...c,
    uid: c.id,
    displayId: `creator-${c.id}`,
  }));

  const filtered = creatorsWithIds.filter((c) => {
    const matchCategory = activeCategory === 'All' || c.creator_category === activeCategory;
    const matchSearch = !searchQuery || c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 text-xs font-semibold text-accent-500 mb-4">
              <i className="ri-group-line" />
              Creator Network
            </span>
            <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground-50 mb-4">
              Connect &amp; Collaborate
            </h1>
            <p className="text-sm md:text-lg text-foreground-400 max-w-2xl mx-auto">
              Discover Kisumu&apos;s most talented creators. Follow their work, connect directly,
              and build together.
            </p>
          </div>

          {profile && (
            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-foreground-400">
              <span className="flex items-center gap-1.5">
                <i className="ri-user-follow-line text-accent-500" />
                Following: <strong className="text-foreground-200">{followingCount}</strong>
              </span>
            </div>
          )}

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-600 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by name or role..."
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-background-200 border border-background-300/50 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-accent-500 text-background-50'
                    : 'bg-background-200 text-foreground-400 hover:text-foreground-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Network Grid */}
      <section className="section-padding py-8 md:py-12 bg-background-100">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-user-search-line text-foreground-600 text-3xl mb-3" />
              <p className="text-sm text-foreground-500">No creators found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((creator) => (
                <div
                  key={creator.uid}
                  className="card overflow-hidden group hover:-translate-y-1 transition-transform"
                >
                  <Link to={`/creators/${creator.full_name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={creator.avatar_url}
                        alt={creator.full_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full bg-background-50/80 text-[10px] font-medium text-foreground-200">
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
                      <p className="text-[11px] md:text-xs text-foreground-400 font-medium mb-1">
                        {creator.role}
                      </p>
                      <p className="text-[10px] md:text-xs text-foreground-500 line-clamp-2 mb-2">
                        {creator.bio}
                      </p>
                    </div>
                  </Link>

                  {/* Follow Button */}
                  <div className="px-3 pb-3">
                    {user ? (
                      <button
                        onClick={() => handleFollow(creator.uid)}
                        disabled={loadingFollows}
                        className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          followState[creator.uid]
                            ? 'bg-accent-500/15 text-accent-500 hover:bg-accent-500/25'
                            : 'bg-accent-500 text-background-50 hover:bg-accent-600 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        }`}
                      >
                        {followState[creator.uid] ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <i className="ri-user-follow-fill text-xs" />
                            Following
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <i className="ri-user-follow-line text-xs" />
                            Follow
                          </span>
                        )}
                      </button>
                    ) : (
                      <Link
                        to="/signup"
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-accent-500 text-background-50 hover:bg-accent-600 text-center block transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-user-add-line mr-1.5" />
                        Sign up to Follow
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      {!user && (
        <section className="section-padding py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
              Ready to Join the Network?
            </h2>
            <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
              Create an account to follow your favorite creators, get notified about their latest work,
              and connect directly with Kisumu&apos;s creative community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="btn-primary text-sm md:text-base inline-flex px-8 py-3">
                <i className="ri-user-add-line mr-2" />
                Sign Up Free
              </Link>
              <Link to="/creators" className="text-sm text-foreground-400 hover:text-foreground-200 transition-colors">
                Browse all creators &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
