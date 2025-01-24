import { load } from 'cheerio';
import { getLinkPreview } from 'link-preview-js';

interface URLMetadata {
  title?: string;
  description?: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
  previewFavicon?: string;
  previewSiteName?: string;
}

export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  try {
    // First try using link-preview-js with custom options
    const preview = await getLinkPreview(url, {
      followRedirects: 'follow',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if ('title' in preview) {
      return {
        title: preview.title || '',
        description: 'description' in preview ? preview.description : '',
        previewImage: preview.images?.[0] || '',
        previewTitle: preview.title || '',
        previewDescription: 'description' in preview ? preview.description : '',
        previewFavicon: preview.favicons?.[0] || '',
        previewSiteName: preview.siteName || '',
      };
    }

    // If link-preview-js fails, try manual fetch with custom headers
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!response.ok) {
      // If both methods fail, return empty metadata but don't throw an error
      return {
        title: '',
        description: '',
        previewImage: '',
        previewTitle: '',
        previewDescription: '',
        previewFavicon: '',
        previewSiteName: new URL(url).hostname,
      };
    }

    const html = await response.text();
    const $ = load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    const description = $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const previewImage = $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    const previewFavicon = $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    const siteName = $('meta[property="og:site_name"]').attr('content') ||
      new URL(url).hostname;

    return {
      title,
      description,
      previewImage,
      previewTitle: title,
      previewDescription: description,
      previewFavicon: previewFavicon ? new URL(previewFavicon, url).href : '',
      previewSiteName: siteName,
    };
  } catch (error) {
    console.error('Error extracting URL metadata:', error);
    // Return basic metadata instead of throwing
    return {
      title: '',
      description: '',
      previewImage: '',
      previewTitle: '',
      previewDescription: '',
      previewFavicon: '',
      previewSiteName: new URL(url).hostname,
    };
  }
}
