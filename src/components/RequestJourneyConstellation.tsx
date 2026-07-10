"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTELLATION — one click on a YouTube video, traced as a ring of 23 nodes.
   The request travels the loop clockwise (out through your home network, under
   the ocean to Google, and back), every edge animates the real transport
   medium, and the "scale ∞" node pulses in the center. Click a node for the
   full story of what happens there.
──────────────────────────────────────────────────────────────────────────── */

/* palette — the site's design tokens (globals.css) */
const C = {
  brand: "#5187ef", brand2: "#2f66e0", brand3: "#7ba6f5",
  sky: "#0ea5e9", amber: "#d97706", violet: "#7c3aed",
  text: "#0f1b33", muted: "#5a6b88", line: "#e3e9f4",
};
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const TAU = Math.PI * 2;
const hexA = (h: string, a: number) => { const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const rnd = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const HEXC = "0123456789ABCDEF";
const hx = (n: number) => HEXC[Math.floor(rnd(n) * 16)];

/* ── the 23 stops ─────────────────────────────────────────────────────────── */
type Station = { key: string; layer: string; title: string; dek: string; facts: string[]; deep: string[]; accent: string };
const STATIONS: Station[] = [
  { key: "tap", accent: C.brand2, layer: "Input · hardware", title: "You click play", dek: "A click isn't magic — pressing the mouse button closes a physical circuit (on a phone, a capacitive touch fires instead). The device packages it into a tiny HID report, sends it over 2.4 GHz radio or USB, and the OS turns it into a click event the browser can handle.", facts: ["Button → HID report", "2.4 GHz radio / USB to your computer", "OS → browser click event"], deep: ["A HID report is a tiny byte array of button + position state", "Polled ~125–1000 times per second (the polling rate)", "The browser's handler fires: onClick(play)", "Nothing has touched the network yet"] },
  { key: "request", accent: C.brand, layer: "Application · HTTP", title: "The browser builds a request", dek: "The click handler decides it needs a video and constructs an HTTP request: a method (GET), a path, and headers — Host, Authorization, Accept, cookies. This is the actual 'ask' that will travel the world, headed for www.youtube.com.", facts: ["GET /watch?v=dQw4w9WgXcQ HTTP/2", "Headers: Host, Auth, Accept, Cookie", "The method says what to do"], deep: ["Methods: GET reads, POST writes, PUT/DELETE, …", "Headers are key: value text lines", "HTTP/2 & HTTP/3 compress headers (HPACK / QPACK)", "A body (for POST/PUT) follows the headers", "Right now it's still just text"] },
  { key: "device", accent: C.brand2, layer: "Application · encoding", title: "Everything becomes bits", dek: "Before anything can move it's serialized to bytes, then bits. Text becomes UTF-8, structured data becomes JSON or Protobuf, and the video that returns is frames squeezed by a codec. 1s and 0s are all a wire can carry.", facts: ["Text → UTF-8 (A = 0x41)", "Data → JSON / Protobuf", "Video → VP9 / AV1 frames"], deep: ["UTF-8 uses 1–4 bytes per character", "Images: RGB(A) pixels 0–255, then PNG/JPEG/WebP compress", "Video stores keyframes + deltas, not full frames", "Audio is sampled ~44,100×/sec (PCM)", "Compression strips redundancy so less has to travel"] },
  { key: "kernel", accent: C.amber, layer: "OS · kernel", title: "One syscall — the OS takes over", dek: "The browser never talks to the network directly — it asks the operating system to. A single send() call crosses the boundary from user space into the kernel, where the OS's TCP/IP stack owns the bytes from here: it buffers them, segments them, and hands them to the network driver.", facts: ["send() crosses into kernel space", "Kernel TCP/IP stack segments the bytes", "Driver → NIC ring buffer"], deep: ["Syscalls are the only door between user space and the kernel", "To the app, the socket is just a file descriptor", "Bytes are copied into a per-socket send buffer", "Segmentation offload lets the NIC split big buffers in hardware", "From here the app simply waits — everything below is the OS"] },
  { key: "dns", accent: C.brand, layer: "Resolution · DNS", title: "Turn the name into a number", dek: "The network routes to IP addresses, not names. Your device checks its caches (app → OS → router), then asks a recursive resolver, which walks root → .com → YouTube's authoritative servers for an address. Often cached, under a millisecond.", facts: ["www.youtube.com → 142.250.72.14", "resolver → root → TLD → authoritative", "cached by TTL (seconds–days)"], deep: ["Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail)", "13 logical root-server groups, anycast to thousands of machines", "Queries ride UDP port 53 — or encrypted DoH / DoT", "The resolver caches the answer for its TTL", "Without DNS you could only reach raw IPs"] },
  { key: "encap", accent: C.brand2, layer: "The stack · encapsulation", title: "Wrapping it into packets", dek: "The request never travels bare. Each layer adds its own header — HTTP inside a TLS record inside a TCP segment inside an IP packet inside an Ethernet/Wi-Fi frame — like nested envelopes. Anything larger than the link limit (MTU ≈ 1500 bytes) is split.", facts: ["HTTP → TLS → TCP → IP → frame", "Each layer adds a header", "MTU ≈ 1500 B → split into packets"], deep: ["TCP header: source+dest ports, seq / ack, flags, window", "IP header: source+dest IP, TTL, protocol", "Frame header: source+dest MAC + checksum", "~40–60 bytes of header overhead per packet", "The receiver unwraps them in reverse order"] },
  { key: "wifi", accent: C.brand, layer: "Physical · Wi-Fi", title: "Laptop → router, over the air", dek: "With no cable, your laptop modulates the bits onto a 5 GHz carrier (OFDM), encrypts the frame with WPA2/3, waits for a clear moment (CSMA/CA), and transmits to the router's antenna a few meters away.", facts: ["Bits → OFDM radio (2.4 / 5 / 6 GHz)", "Encrypted with WPA2 / WPA3", "MAC addresses identify devices"], deep: ["Wi-Fi is half-duplex — devices take turns (CSMA/CA)", "Channels span 20–160 MHz; wider = faster", "Distance and walls weaken signal → lower speed", "Frames carry source+dest MAC, not IP", "Interference forces retransmits"] },
  { key: "arp", accent: C.brand2, layer: "Local · ARP", title: "Who is the router?", dek: "To hand the frame to the router, your laptop needs its hardware (MAC) address, not just its IP. It broadcasts an ARP request — 'who has 192.168.1.1?' — the router replies with its MAC, and the frame can be addressed to the gateway.", facts: ["ARP maps IP → MAC", "Broadcast 'who has …?'", "Router replies with its MAC"], deep: ["A MAC is a 48-bit hardware address (AA:BB:CC:DD:EE:FF)", "Answers are cached in an ARP table", "Only used within the local network segment", "IP stays fixed end-to-end; the MAC changes each hop", "Every hop re-addresses the frame to the next device"] },
  { key: "router", accent: C.brand, layer: "Home network · NAT", title: "The router rewrites your address", dek: "Your router leased your laptop a private IP (DHCP). Since the whole house shares one public IP, it rewrites the packet's private source address+port to the public one (NAT), records the mapping so replies find their way back, and checks its firewall.", facts: ["Private 192.168.1.42 → public IP", "NAT table tracks the mapping", "Firewall + DHCP lease"], deep: ["NAT rewrites source IP:port and remembers it", "Replies are matched back to the right device by port", "Private ranges: 10.x, 172.16–31.x, 192.168.x", "This is why inbound connections need port-forwarding", "IPv6 often skips NAT — there are enough addresses"] },
  { key: "modem", accent: C.brand2, layer: "The last mile", title: "Out of the house", dek: "The router hands the packet to the modem/ONT, which modulates it onto your ISP's medium — coax (DOCSIS) or fiber (GPON) — and carries it over the 'last mile' to the ISP's local equipment.", facts: ["Cable → DOCSIS", "Fiber → GPON / ONT", "The local loop to the ISP"], deep: ["DOCSIS shares coax bandwidth across a neighborhood", "GPON splits one fiber to ~32–64 homes", "The modem does the digital↔line coding", "Often the slowest, most contended hop", "Upstream is usually slower than downstream"] },
  { key: "isp", accent: C.brand, layer: "Network · IP routing", title: "Onto the internet", dek: "Now on the public internet, each router reads the destination IP and forwards toward it using its routing table (longest-prefix match), decrementing the TTL each hop so lost packets eventually die. Between networks, BGP chooses the path.", facts: ["Longest-prefix match on dest IP", "TTL −1 per hop (dies at 0)", "BGP routes between networks (AS)"], deep: ["Routers only know the next hop, not the whole path", "A traceroute reveals the hops — usually 10–20", "TTL starts at 64/128; TTL=0 → 'time exceeded'", "BGP advertises which network can reach which IP blocks", "Paths can even change mid-connection"] },
  { key: "queue", accent: C.amber, layer: "Network · switching", title: "Packets wait in line", dek: "Links are shared, so packets pile into router buffers and are sent in turn. If a buffer fills, packets get dropped — TCP notices the missing acknowledgement, resends, and slows down (congestion control) to ease the jam.", facts: ["Store-and-forward queues", "Full buffer → packet dropped", "TCP resends + backs off"], deep: ["Latency = propagation + queueing + processing", "Congestion control: slow-start, then AIMD", "QoS can prioritize traffic (e.g. voice/video)", "'Bufferbloat' = oversized queues that add lag", "Out-of-order arrivals are reordered by sequence number"] },
  { key: "backbone", accent: C.brand2, layer: "Interconnect", title: "Where networks meet", dek: "No one owns the internet. At internet exchange points (IXPs) independent networks peer — handing each other traffic — and it rides high-capacity backbone fiber through carrier-grade routers toward the destination's region.", facts: ["IXPs peer networks directly", "Transit vs. peering agreements", "Backbone = multi-Tbit/s fiber"], deep: ["Peering is often settlement-free; transit is paid", "Google runs one of the largest private backbones on Earth", "A single backbone link can carry many Tbit/s", "BGP selects among multiple available paths", "This stretch is the 'middle mile'"] },
  { key: "fiber", accent: C.sky, layer: "Physical · optics", title: "Across the ocean, on light", dek: "To cross a sea, bits become pulses of laser light in a glass fiber on the ocean floor. The light stays in by total internal reflection; dozens of wavelengths carry separate streams at once (DWDM); optical amplifiers re-boost it every ~50–100 km.", facts: ["Electron → photon (laser diode)", "DWDM: many wavelengths per fiber", "~200,000 km/s · terabits/s"], deep: ["Total internal reflection traps the light in the core", "The core is ~9 µm across — thinner than a hair", "EDFA amplifiers boost light without converting to electrons", "Subsea cables carry ~99% of intercontinental traffic", "Light in glass is ~31% slower than in a vacuum"] },
  { key: "cdn", accent: C.brand, layer: "Edge · CDN", title: "The nearest copy answers", dek: "Popular videos are cached at edge locations worldwide — YouTube even places caches inside ISPs (Google Global Cache). One 'anycast' IP is announced from many cities, so routing naturally sends you to the closest point of presence — which may serve the video without ever reaching the origin.", facts: ["Anycast: one IP, many locations", "Routed to the nearest PoP", "Cache hit → no trip to origin"], deep: ["A cache hit shaves hundreds of milliseconds", "TLS is often terminated at the edge", "A miss → the edge fetches from origin, then caches it", "CDNs also absorb traffic spikes and DDoS attacks", "Static assets — video, images, JS — love CDNs"] },
  { key: "datacenter", accent: C.brand2, layer: "Destination · fabric", title: "Into Google's data center", dek: "At the destination a load balancer sits in front of a fleet of identical servers on a fast internal (spine-leaf) network. It health-checks them and picks one to handle you, spreading millions of requests across the fleet.", facts: ["L4 / L7 load balancer", "Spine-leaf internal fabric", "Picks 1 of N healthy servers"], deep: ["L4 balances by IP:port; L7 can route by URL / path", "Unhealthy servers are pulled from rotation", "Sticky sessions can pin you to one server", "Internal links are often 25–400 Gbit/s", "Redundancy at every layer — no single point of failure"] },
  { key: "tcp", accent: C.sky, layer: "Transport · TCP", title: "The three-way handshake", dek: "Before real data, your device and the chosen server open a reliable channel: SYN, SYN-ACK, ACK. They agree on starting sequence numbers, max segment size, and window — one full round trip before a single byte of the request is sent.", facts: ["SYN → SYN-ACK → ACK", "Syncs sequence numbers", "Costs one round-trip (RTT)"], deep: ["Ports: your ephemeral port → 443 (HTTPS)", "Every segment is acknowledged; unacked → resent", "Window size controls how much is in flight at once", "Sequence numbers let the receiver reorder segments", "QUIC (HTTP/3) folds this into fewer round-trips — YouTube uses it"] },
  { key: "tls", accent: C.brand2, layer: "Security · TLS", title: "Locking the channel", dek: "Over the open channel, TLS negotiates encryption: the client offers ciphers (ClientHello + SNI: www.youtube.com), the server sends its certificate, both derive a shared key (ECDHE), and everything after is AES ciphertext. The client verifies the cert chains to a trusted authority.", facts: ["Certificate verified against a CA", "Key exchange: ECDHE (forward secrecy)", "Payload → AES-encrypted"], deep: ["TLS 1.3 handshakes in 1-RTT (0-RTT on resume)", "SNI tells the server which site you want", "The certificate proves the server owns the domain", "Session keys are per-connection (forward secrecy)", "Only now is the actual GET sent — encrypted"] },
  { key: "micro", accent: C.brand, layer: "Backend · microservices", title: "One request becomes many", dek: "Your single request rarely stays single. An API gateway fans it out to internal microservices — auth verifies your session, one service loads the player config, another the video metadata, another your recommendations — all in parallel over the data center's internal network, each in microseconds.", facts: ["Gateway → auth · player · meta · recs", "gRPC / REST over the internal fabric", "Parallel calls, merged into one response"], deep: ["Internal round-trips run ~50–500 µs, not milliseconds", "Timeouts, retries and circuit breakers guard every call", "A trace ID follows the request through every service", "One user request can spawn dozens of internal ones", "Your response time = the slowest dependency's time"] },
  { key: "server", accent: C.amber, layer: "Compute · silicon", title: "The server thinks", dek: "The NIC copies the packet into memory (DMA) and interrupts the CPU — billions of transistors switching. The app decrypts, parses the request, authenticates you, and runs its logic, all in microseconds to a few milliseconds.", facts: ["NIC → DMA → CPU interrupt", "Transistors switch ~billions/s", "Decrypt → parse → auth → logic"], deep: ["A transistor is a voltage-controlled switch — one bit", "Logic gates (AND/OR/NOT) are built from switches", "A CPU runs billions of instructions/sec across cores", "Caches (L1/L2/L3) hide slow main memory", "The OS schedules this among thousands of requests"] },
  { key: "database", accent: C.brand2, layer: "Data · storage", title: "Fetch the actual video", dek: "The app asks the storage layer for what you requested. It uses indexes to find records fast, checks an in-memory cache first, and only reads SSD/NVMe storage if needed. The bytes of your video come back to the app.", facts: ["Indexed lookup, not a full scan", "In-memory cache → else SSD/NVMe", "Video lives in object storage"], deep: ["An index is a sorted B-tree → O(log n) lookups", "RAM hit ≈ microseconds · SSD ≈ 100 µs · HDD ≈ 10 ms", "Big media lives in object storage + CDN", "Replicas spread reads; writes go to a primary", "The bytes are assembled into the response body"] },
  { key: "ret", accent: C.brand, layer: "Response · return", title: "…and all the way back", dek: "The server compresses the response, stamps status 200 and headers, and streams it back — retracing every hop in reverse. Your device acknowledges each segment, reassembles them in order, and decrypts the payload.", facts: ["200 OK + headers + body", "Compressed (gzip / brotli)", "Same path, reversed & ACKed"], deep: ["Responses can be chunked / streamed as they're produced", "TCP ACKs confirm receipt; losses trigger a resend", "Out-of-order segments buffer until complete", "Video streams in adaptive chunks (DASH / HLS)", "Keep-alive reuses the connection for the next chunk"] },
  { key: "render", accent: C.sky, layer: "Display · decode", title: "Bits become a picture", dek: "Finally the bits are decoded — the codec (VP9 / AV1) turns compressed frames back into pixels, the GPU composites them, and the display lights up. What left as a click a tenth of a second ago is now a video playing on your screen.", facts: ["Bits → codec decode → pixels", "GPU composites the frame", "Round trip ~50–250 ms"], deep: ["Video decodes on dedicated hardware blocks", "Frames buffer briefly to smooth playback (jitter buffer)", "Adaptive bitrate picks quality from your bandwidth", "The display refreshes 60–120 times per second", "You perceive it as instant — the whole trip < 0.25 s"] },
];

/* running clock + location per stop */
const META: Record<string, [string, string]> = {
  tap: ["t + 0 ms", "your desk"], request: ["t + 1 ms", "the browser"], device: ["t + 1 ms", "RAM"],
  kernel: ["t + 2 ms", "the OS kernel"], dns: ["t + 3 ms", "resolver (usually cached)"], encap: ["t + 3 ms", "the network stack"],
  wifi: ["t + 5 ms", "the air · ~5 m"], arp: ["t + 5 ms", "local segment (cached)"], router: ["t + 6 ms", "the hallway closet"],
  modem: ["t + 8 ms", "the last mile"], isp: ["t + 12 ms", "metro network"], queue: ["t + 14 ms", "a router buffer"],
  backbone: ["t + 18 ms", "long-haul fiber"], fiber: ["t + 45 ms", "ocean floor · −4,000 m"], cdn: ["t + 48 ms", "a Google edge PoP"],
  datacenter: ["t + 50 ms", "a server hall"], tcp: ["t + 75 ms", "both ends of the wire"], tls: ["t + 100 ms", "both ends, in secret"],
  micro: ["t + 102 ms", "the service mesh"], server: ["t + 104 ms", "one CPU core"], database: ["t + 106 ms", "RAM · NVMe"],
  ret: ["t + 155 ms", "every hop, in reverse"], render: ["t ≈ 180 ms", "your screen"],
};

/* node names: canvas label · panel title */
const SHORT: Record<string, string> = {
  tap: "Click", request: "Browser", device: "Encoder", kernel: "OS kernel", dns: "DNS",
  encap: "Net stack", wifi: "Wi-Fi", arp: "LAN", router: "Router", modem: "Modem", isp: "ISP",
  queue: "Buffers", backbone: "IXP", fiber: "Subsea fiber", cdn: "Edge cache", datacenter: "Data center",
  tcp: "TCP", tls: "TLS", micro: "Gateway", server: "Server", database: "Storage", ret: "Return", render: "Screen",
};
const NAME: Record<string, string> = {
  tap: "Your mouse", request: "The browser — youtube.com", device: "Encoder — bytes & bits", kernel: "Operating system kernel",
  dns: "DNS resolver", encap: "Network stack", wifi: "Wi-Fi radio", arp: "Local network (LAN)", router: "Home router",
  modem: "Modem / ONT", isp: "ISP network", queue: "Router buffers", backbone: "Internet backbone · IXP",
  fiber: "Subsea fiber cable", cdn: "YouTube edge cache", datacenter: "Google data center", tcp: "TCP handshake",
  tls: "TLS encryption", micro: "API gateway · microservices", server: "The server", database: "Storage · database",
  ret: "The return path", render: "Your screen",
};

/* what each node sends onward: [edge visual, edge caption, panel label] */
const FLOW: Record<string, [string, string, string]> = {
  tap: ["waves", "2.4 GHz radio waves", "HID report · 2.4 GHz radio or USB"],
  request: ["bytes", "bytes in RAM", "HTTP request · still plain text"],
  device: ["bits", "bits · 0s and 1s", "send() — bits cross into the kernel"],
  kernel: ["box", "DNS query · UDP", "DNS lookup first · 'www.youtube.com ?'"],
  dns: ["box", "resolved IP · A record", "→ 142.250.72.14 — now routable"],
  encap: ["box", "packets · ≤1500 B", "packets · ≤ 1,500 bytes each"],
  wifi: ["waves", "5 GHz Wi-Fi waves", "radio waves · 5 GHz OFDM · WPA3"],
  arp: ["waves", "LAN frame → router MAC", "frame addressed to the router's MAC"],
  router: ["electric", "electric pulses · Ethernet", "source rewritten → your public IP"],
  modem: ["electric", "modulated signal · coax / fiber", "line signal · DOCSIS / GPON"],
  isp: ["box", "IP packets · hop by hop", "forwarded hop by hop · TTL −1"],
  queue: ["box", "queued packets", "buffered in line, then forwarded"],
  backbone: ["box", "peering hand-off", "handed between networks at the IXP"],
  fiber: ["light", "laser light · DWDM", "photons · DWDM wavelengths · 200,000 km/s"],
  cdn: ["box", "anycast route", "cache miss → onward to origin"],
  datacenter: ["box", "to the picked server", "health-checked pick of the fleet"],
  tcp: ["syn", "SYN ⇄ ACK segments", "reliable channel open · 1 RTT"],
  tls: ["cipher", "AES ciphertext", "AES ciphertext — middlemen see noise"],
  micro: ["fan", "parallel gRPC calls", "parallel internal RPCs · µs each"],
  server: ["text", "SQL query", "indexed query to the data layer"],
  database: ["rows", "result rows · bytes", "result rows — the video's bytes"],
  ret: ["resp", "200 OK · packet stream", "200 OK · thousands of packets, path reversed"],
  render: ["resp", "× 8,000,000,000 people", "× 8,000,000,000 people"],
};

/* ── the packet strip: what the message looks like at each node ───────────── */
const L = { eth: "#64748b", ip: "#d97706", tcp: "#0ea5e9", tls: "#7c3aed", http: "#2f66e0", pay: "#db2777", raw: "#5a6b88" };
type Seg = { n: string; c: string; b: number; scramble?: boolean; rgb?: boolean };
const full = (ip = "IP", http = "HTTP"): Seg[] => [
  { n: "frame", c: L.eth, b: 2 }, { n: ip, c: L.ip, b: 3 }, { n: "TCP", c: L.tcp, b: 3 }, { n: "TLS", c: L.tls, b: 2 }, { n: http, c: L.http, b: 5 },
];
const PACKET: Record<string, { segs: Seg[]; note: string }> = {
  tap: { segs: [{ n: "HID report", c: L.raw, b: 6 }], note: "6 bytes of button + position state — not a network packet yet" },
  request: { segs: [{ n: "HTTP · plain text", c: L.http, b: 14 }], note: "GET /watch?v=dQw4w9WgXcQ — headed for www.youtube.com" },
  device: { segs: [{ n: "UTF-8 bytes", c: L.http, b: 14 }], note: "'G' = 0x47 · 'E' = 0x45 · 'T' = 0x54 — every character is just a number" },
  kernel: { segs: [{ n: "HTTP payload", c: L.http, b: 12 }], note: "parked in the kernel's socket send buffer, waiting for the stack" },
  dns: { segs: [{ n: "frame", c: L.eth, b: 2 }, { n: "IP", c: L.ip, b: 3 }, { n: "UDP :53", c: L.tcp, b: 2 }, { n: "DNS query", c: L.http, b: 6 }], note: "a tiny side-quest packet first: 'www.youtube.com — A record?'" },
  encap: { segs: full(), note: "the full stack — five envelopes, ~40–60 bytes of headers around your ask" },
  wifi: { segs: full(), note: "same bytes, now modulated onto a 5 GHz carrier — the packet is radio" },
  arp: { segs: [{ n: "frame · broadcast", c: L.eth, b: 3 }, { n: "ARP", c: L.ip, b: 5 }], note: "'who has 192.168.1.1?' — shouted to everyone on the LAN" },
  router: { segs: full("IP · NAT ✎"), note: "source rewritten: 192.168.1.42:52831 → your one public IP. The router remembers." },
  modem: { segs: full(), note: "same packet, line-coded for coax or fiber — leaving the house" },
  isp: { segs: full("IP · TTL−1"), note: "each router touches only the IP header: read destination, decrement TTL, forward" },
  queue: { segs: full(), note: "parked in a router buffer behind strangers' packets — this is where latency lives" },
  backbone: { segs: full(), note: "riding a 100+ Gbit/s wavelength with millions of other people's packets" },
  fiber: { segs: full(), note: "right now these bytes are photons — 200,000 km/s under the ocean" },
  cdn: { segs: full(), note: "anycast routing delivered it to the nearest of hundreds of edge cities" },
  datacenter: { segs: full(), note: "the load balancer reads only IP + TCP — it never sees your payload" },
  tcp: { segs: [{ n: "frame", c: L.eth, b: 2 }, { n: "IP", c: L.ip, b: 3 }, { n: "TCP · SYN", c: L.tcp, b: 6 }], note: "no payload at all — just flags, sequence numbers and a window size" },
  tls: { segs: [{ n: "frame", c: L.eth, b: 2 }, { n: "IP", c: L.ip, b: 3 }, { n: "TCP", c: L.tcp, b: 3 }, { n: "AES ciphertext 🔒", c: L.tls, b: 9, scramble: true }], note: "from here on, every middleman sees only noise" },
  micro: { segs: [{ n: "gRPC · internal", c: L.http, b: 12 }], note: "re-packaged for the data center's own network — one request becomes many" },
  server: { segs: [{ n: "decrypted HTTP", c: L.http, b: 12 }], note: "plaintext again — but only inside this one machine's RAM" },
  database: { segs: [{ n: "rows · bytes", c: L.pay, b: 12 }], note: "the video's bytes, found by a B-tree index in O(log n)" },
  ret: { segs: [{ n: "frame", c: L.eth, b: 2 }, { n: "IP", c: L.ip, b: 3 }, { n: "TCP", c: L.tcp, b: 3 }, { n: "200 OK 🔒", c: L.tls, b: 9, scramble: true }], note: "the same journey in reverse — except now it's thousands of packets" },
  render: { segs: [{ n: "pixels", c: L.pay, b: 14, rgb: true }], note: "no longer a packet at all — light, leaving your screen" },
};

function PacketStrip({ st }: { st: string }) {
  const p = PACKET[st];
  if (!p) return null;
  let seed = 0;
  for (let i = 0; i < st.length; i++) seed += st.charCodeAt(i);
  let byteIdx = 0;
  return (
    <div className="mt-4">
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max items-start gap-2.5">
          {p.segs.map((s, si) => (
            <div key={si} className="shrink-0">
              <div className={`flex gap-[3px] rounded-md border p-[3px] ${s.scramble ? "animate-pulse" : ""}`} style={{ borderColor: hexA(s.c, 0.4), background: hexA(s.c, 0.04) }}>
                {Array.from({ length: s.b }).map((_, i) => {
                  const k = seed * 7 + si * 31 + byteIdx++;
                  return s.rgb ? (
                    <span key={i} className="h-7 w-[22px] rounded-[3px]" style={{ background: `hsl(${(k * 53) % 360} 68% 58%)` }} />
                  ) : (
                    <span key={i} className="flex h-7 w-[22px] items-center justify-center rounded-[3px] font-mono text-[9px] font-semibold" style={{ background: hexA(s.c, 0.1), color: s.c }}>
                      {hx(k)}{hx(k + 0.5)}
                    </span>
                  );
                })}
              </div>
              <div className="mt-1 text-center font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: s.c }}>{s.n}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted">▍{p.note}</p>
    </div>
  );
}

/* ── the scale epilogue (the ∞ node's panel) ──────────────────────────────── */
function CountUp({ to, suffix = "", duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(to) + suffix; return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const start = performance.now();
      const step = (now: number) => { const p = Math.min(1, (now - start) / duration); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))) + suffix; if (p < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, suffix, duration]);
  return <span ref={ref} className="tabular-nums">0{suffix}</span>;
}

const SCALE_TILES: [string, number, string][] = [
  ["one minute of scrolling", 250, "every tap, thumbnail and beacon — each one makes the full trip around this ring"],
  ["one hour online", 15000, "video chunks every few seconds, autosaves, analytics, keep-alives"],
  ["one ordinary day", 120000, "across your phone, laptop and TV — most of it silent background sync"],
];

function ScaleFinale() {
  return (
    <div>
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-brand-2">epilogue · the scale</div>
      <h3 className="mt-2 text-2xl font-bold leading-tight text-text" style={{ textWrap: "balance" } as React.CSSProperties}>
        Can you imagine the scale?
      </h3>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
        Everything in this ring — the handshakes, the ocean floor, the transistors — was{" "}
        <span className="font-semibold text-text">one</span> click. Now imagine just you:
      </p>
      <div className="mt-5 grid gap-3">
        {SCALE_TILES.map(([label, n, sub]) => (
          <div key={label} className="rounded-2xl border border-line bg-panel p-4 card-shadow">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold text-text"><CountUp to={n} suffix="+" /> <span className="font-mono text-[11px] font-semibold text-brand-2">requests</span></div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl border border-line bg-panel-2/60 p-5 text-center card-shadow">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">now multiply by</div>
        <div className="brand-text mt-1.5 text-3xl font-bold"><CountUp to={8000000000} duration={2400} /></div>
        <div className="mt-1 text-xs text-muted">people — plus every server, sensor and machine talking to each other</div>
        <p className="mt-3.5 text-sm leading-relaxed text-text">
          <span className="font-semibold">Trillions</span> of journeys exactly like this one, every single day —
          each finishing in about a tenth of a second, and almost none of them ever noticed.
        </p>
      </div>
      <div className="mt-5 rounded-2xl border-2 border-brand/25 bg-panel p-6 text-center card-shadow">
        <p className="font-mono text-xs text-muted">Can you imagine the scale? I can&apos;t.</p>
        <p className="mt-3 text-lg font-bold leading-snug text-text" style={{ textWrap: "balance" } as React.CSSProperties}>
          We as humans built something very incredible.
        </p>
        <p className="brand-text mt-1.5 text-lg font-bold">Let&apos;s not hand it over to AI.</p>
      </div>
    </div>
  );
}

/* ── the ring graph ───────────────────────────────────────────────────────── */
type GNode = { key: string; name: string; accent: string };
const GRAPH: GNode[] = [
  ...STATIONS.map((s) => ({ key: s.key, name: SHORT[s.key] ?? s.title, accent: s.accent })),
  { key: "scale", name: "the scale ∞", accent: C.brand2 },
];
const SCALE_I = GRAPH.length - 1;

type P = { x: number; y: number };
const qp = (a: P, cp: P, b: P, u: number): P => ({
  x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cp.x + u * u * b.x,
  y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cp.y + u * u * b.y,
});

export default function RequestJourneyConstellation({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<P[]>([]);
  const hoverRef = useRef<number>(-1);
  const selRef = useRef<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => { selRef.current = sel; }, [sel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (selRef.current !== null) setSel(null); else onClose(); }
      if (e.key === "ArrowRight" && selRef.current !== null) setSel(Math.min(GRAPH.length - 1, selRef.current + 1));
      if (e.key === "ArrowLeft" && selRef.current !== null) setSel(Math.max(0, selRef.current - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, W = 0, H = 0, ccx = 0, ccy = 0;
    const start = performance.now();
    const N = GRAPH.length;
    const RING = N - 1; // 23 nodes on the ring; the ∞ node sits in the center

    /* ring layout: even arc-length spacing on an ellipse, starting at the top */
    const layout = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); W = r.width; H = r.height;
      ccx = W / 2; ccy = H / 2 + 8;
      const rx = Math.max(110, W / 2 - (W < 640 ? 62 : 130));
      const ry = Math.max(120, H / 2 - 64);
      /* sample the ellipse, then place nodes at equal arc lengths */
      const S = 720; const sx: number[] = [], sy: number[] = [], cl: number[] = [0];
      for (let k = 0; k <= S; k++) {
        const a = -Math.PI / 2 + (k / S) * TAU;
        sx.push(ccx + Math.cos(a) * rx); sy.push(ccy + Math.sin(a) * ry);
        if (k) cl.push(cl[k - 1] + Math.hypot(sx[k] - sx[k - 1], sy[k] - sy[k - 1]));
      }
      const total = cl[S];
      const at = (d: number): P => {
        let lo = 0, hi = S;
        while (lo < hi) { const m = (lo + hi) >> 1; if (cl[m] < d) lo = m + 1; else hi = m; }
        return { x: sx[lo], y: sy[lo] };
      };
      posRef.current = GRAPH.map((_, i) => {
        if (i === SCALE_I) return { x: ccx, y: ccy };
        const p = at((total * i) / RING);
        return { x: p.x + (rnd(i * 3 + 1) - 0.5) * 10, y: p.y + (rnd(i * 7 + 2) - 0.5) * 10 };
      });
    };

    const drift = (p: P, i: number, t: number): P =>
      i === SCALE_I ? p : { x: p.x + Math.sin(t * 0.5 + i * 1.7) * 3, y: p.y + Math.cos(t * 0.42 + i * 2.3) * 3 };
    const ctrl = (a: P, b: P, i: number): P => {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (i === RING - 1) return { x: mx, y: my }; // the edge into the center stays straight
      /* bow the ring edges gently outward from the center */
      const dx = mx - ccx, dy = my - ccy; const len = Math.hypot(dx, dy) || 1;
      return { x: mx + (dx / len) * 16, y: my + (dy / len) * 16 };
    };
    const nodeAt = (x: number, y: number) => {
      const t = reduce ? 0 : (performance.now() - start) / 1000;
      for (let i = 0; i < N; i++) {
        const p = drift(posRef.current[i], i, t);
        if (Math.hypot(p.x - x, p.y - y) < (i === SCALE_I ? 30 : 21)) return i;
      }
      return -1;
    };

    const paint = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const selN = selRef.current, hov = hoverRef.current;
      const pts = posRef.current.map((p, i) => drift(p, i, t));
      const lit = (i: number) => selN === null || i === selN || i === selN - 1 || i === selN + 1;
      const comet = (t / 1.35) % (N - 1);
      const ce = Math.floor(comet), cu = comet - ce;

      /* edges */
      for (let i = 0; i < N - 1; i++) {
        const a = pts[i], b = pts[i + 1], cp = ctrl(a, b, i);
        const on = selN === null || i === selN || i === selN - 1;
        ctx.strokeStyle = hexA(C.muted, 0.26 * (on ? 1 : 0.18)); ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cp.x, cp.y, b.x, b.y); ctx.stroke();
        if (!on) continue;

        const A = GRAPH[i + 1].accent;
        const [kind, caption] = FLOW[GRAPH[i].key] ?? ["box", ""];
        const dir = Math.atan2(b.y - a.y, b.x - a.x);
        const seg = (u: number) => qp(a, cp, b, u);
        const g = (x: number, y: number, r: number, col: string, gl = 8) => { ctx.shadowColor = col; ctx.shadowBlur = gl; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; };

        /* caption: what this edge carries — set just outside the ring */
        if (caption && W >= 640) {
          const mc = seg(0.5);
          const dx = mc.x - ccx, dy = mc.y - ccy; const len = Math.hypot(dx, dy) || 1;
          const lx = mc.x + (dx / len) * 20, ly = mc.y + (dy / len) * 20;
          ctx.font = `600 8.5px ${MONO}`; ctx.textBaseline = "middle";
          ctx.textAlign = dx / len > 0.35 ? "left" : dx / len < -0.35 ? "right" : "center";
          ctx.fillStyle = hexA(C.muted, 0.75);
          ctx.fillText(caption, lx, ly);
          ctx.textAlign = "center";
        }

        if (kind === "waves") {
          for (let k = 0; k < 3; k++) {
            const u = (t * 0.32 + k / 3) % 1;
            const p = seg(u);
            const fade = 0.25 + 0.65 * Math.sin(u * Math.PI);
            ctx.strokeStyle = hexA(A, fade); ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(p.x - Math.cos(dir) * 3, p.y - Math.sin(dir) * 3, 7, dir - 1.05, dir + 1.05); ctx.stroke();
            ctx.beginPath(); ctx.arc(p.x - Math.cos(dir) * 9, p.y - Math.sin(dir) * 9, 4.5, dir - 1.05, dir + 1.05); ctx.stroke();
          }
        } else if (kind === "bytes") {
          const u = (t * 0.45) % 1;
          for (let k = 0; k < 4; k++) {
            const uu = u - k * 0.055; if (uu < 0 || uu > 1) continue;
            const p = seg(uu);
            ctx.fillStyle = hexA(A, 0.9 - k * 0.18);
            ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
          }
        } else if (kind === "bits") {
          for (let k = 0; k < 4; k++) {
            const p = seg((t * (0.35 + rnd(k) * 0.12) + rnd(k * 3)) % 1);
            ctx.fillStyle = hexA(A, 0.9); ctx.textBaseline = "middle";
            ctx.font = `700 9px ${MONO}`;
            ctx.fillText(rnd(k + Math.floor(t * 3)) > 0.5 ? "1" : "0", p.x, p.y);
          }
        } else if (kind === "text") {
          const p = seg((t * 0.4) % 1);
          ctx.fillStyle = hexA(A, 0.95); ctx.textBaseline = "middle";
          ctx.font = `700 8.5px ${MONO}`;
          ctx.fillText("SELECT …", p.x, p.y);
        } else if (kind === "rows") {
          const p = seg((t * 0.42) % 1);
          for (let k = 0; k < 3; k++) { ctx.fillStyle = hexA(A, 0.4 + k * 0.25); ctx.fillRect(p.x - 8, p.y - 5 + k * 4, 16, 2.5); }
        } else if (kind === "light") {
          [C.sky, C.brand, "#22c3a6", C.brand3].forEach((col, k) => { const p = seg((t * (0.55 + k * 0.06) + k * 0.24) % 1); g(p.x, p.y, 2.6, col, 12); });
        } else if (kind === "electric") {
          ctx.strokeStyle = hexA(A, 0.8); ctx.lineWidth = 1.8; ctx.beginPath();
          for (let k = 0; k <= 26; k++) {
            const u = k / 26; const p = seg(u);
            const off = Math.sin(u * 12 - t * 6) * 4;
            const px = p.x + Math.cos(dir + Math.PI / 2) * off, py = p.y + Math.sin(dir + Math.PI / 2) * off;
            if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.stroke();
        } else if (kind === "cipher") {
          for (let k = 0; k < 3; k++) {
            const p = seg((t * 0.35 + k * 0.33) % 1);
            ctx.fillStyle = hexA(C.violet, 0.9); ctx.textBaseline = "middle";
            ctx.font = `600 9px ${MONO}`;
            ctx.fillText(`${hx(k + Math.floor(t * 5))}${hx(k * 7 + Math.floor(t * 5))}`, p.x, p.y);
          }
        } else if (kind === "syn") {
          const p1 = seg((t * 0.5) % 1); g(p1.x, p1.y, 3, C.sky, 8);
          const p2 = seg(1 - ((t * 0.5 + 0.5) % 1)); g(p2.x, p2.y, 3, C.brand, 8);
        } else if (kind === "fan") {
          for (let k = -1; k <= 1; k++) {
            const p = seg((t * 0.5 + (k + 1) * 0.3) % 1);
            g(p.x + Math.cos(dir + Math.PI / 2) * k * 6, p.y + Math.sin(dir + Math.PI / 2) * k * 6, 2.5, A, 8);
          }
        } else if (kind === "resp") {
          for (let k = 0; k < 5; k++) { const p = seg((t * (0.7 + rnd(k) * 0.25) + rnd(k * 3)) % 1); g(p.x, p.y, 2.2, k % 2 ? A : C.sky, 8); }
        } else {
          /* "box" — a little packet envelope (headers wrapped around payload) */
          for (let k = 0; k < 2; k++) {
            const p = seg((t * 0.42 + k * 0.5) % 1);
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(dir);
            ctx.shadowColor = A; ctx.shadowBlur = k ? 0 : 8;
            ctx.fillStyle = hexA(A, k ? 0.14 : 0.2); ctx.strokeStyle = hexA(A, k ? 0.55 : 0.95); ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.rect(-7, -4.5, 14, 9); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-7, -4.5); ctx.lineTo(0, 1.5); ctx.lineTo(7, -4.5); ctx.stroke();
            ctx.shadowBlur = 0; ctx.restore();
          }
        }
      }

      /* the journey comet — your click, forever making the round trip */
      if (!reduce) {
        const a = pts[ce], b = pts[ce + 1], cp = ctrl(a, b, ce);
        const p = qp(a, cp, b, cu);
        ctx.shadowColor = C.brand2; ctx.shadowBlur = 18; ctx.fillStyle = C.brand2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        if (cu < 0.22) { const r2 = 14 + cu * 60; ctx.strokeStyle = hexA(C.brand2, 0.45 * (1 - cu / 0.22)); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(a.x, a.y, r2, 0, TAU); ctx.stroke(); }
      }

      /* ring nodes + labels */
      for (let i = 0; i < RING; i++) {
        const p = pts[i]; const n = GRAPH[i];
        const active = i === selN || i === hov;
        const alpha = lit(i) ? 1 : 0.3;
        const r = active ? 15 : 12;
        if (active || i === ce) { ctx.shadowColor = n.accent; ctx.shadowBlur = 16; }
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = active ? 2.5 : 2; ctx.strokeStyle = hexA(n.accent, alpha); ctx.stroke();
        ctx.fillStyle = hexA(n.accent, alpha); ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `700 ${active ? 10 : 9}px ${MONO}`;
        ctx.fillText(String(i + 1).padStart(2, "0"), p.x, p.y + 0.5);
        /* label sits radially outside the ring */
        const dx = p.x - ccx, dy = p.y - ccy; const len = Math.hypot(dx, dy) || 1;
        const lx = p.x + (dx / len) * (r + 13), ly = p.y + (dy / len) * (r + 13);
        ctx.font = `${active ? 700 : 600} 10px ${MONO}`;
        ctx.fillStyle = active ? n.accent : hexA(C.muted, alpha);
        ctx.textAlign = dx / len > 0.35 ? "left" : dx / len < -0.35 ? "right" : "center";
        ctx.fillText(n.name, lx, ly);
        ctx.textAlign = "center";
      }

      /* the ∞ scale node — the highlighted centerpiece */
      {
        const p = pts[SCALE_I];
        const active = SCALE_I === selN || SCALE_I === hov;
        const pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2);
        ctx.strokeStyle = hexA(C.brand, 0.25 + 0.2 * pulse); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, 34 + pulse * 6, 0, TAU); ctx.stroke();
        ctx.shadowColor = C.brand2; ctx.shadowBlur = active ? 26 : 14 + pulse * 10;
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p.x, p.y, active ? 26 : 24, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        const grad = ctx.createLinearGradient(p.x - 24, p.y - 24, p.x + 24, p.y + 24);
        grad.addColorStop(0, C.brand); grad.addColorStop(1, C.brand2);
        ctx.lineWidth = 2.5; ctx.strokeStyle = grad; ctx.beginPath(); ctx.arc(p.x, p.y, active ? 26 : 24, 0, TAU); ctx.stroke();
        ctx.fillStyle = C.brand2; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `700 19px ${MONO}`; ctx.fillText("∞", p.x, p.y + 1);
        ctx.font = `700 10px ${MONO}`; ctx.fillStyle = C.brand2;
        ctx.fillText("the scale", p.x, p.y + 40);
        ctx.font = `600 8.5px ${MONO}`; ctx.fillStyle = hexA(C.muted, 0.85);
        ctx.fillText("can you imagine it? click me", p.x, p.y + 53);
      }
    };

    let stopped = false;
    const loop = () => { if (stopped) return; paint(reduce ? 1.2 : (performance.now() - start) / 1000); raf = requestAnimationFrame(loop); };
    layout(); loop();

    const onResize = () => layout();
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const i = nodeAt(e.clientX - r.left, e.clientY - r.top);
      hoverRef.current = i;
      canvas.style.cursor = i >= 0 ? "pointer" : "default";
    };
    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const i = nodeAt(e.clientX - r.left, e.clientY - r.top);
      setSel(i >= 0 ? i : null);
    };
    window.addEventListener("resize", onResize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    return () => {
      stopped = true; cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const st = sel !== null && sel < STATIONS.length ? STATIONS[sel] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex flex-col bg-ink" role="dialog" aria-modal="true" aria-label="How the web works — one click on a YouTube video"
    >
      <div className="relative flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-text sm:text-lg">Anatomy of a Request · one YouTube click</h2>
          <p className="truncate text-xs text-muted">23 nodes, there and back — click any node to see what happens there. ← → to walk the ring.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-muted transition hover:border-brand-2/50 hover:text-text">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={wrapRef} className="dot-grid relative flex-1 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {sel === null && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line bg-panel/90 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted backdrop-blur">
            ✦ the blue comet is your click making the round trip
          </div>
        )}

        <AnimatePresence>
          {sel !== null && (
            <motion.aside
              key="panel"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.22 }}
              className="absolute bottom-0 right-0 top-0 w-full overflow-y-auto border-l border-line bg-ink/[0.97] p-5 backdrop-blur sm:w-[440px] sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setSel(Math.max(0, sel - 1))} disabled={sel === 0} aria-label="Previous node" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-muted transition enabled:hover:border-brand-2/50 enabled:hover:text-text disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setSel(Math.min(GRAPH.length - 1, sel + 1))} disabled={sel === GRAPH.length - 1} aria-label="Next node" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-muted transition enabled:hover:border-brand-2/50 enabled:hover:text-text disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => setSel(null)} aria-label="Close panel" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-muted transition hover:border-brand-2/50 hover:text-text">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {st ? (
                <>
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand-2">
                    node {String(sel + 1).padStart(2, "0")}/{STATIONS.length} · {st.layer}
                  </div>
                  <h3 className="mt-1.5 text-2xl font-bold leading-tight text-text" style={{ textWrap: "balance" } as React.CSSProperties}>
                    {NAME[st.key] ?? st.title}
                  </h3>
                  <div className="mt-0.5 text-sm font-semibold" style={{ color: st.accent }}>{st.title}</div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-line bg-panel-2/70 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-brand-2">⏱ {META[st.key]?.[0]}</span>
                    <span className="rounded-full border border-line bg-panel-2/70 px-2.5 py-0.5 font-mono text-[10.5px] text-muted">📍 {META[st.key]?.[1]}</span>
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{st.dek}</p>
                  <PacketStrip st={st.key} />
                  {FLOW[st.key] && (
                    <p className="mt-3 rounded-lg border border-line bg-panel-2/60 px-3 py-2 font-mono text-[11px] text-muted">
                      sends onward ⇢ <span className="font-semibold text-brand-2">{FLOW[st.key][2]}</span>
                    </p>
                  )}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {st.facts.map((f) => (
                      <span key={f} className="rounded-full border border-line bg-panel-2/70 px-2.5 py-1 font-mono text-[11px] text-text">{f}</span>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-line pt-3">
                    <div className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-brand-2">Under the hood</div>
                    <ul className="mt-2 space-y-1.5 border-l-2 border-line pl-3.5">
                      {st.deep.map((d) => (
                        <li key={d} className="text-[12.5px] leading-snug text-muted">{d}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <ScaleFinale />
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
