const undici = require('undici');

if (!global.Headers) {
  global.Headers = undici.Headers;
}
if (!global.Request) {
  global.Request = undici.Request;
}
if (!global.Response) {
  global.Response = undici.Response;
}
