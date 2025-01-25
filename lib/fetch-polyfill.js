// Import polyfills
require('web-streams-polyfill');
const nodeFetch = require('node-fetch');
const { 
  fetch: undiciFetch,
  Headers: undiciHeaders,
  Request: undiciRequest,
  Response: undiciResponse,
  FormData: undiciFormData,
  Blob: undiciBlob,
} = require('undici');

// Use undici by default, fallback to node-fetch
const fetch = undiciFetch ?? nodeFetch;
const Headers = undiciHeaders ?? nodeFetch.Headers;
const Request = undiciRequest ?? nodeFetch.Request;
const Response = undiciResponse ?? nodeFetch.Response;
const FormData = undiciFormData ?? nodeFetch.FormData;
const Blob = undiciBlob ?? nodeFetch.Blob;

// Define globals if they don't exist
if (typeof globalThis !== 'undefined') {
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
}

module.exports = {
  fetch,
  Headers,
  Request,
  Response,
  FormData,
  Blob,
};
