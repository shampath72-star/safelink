/* SafeLink service worker — shows alert notifications even when the tab is in the background. */
const VERSION = "safelink-sw-1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

/* Tapping a notification brings SafeLink to the front (or opens it). */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});

/* Ready for real Web Push later (Firebase etc.): shows whatever payload arrives, loudly. */
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(
    self.registration.showNotification(d.title || "🆘 SafeLink alert", {
      body: d.body || "Someone needs help — open SafeLink.",
      tag: d.tag || "safelink-sos",
      renotify: true,
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 900],
      data: { url: d.url || "./" },
    })
  );
});
