import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import { getBlogPostBySlug, getBlogPosts, getBlogComments } from '@/lib/queries';
import type { BlogPost, BlogComment } from '@/lib/queries';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentErr, setCommentErr] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      try {
        const data = await getBlogPostBySlug(slug);
        setPost(data);
      } catch {
        // silent
      } finally {
        setLoadingPost(false);
      }
    }
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (!post?.category) return;
    getBlogPosts({ category: post.category }).then((posts) => {
      setRelatedPosts(posts.filter((p) => p.slug !== slug).slice(0, 3));
    });
  }, [post, slug]);

  const loadComments = useCallback(async () => {
    if (!slug) return;
    setLoadingComments(true);
    try {
      const data = await getBlogComments(slug);
      setComments(data);
    } catch {
      // silent
    } finally {
      setLoadingComments(false);
    }
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id || !slug || !commentText.trim()) return;

    setCommentErr('');
    setSubmitting(true);

    try {
      const commentPayload: any = {
        post_id: slug,
        user_id: user.id,
        content: commentText.trim(),
      };
      
      // Only add these if we have the data
      if (profile?.full_name) commentPayload.user_name = profile.full_name;
      else if (user.email) commentPayload.user_name = user.email.split('@')[0];
      else commentPayload.user_name = 'Anonymous';
      
      if (profile?.avatar_url) commentPayload.user_avatar = profile.avatar_url;

      const { error } = await supabase.from('blog_comments').insert(commentPayload);

      if (error) {
        setCommentErr(error.message);
      } else {
        setCommentText('');
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 3000);
        loadComments();
      }
    } catch {
      setCommentErr('Failed to post comment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!user?.id || !slug || !replyText.trim()) return;

    setCommentErr('');
    setSubmitting(true);

    try {
      const replyPayload: any = {
        post_id: slug,
        user_id: user.id,
        content: replyText.trim(),
        parent_comment_id: parentCommentId,
      };
      
      // Only add these if we have the data
      if (profile?.full_name) replyPayload.user_name = profile.full_name;
      else if (user.email) replyPayload.user_name = user.email.split('@')[0];
      else replyPayload.user_name = 'Anonymous';
      
      if (profile?.avatar_url) replyPayload.user_avatar = profile.avatar_url;

      const { error } = await supabase.from('blog_comments').insert(replyPayload);

      if (error) {
        setCommentErr(error.message);
      } else {
        setReplyText('');
        setReplyingTo(null);
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 3000);
        loadComments();
      }
    } catch {
      setCommentErr('Failed to post reply. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50 pt-20">
        <span className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50 pt-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-background-200 flex items-center justify-center mx-auto">
            <i className="ri-article-line text-2xl text-foreground-500" />
          </div>
          <h2 className="font-heading text-xl text-foreground-50">Article not found</h2>
          <Link to="/blog" className="text-sm text-primary-500 hover:text-primary-400">&larr; Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-8 section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/blog" className="text-xs text-foreground-400 hover:text-foreground-200 transition-colors flex items-center gap-1">
              <i className="ri-arrow-left-line" /> Blog
            </Link>
            <span className="text-foreground-600 text-xs">/</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-500/10 text-[10px] font-semibold text-secondary-500">
              {post.category}
            </span>
          </div>

          <h1 className="font-heading font-bold text-2xl md:text-4xl lg:text-5xl text-foreground-50 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-foreground-500 mb-6">
            <span className="flex items-center gap-1.5">
              <i className="ri-user-line text-foreground-600" />
              {post.author || 'Unknown Author'}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-calendar-line text-foreground-600" />
              {new Date(post.published_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-time-line text-foreground-600" />
              {post.readTime || '5'} min read
            </span>
          </div>

          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-background-200 flex items-center justify-center">
                <i className="ri-image-line text-3xl text-foreground-400" />
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-foreground-500">Share:</span>
            <button
              onClick={() => {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`;
                window.open(twitterUrl, '_blank');
              }}
              className="p-2 rounded-full bg-background-200 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition-colors"
              title="Share on Twitter"
            >
              <i className="ri-twitter-x-line text-lg" />
            </button>
            <button
              onClick={() => {
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                window.open(fbUrl, '_blank');
              }}
              className="p-2 rounded-full bg-background-200 hover:bg-[#1877F2]/20 text-[#1877F2] transition-colors"
              title="Share on Facebook"
            >
              <i className="ri-facebook-circle-line text-lg" />
            </button>
            <button
              onClick={() => {
                const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
                window.open(linkedInUrl, '_blank');
              }}
              className="p-2 rounded-full bg-background-200 hover:bg-[#0077B5]/20 text-[#0077B5] transition-colors"
              title="Share on LinkedIn"
            >
              <i className="ri-linkedin-box-line text-lg" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="p-2 rounded-full bg-background-200 hover:bg-primary-500/20 text-primary-500 transition-colors"
              title="Copy link"
            >
              <i className="ri-links-line text-lg" />
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
            {/* Main Article */}
            <article className="prose-custom">
              <div
                className="text-sm md:text-base text-foreground-200 leading-relaxed space-y-4 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:text-foreground-50 [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:leading-[1.8] [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share */}
              <div className="mt-10 pt-6 border-t border-background-300/30 flex items-center gap-3">
                <span className="text-xs text-foreground-500 font-medium">Share:</span>
                <button className="w-8 h-8 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-500 hover:text-background-50 transition-all cursor-pointer">
                  <i className="ri-twitter-x-line text-xs" />
                </button>
                <button className="w-8 h-8 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-500 hover:text-background-50 transition-all cursor-pointer">
                  <i className="ri-facebook-line text-xs" />
                </button>
                <button className="w-8 h-8 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-500 hover:text-background-50 transition-all cursor-pointer">
                  <i className="ri-whatsapp-line text-xs" />
                </button>
                <button className="w-8 h-8 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-500 hover:text-background-50 transition-all cursor-pointer">
                  <i className="ri-link text-xs" />
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-10 pt-6 border-t border-background-300/30">
                <h3 className="font-heading font-bold text-lg text-foreground-50 mb-6 flex items-center gap-2">
                  <i className="ri-chat-3-line text-primary-500" />
                  Comments {comments.length > 0 && <span className="text-xs text-foreground-500 font-normal">({comments.length})</span>}
                </h3>

                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8">
                    {commentErr && (
                      <div className="p-2.5 rounded-md bg-accent-500/10 text-xs text-accent-400 mb-3">{commentErr}</div>
                    )}
                    {commentSuccess && (
                      <div className="p-2.5 rounded-md bg-primary-500/10 text-xs text-primary-400 mb-3">
                        Comment posted successfully!
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-500">
                          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts..."
                          maxLength={500}
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-foreground-600">{commentText.length}/500</span>
                          <button
                            type="submit"
                            disabled={submitting || !commentText.trim()}
                            className="btn-primary text-xs px-4 py-1.5 rounded-md cursor-pointer disabled:opacity-50"
                          >
                            {submitting ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 rounded-lg bg-background-100 border border-background-300/30 mb-8 text-center">
                    <p className="text-sm text-foreground-400 mb-3">
                      Sign in to join the conversation.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link to="/login" className="btn-primary text-xs px-4 py-1.5 rounded-md">
                        Sign In
                      </Link>
                      <Link to="/signup" className="text-xs text-primary-500 hover:text-primary-400 transition-colors">
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                {loadingComments ? (
                  <div className="text-center py-4">
                    <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-6">
                    <i className="ri-chat-3-line text-foreground-600 text-2xl mb-2 block" />
                    <p className="text-sm text-foreground-500">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.filter(c => !c.parent_comment_id).map((comment) => {
                      const replies = comments.filter(c => c.parent_comment_id === comment.id);
                      return (
                        <div key={comment.id} className="space-y-3">
                          {/* Main Comment */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-background-200 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-foreground-400">
                                {(comment.user_name || 'Anonymous').charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-foreground-200">{comment.user_name || 'Anonymous'}</span>
                                <span className="text-[10px] text-foreground-600">
                                  {new Date(comment.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground-300 leading-relaxed">{comment.content}</p>
                              {user && (
                                <button
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="text-xs text-primary-500 hover:text-primary-400 mt-2 transition-colors"
                                >
                                  {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reply Form */}
                          {replyingTo === comment.id && user && (
                            <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="ml-8 space-y-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 resize-none focus:outline-none focus:border-primary-500"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setReplyingTo(null)}
                                  className="px-3 py-1 rounded-md text-xs text-foreground-400 hover:text-foreground-200 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={submitting || !replyText.trim()}
                                  className="px-3 py-1 rounded-md text-xs bg-primary-500 text-background-50 hover:bg-primary-600 disabled:opacity-50 transition-colors"
                                >
                                  {submitting ? 'Posting...' : 'Reply'}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Replies */}
                          {replies.length > 0 && (
                            <div className="ml-8 space-y-3 pt-2 border-l-2 border-background-300/40 pl-4">
                              {replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <div className="w-7 h-7 rounded-full bg-background-200 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-foreground-400">
                                      {(reply.user_name || 'Anonymous').charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-foreground-200">{reply.user_name || 'Anonymous'}</span>
                                      <span className="text-[10px] text-foreground-600">
                                        {new Date(reply.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground-300 leading-relaxed">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="card p-4">
                  <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground-400 mb-4">
                    Related Articles
                  </h4>
                  <div className="space-y-3">
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp.id}
                        to={`/blog/${rp.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-background-200">
                          <img src={rp.cover_image} alt={rp.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-medium text-foreground-200 group-hover:text-primary-500 transition-colors line-clamp-2">
                            {rp.title}
                          </h5>
                          <span className="text-[10px] text-foreground-600 mt-1 block">{rp.readTime} read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Kisumu News / Events Teaser */}
              <div className="card p-4 bg-accent-500/5 border border-accent-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-accent-500/20 flex items-center justify-center">
                    <i className="ri-map-pin-line text-xs text-accent-500" />
                  </div>
                  <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-accent-500">
                    Kisumu Pulse
                  </h4>
                </div>
                <p className="text-xs text-foreground-400 leading-relaxed mb-3">
                  Stay up to date with the latest news, events, and creative happenings in Kisumu.
                  From new gallery openings to lakefront festivals — we cover it all.
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 hover:text-accent-400 transition-colors"
                >
                  Explore Kisumu Stories <i className="ri-arrow-right-line text-[10px]" />
                </Link>
              </div>

              {/* CTA */}
              <div className="card p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-mail-line text-primary-500" />
                </div>
                <h4 className="font-heading font-semibold text-sm text-foreground-100 mb-1">
                  Get Weekly Updates
                </h4>
                <p className="text-xs text-foreground-500 mb-3">
                  Never miss a story from Kisumu&apos;s creative scene.
                </p>
                <Link to="/get-involved" className="btn-primary text-xs px-4 py-2 inline-block w-full">
                  Subscribe to Newsletter
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Bottom Nav */}
      <section className="section-padding py-8 border-t border-background-300/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/blog" className="text-sm text-foreground-400 hover:text-foreground-200 transition-colors flex items-center gap-1">
            <i className="ri-arrow-left-line" /> Back to all articles
          </Link>
          <Link to="/network" className="text-sm text-foreground-400 hover:text-foreground-200 transition-colors flex items-center gap-1">
            Creator Network <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </section>
    </div>
  );
}