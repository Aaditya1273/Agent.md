---
targetModels:
  - "Claude Fable 5"
  - "Claude Opus 5"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
  - "Future Claude Models"
name: network
category: Performance
description: Network performance — latency versus bandwidth, connection setup cost, compression, request waterfalls, and delivering bytes from close to the user.
license: MIT
author: Agent.md maintainers
last-verified: 2026-08-23
reviewed-by: unreviewed
---
<!-- Generated from models/_canonical by scripts/build-model-variants.js.
     Edit the canonical source, not this file. Structure adapted for Claude per deep-research.md. -->
# Purpose

<purpose>
Rules for making the network faster. The central fact: **latency, not bandwidth,
dominates web performance.** Doubling bandwidth barely changes page load time;
halving round trips changes it a lot.

Every rule here reduces round trips, moves bytes closer, or sends fewer of them —
in that order of impact.

---
</purpose>

# Count the round trips

<rules>
A cold HTTPS connection costs, before a single byte of your content:

```
DNS lookup        1 RTT (0 if cached)
TCP handshake     1 RTT
TLS 1.3 handshake 1 RTT (0 on resumption)
HTTP request      1 RTT
```

On a 100 ms round trip that is 300–400 ms before anything arrives. Consequences:

- **Every additional origin costs a full connection setup.** Three third-party
  domains on a page is roughly a second of setup on mobile.
- `preconnect` for origins you will definitely use, early; `dns-prefetch` for
  likely ones. Do not preconnect to everything — each open connection competes.
- **HTTP/2 or HTTP/3** multiplexes many requests over one connection, removing
  head-of-line blocking at the HTTP layer. HTTP/3 (QUIC) also removes TCP-level
  head-of-line blocking, which matters most on lossy mobile networks.
- Keep connections alive. Set the server's `keepAliveTimeout` **above** the load
  balancer's idle timeout, or you get intermittent `502`s from close races.
  → `Backend/express`

---
</rules>

# Eliminate waterfalls

<rules>
A waterfall is a request that cannot start until a previous one finishes. It is
the single largest avoidable cost in most applications.

```
❌ HTML → JS → fetch config → fetch user → fetch orders      4 sequential RTTs
✅ HTML → (JS ∥ config) → (user ∥ orders)                    2
```

- Server-render or return data with the document, so the client does not make a
  round trip to discover what to request. → `Frontend/server-components`
- Start independent requests together (`Promise.all`), on the client and the
  server. A sequential `await` chain in a server component is a server-side
  waterfall.
- Discovery waterfalls: an import that discovers another import, a JSON manifest
  that names the real asset. Use `modulepreload` and `preload` for known critical
  resources.
- Do not preload everything — a preloaded resource competes with the one that
  actually blocks rendering. → `Frontend/performance`

---
</rules>

# Send fewer bytes

<rules>
| Technique | Typical saving |
| --- | --- |
| Brotli over gzip (static assets) | 15–25% |
| AVIF/WebP over JPEG/PNG | 30–60% |
| Font subsetting | 50–90% |
| Removing an unused dependency | Whatever it weighed |
| Projecting API responses to needed fields | Frequently 50%+ |

- Compress text: Brotli level 11 for static assets at build time, a lower level
  for dynamic responses where CPU matters.
- **Do not compress already-compressed formats** — images, video, `.woff2`. It
  costs CPU and saves nothing.
- Compression on responses that reflect user input can leak secrets by size
  (BREACH). Do not compress a response containing a secret alongside
  attacker-controlled content. → `Security/headers`
- API payload size is a real cost on mobile: return the fields the client needs,
  paginate, and avoid deeply nested expansions nobody reads.
  → `API/pagination`

---
</rules>

# Cache to avoid the request entirely

<rules>
The fastest request is the one not made.

```
Cache-Control: public, max-age=31536000, immutable      # content-hashed assets
Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400
Cache-Control: private, no-store                        # authenticated
```

- Content-hash asset filenames so they can be cached for a year and a deploy
  changes the URL.
- `ETag`/`If-None-Match` turns a repeat request into a 304 with no body — still a
  round trip, so it is second-best to a cache hit.
- `stale-while-revalidate` serves instantly from cache and refreshes in the
  background.
- **Never cache an authenticated response in a shared cache.**
  → `Performance/caching`

---
</rules>

# Move bytes closer

<rules>
- A CDN turns a 150 ms origin round trip into a 15 ms edge round trip. It is the
  highest-leverage change available for a geographically distributed audience.
- Ensure a high cache hit ratio at the edge — a CDN that proxies every request to
  the origin adds a hop and helps nothing.
- Co-locate compute with data. An edge function querying a database in another
  region pays that latency on every query, which usually cancels the benefit of
  being at the edge. → `DevOps/vercel`
- For chatty internal services, latency multiplies: a request that makes twenty
  sequential internal calls at 2 ms each is 40 ms of pure network. Batch, or
  co-locate.

---
</rules>

# Anti-patterns

<antipatterns>
| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Optimising bandwidth, ignoring latency | Round trips dominate | Reduce round trips |
| Many third-party origins | Full connection setup each | Consolidate; `preconnect` |
| `preconnect` to everything | Open connections compete | Only definite origins |
| Sequential dependent requests | Waterfall | Parallelise; send data with the document |
| Client fetching config before data | An extra round trip before anything | Inline it in the response |
| Preloading everything | Competes with render-blocking resources | Preload deliberately |
| HTTP/1.1 with many small assets | Six-connection limit, head-of-line blocking | HTTP/2 or HTTP/3 |
| `keepAliveTimeout` below the LB's | Intermittent `502`s | Set it higher |
| No compression on text | Multiples of the necessary bytes | Brotli/gzip |
| Compressing images and fonts | CPU cost, no saving | Skip already-compressed types |
| Compressing secrets with reflected input | BREACH-style size oracle | Do not compress those responses |
| Returning full entities from APIs | Payload dominated by unused fields | Project fields |
| No content hashing on assets | Cannot cache long; deploys serve stale | Hash filenames |
| Caching authenticated responses | Cross-user data exposure | `private, no-store` |
| CDN with a low hit ratio | Adds a hop, saves nothing | Fix the cache rules |
| Edge compute far from the data | Per-query latency cancels the gain | Co-locate |
| Chatty internal calls | Latency multiplies | Batch or co-locate |

---
</antipatterns>

# Checklist

<checklist>
- [ ] Performance work targets round trips before bandwidth
- [ ] Third-party origins are minimised and critical ones are `preconnect`ed
- [ ] No request waterfall exists on the critical path
- [ ] Independent requests are issued in parallel on client and server
- [ ] Data needed for first render arrives with the document
- [ ] Preloading is deliberate and limited to render-critical resources
- [ ] HTTP/2 or HTTP/3 is enabled
- [ ] Server keep-alive exceeds the load balancer idle timeout
- [ ] Text responses are compressed with Brotli or gzip
- [ ] Already-compressed formats are not re-compressed
- [ ] Responses mixing secrets and reflected input are not compressed
- [ ] API responses return only required fields and paginate
- [ ] Static assets are content-hashed and cached immutably
- [ ] `stale-while-revalidate` is used for cacheable dynamic content
- [ ] Authenticated responses are never in a shared cache
- [ ] A CDN serves static assets with a monitored hit ratio
- [ ] Compute is co-located with the data it queries
- [ ] Internal service calls are batched rather than sequential
</checklist>
