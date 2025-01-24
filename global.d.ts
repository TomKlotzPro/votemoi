/// <reference types="node" />

declare global {
  var fetch: (typeof import('node-fetch'))['default'];
  var Headers: (typeof import('node-fetch'))['Headers'];
  var Request: (typeof import('node-fetch'))['Request'];
  var Response: (typeof import('node-fetch'))['Response'];
}

export {};
