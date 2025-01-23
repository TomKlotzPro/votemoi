import * as cheerio from 'cheerio';

export async function fetchUrlMetadata(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    const description = $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const imageUrl = $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    return {
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    };
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return null;
  }
}
