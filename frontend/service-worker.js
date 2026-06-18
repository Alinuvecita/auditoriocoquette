const CACHE_NAME = "auditorio-uni-cache-v30";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./login.html",
  "./registro.html",
  "./verificar.html",
  "./recuperar.html",
  "./restablecer.html",
  "./eventos.html",
  "./detalle-evento.html",
  "./historial.html",
  "./perfil.html",
  "./admin-eventos.html",
  "./css/styles.css",

  "./js/api.js",
  "./js/main.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
