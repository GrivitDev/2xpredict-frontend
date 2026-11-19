import type { SportsNewsArticle } from '@/types/sports-v2';
import type { FootballNewsFeedItem } from '@/types/sports';

/**
 * Keeps the existing newsroom card model while sourcing article data from the
 * normalized Sports v2 news contract.
 */
export function toFootballNewsFeedItem(article: SportsNewsArticle): FootballNewsFeedItem {
  const canonicalUrl = article.canonicalUrl ?? article.mobileUrl ?? undefined;
  const publishedAt = article.publishedAt ?? article.lastModifiedAt ?? article.createdAt;

  return {
    kind: 'NEWS',
    eventId: article.id,
    leagueId: article.competitionId ?? article.competitionIds[0] ?? '',
    fixtureDate: publishedAt,
    homeTeamId: article.teamIds[0],
    awayTeamId: article.teamIds[1],
    publishedAt,
    payload: {
      headline: article.headline,
      description: article.description,
      story: article.description,
      published: publishedAt,
      byline: article.byline,
      source: article.byline,
      images: article.images,
      imageUrl: article.images[0]?.url,
      url: canonicalUrl,
      link: canonicalUrl,
      links: canonicalUrl ? { web: { href: canonicalUrl } } : undefined,
      categories: article.categories,
      premium: article.premium,
      contentKey: article.contentKey,
      articleType: article.type,
    },
  };
}
