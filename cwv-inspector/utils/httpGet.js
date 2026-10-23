import http from 'http';
import https from 'https';

/** Small GET helper used for deployment metadata probes. */
export function httpGet(urlStr, timeoutMs = 6000, redirectsRemaining = 5) {
  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(urlStr);
    } catch (error) {
      reject(error);
      return;
    }

    const transport = url.protocol === 'http:' ? http : url.protocol === 'https:' ? https : null;
    if (!transport) {
      reject(new Error(`Unsupported protocol: ${url.protocol}`));
      return;
    }

    const request = transport.get(url, { timeout: timeoutMs }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        if (redirectsRemaining <= 0) {
          reject(new Error('Too many redirects'));
          return;
        }
        const redirectUrl = new URL(response.headers.location, url).toString();
        httpGet(redirectUrl, timeoutMs, redirectsRemaining - 1).then(resolve, reject);
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({
        ok: response.statusCode >= 200 && response.statusCode < 300,
        status: response.statusCode,
        text: () => Promise.resolve(body)
      }));
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timed out'));
    });
  });
}
