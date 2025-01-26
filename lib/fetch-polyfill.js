// Import polyfills
import nodeFetch from 'node-fetch';
import {
  Blob,
  FormData,
  fetch as undiciFetch,
  Headers as undiciHeaders,
  Request as undiciRequest,
  Response as undiciResponse,
} from 'undici';
import 'web-streams-polyfill';

// Export the appropriate fetch implementation
export const fetch = undiciFetch || nodeFetch || globalThis.fetch;
export const Headers = undiciHeaders || nodeFetch.Headers || globalThis.Headers;
export const Request = undiciRequest || nodeFetch.Request || globalThis.Request;
export const Response =
  undiciResponse || nodeFetch.Response || globalThis.Response;

// Define globals
if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = fetch;
}

if (typeof globalThis.Headers !== 'function') {
  globalThis.Headers = Headers;
}

if (typeof globalThis.Request !== 'function') {
  globalThis.Request = Request;
}

if (typeof globalThis.Response !== 'function') {
  globalThis.Response = Response;
}

if (typeof globalThis.FormData !== 'function') {
  globalThis.FormData = FormData;
}

if (typeof globalThis.Blob !== 'function') {
  globalThis.Blob = Blob;
}

export { Blob, FormData };
