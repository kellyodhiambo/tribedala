/**
 * Format a date as a relative time string
 * e.g., "2 min ago", "1 hour ago", "3 days ago"
 */
export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return 'Just now';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
}

/** Format a publication timestamp as a real date and time in East Africa. */
export function formatPublishedDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Publication time unavailable';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Publication time unavailable';
  return new Intl.DateTimeFormat('en-KE', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

/**
 * Calculate estimated reading time based on word count
 * Average reading speed: ~200 words per minute
 */
export function calculateReadTime(htmlContent: string): number {
  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, '');
  // Count words
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  // Calculate reading time (minimum 1 minute)
  const readTime = Math.ceil(wordCount / 200);
  return Math.max(1, readTime);
}

/**
 * Format reading time
 * e.g., "5 min read", "1 min read"
 */
export function formatReadTime(htmlContent: string): string {
  const readTime = calculateReadTime(htmlContent);
  return `${readTime} min read`;
}

export default {
  formatTimeAgo,
  calculateReadTime,
  formatReadTime,
};
