export function generateInsertionPoints(
  totalPosts: number,
): number[] {

  const points: number[] = [];

  if (totalPosts < 3) {
    return points;
  }

  // First ad appears after 2–5 posts.
  let current =
    Math.floor(Math.random() * 4) + 2;

  while (current < totalPosts) {

    points.push(current);

    // Next ad appears after 4–8 more posts.
    current +=
      Math.floor(Math.random() * 5) + 4;

  }

  return points;

}