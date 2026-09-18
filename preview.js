// Dependency-free preview server. Explicit allowlist for public pages and meeting materials.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const files = {
  "/building-scan-mark.svg": ["building-scan-mark.svg", "image/svg+xml"],
  "/": ["index.html", "text/html"],
  "/index.html": ["index.html", "text/html"],
  "/styles.css": ["styles.css", "text/css"],
  "/research.css": ["research.css", "text/css"],
  "/app.js": ["app.js", "application/javascript"],
  "/gallery.js": ["gallery.js", "application/javascript"],
};
for (const page of ["project", "analysis", "roadmap", "meeting"])
  files[`/${page}.html`] = [`${page}.html`, "text/html"];
for (const topic of ["purpose", "strategy", "data", "pipeline", "diagnosis", "questions", "sources"])
  files[`/project-${topic}.html`] = [`project-${topic}.html`, "text/html"];
for (let i = 1; i <= 10; i++) {
  const n = String(i).padStart(2, "0");
  files[`/meeting-materials/${n}.png`] = [
    `meeting-materials/${n}.png`,
    "image/png",
  ];
  files[`/meeting-materials/${n}-thumb.jpg`] = [
    `meeting-materials/${n}-thumb.jpg`,
    "image/jpeg",
  ];
}
files["/meeting-materials/회의자료_10장.zip"] = [
  "meeting-materials/회의자료_10장.zip",
  "application/zip",
];
files["/meeting-materials/manifest.json"] = [
  "meeting-materials/manifest.json",
  "application/json",
];
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }
    const asset = files[pathname];
    if (!asset) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    fs.stat(path.join(__dirname, asset[0]), (error, stat) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const headers = {
        "Content-Type":
          asset[1] +
          (/^(text\/|application\/(javascript|json))/.test(asset[1])
            ? "; charset=utf-8"
            : ""),
        "Content-Length": stat.size,
        "X-Content-Type-Options": "nosniff",
      };
      if (asset[1] === "application/zip")
        headers["Content-Disposition"] =
          "attachment; filename=meeting-materials.zip; filename*=UTF-8''" +
          encodeURIComponent("회의자료_10장.zip");
      res.writeHead(200, headers);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(path.join(__dirname, asset[0]))
        .on("error", () => res.destroy())
        .pipe(res);
    });
  })
  .listen(Number(process.env.PORT) || 4173, "127.0.0.1", () =>
    console.log(
      "BUILDINGSCAN preview: http://127.0.0.1:" + (process.env.PORT || 4173),
    ),
  );
