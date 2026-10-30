/* Service worker de Mi Carrera UNQ
   Guarda una copia de la app en el celular para que abra sin internet.
   Cuando publiques una versión nueva, cambiá VERSION para que se actualice. */
const VERSION = "mi-carrera-unq-v1";
const APP = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

// 1) Instalación: descarga y guarda los archivos de la app.
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

// 2) Activación: borra las copias de versiones viejas.
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 3) Cada pedido de archivo:
//    - la página: primero intenta internet (para recibir actualizaciones); si no hay, usa la copia.
//    - el resto (íconos, tipografías): usa la copia; si no la tiene, la baja y la guarda.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
