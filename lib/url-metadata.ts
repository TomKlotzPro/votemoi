import axios from 'axios';
import * as cheerio from 'cheerio';

export interface URLMetadata {
  previewImage: (string & { startsWith?: (prefix: string) => boolean }) | null;
  previewTitle: (string & { startsWith?: (prefix: string) => boolean }) | null;
  previewDescription: (string & { startsWith?: (prefix: string) => boolean }) | null;
  previewFavicon: (string & { startsWith?: (prefix: string) => boolean }) | null;
  previewSiteName: (string & { startsWith?: (prefix: string) => boolean }) | null;
}

/**
 * Extracts metadata from a URL using axios
 * @param url The URL to extract metadata from
 * @returns A promise that resolves to the URL metadata
 */
export async function fetchUrlMetadata(url: string): Promise<URLMetadata> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const metadata: URLMetadata = {
      previewImage:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        null,
      previewTitle:
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        null,
      previewDescription:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        null,
      previewFavicon:
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        null,
      previewSiteName:
        $('meta[property="og:site_name"]').attr('content') || null,
    };

    // Convert relative URLs to absolute URLs
    if (metadata.previewImage && !metadata.previewImage.startsWith('http')) {
      metadata.previewImage = new URL(metadata.previewImage, url).toString();
    }

    if (
      metadata.previewFavicon &&
      !metadata.previewFavicon.startsWith('http')
    ) {
      metadata.previewFavicon = new URL(
        metadata.previewFavicon,
        url
      ).toString();
    }

    return metadata;
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return {
      previewImage: null,
      previewTitle: null,
      previewDescription: null,
      previewFavicon: null,
      previewSiteName: null,
    };
  }
}
