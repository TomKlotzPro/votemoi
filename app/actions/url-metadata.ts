import { getLinkPreview } from 'link-preview-js';
import * as cheerio from 'cheerio';

export interface URLMetadata {
  title: string;
  description: string | null;
  imageUrl: string | null;
}

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VoteMoi/1.0;)'
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function extractMetadataFromHTML(url: string): Promise<URLMetadata> {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
                 $('meta[name="twitter:title"]').attr('content') ||
                 $('title').text() ||
                 '';

    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="twitter:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       null;

    const imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    null;

    return {
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null
    };
  } catch (error) {
    console.error('Error extracting metadata from HTML:', error);
    throw error;
  }
}

export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  try {
    // First try with link-preview-js
    try {
      const data = await getLinkPreview(url, {
        timeout: 3000,
        followRedirects: 'follow',
      });

      return {
        title: data.title || '',
        description: data.description || null,
        imageUrl: data.images?.[0] || null,
      };
    } catch (linkPreviewError) {
      console.log('link-preview-js failed, falling back to HTML extraction:', linkPreviewError);
    }

    // Fallback to HTML extraction
    try {
      return await extractMetadataFromHTML(url);
    } catch (htmlError) {
      console.log('HTML extraction failed:', htmlError);
    }

    // If all else fails, return basic metadata
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname,
      description: null,
      imageUrl: null,
    };
  } catch (error) {
    console.error('Error extracting URL metadata:', error);
    return {
      title: url,
      description: null,
      imageUrl: null,
    };
  }
}
