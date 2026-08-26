export function generateInsertionPoints(
  totalPosts: number,
): number[] {
  if (totalPosts < 3) {
    return [];
  }

  const points: number[] = [];

  // First ad: after 2–5 posts.
  let current =
    Math.floor(Math.random() * 4) + 2;

  while (current < totalPosts) {
    points.push(current);

    // Next ad: after 4–8 posts.
    current +=
      Math.floor(Math.random() * 5) + 4;
  }

  return points;
}