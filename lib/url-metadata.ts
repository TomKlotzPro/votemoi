import axios from 'axios';
import { load } from 'cheerio';

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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = load(html);

    // Extract metadata
    const metadata: URLMetadata = {
      title: $('title').text() || $('meta[property="og:title"]').attr('content'),
      description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
      previewImage: $('meta[property="og:image"]').attr('content'),
      previewTitle: $('meta[property="og:title"]').attr('content'),
      previewDescription: $('meta[property="og:description"]').attr('content'),
      previewFavicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href'),
      previewSiteName: $('meta[property="og:site_name"]').attr('content')
    };

    return metadata;
  } catch (error) {
    console.error('Error extracting URL metadata:', error);
    return {};
  }
}
