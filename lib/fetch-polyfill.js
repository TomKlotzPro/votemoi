// Import polyfills
require('web-streams-polyfill');
const nodeFetch = require('node-fetch');
const {
  fetch: undiciFetch,
  Headers: undiciHeaders,
  Request: undiciRequest,
  Response: undiciResponse,
  FormData,
  Blob,
} = require('undici');

// Use undici by default, fallback to node-fetch
const fetch = undiciFetch || nodeFetch;
const Headers = undiciHeaders || nodeFetch.Headers;
const Request = undiciRequest || nodeFetch.Request;
const Response = undiciResponse || nodeFetch.Response;

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

module.exports = {
  fetch,
  Headers,
  Request,
  Response,
  FormData,
  Blob,
};
