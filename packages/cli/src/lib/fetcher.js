/**
 * fetcher.js
 *
 * Fetches preset markdown content from the registry.
 * Uses Node's built-in https module — zero extra dependencies.
 */

"use strict";

const https = require("https");
const http = require("http");

/**
 * Fetch text content from a URL.
 * Follows one level of redirects.
 * Returns Promise<string>.
 */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    client
      .get(url, (res) => {
        // Follow redirect
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchText(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(
            new Error(`HTTP ${res.statusCode} fetching ${url}`)
          );
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

module.exports = { fetchText };
