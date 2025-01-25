export const preloadLinks = async () => {
  try {
    // Prefetch the links data
    const response = await fetch('/api/links', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache: 'force-cache' to enable caching
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error('Failed to preload links');
    }

    const links = await response.json();
    console.log(`Preloaded ${links.length} links successfully`);
    return links;
  } catch (error) {
    console.error('Error preloading links:', error);
    return [];
  }
};
