export default function get(url, cb, isRaw) {
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    return false;
  }
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      cb(isRaw ? httpRequest.responseText : JSON.parse(httpRequest.responseText))
    }
  };
  httpRequest.open('GET', url);
  httpRequest.send();
}
