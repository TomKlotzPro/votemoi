const { Headers, Request, Response } = require('undici');

if (!global.Headers) {
  global.Headers = Headers;
}
if (!global.Request) {
  global.Request = Request;
}
if (!global.Response) {
  global.Response = Response;
}
