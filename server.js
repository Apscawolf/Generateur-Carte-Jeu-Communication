// Serveur local sans dépendance : sert atelier-cartes/ et enregistre les images importées
// dans atelier-cartes/uploads/illustrations/. Lancer : node server.js  (puis http://localhost:8000)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "atelier-cartes");
const UPLOADS = path.join(ROOT, "uploads", "illustrations");
const PORT = Number(process.env.PORT) || 8000;
const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif"
};

function send(res, status, body, type) {
	res.writeHead(status, { "Content-Type": type || "text/plain; charset=utf-8", "Cache-Control": "no-store" });
	res.end(body);
}

function upload(req, res) {
	// Refuse les requêtes venant d'un autre site (le serveur n'écoute que sur la machine locale).
	const origin = req.headers.origin;
	if (origin && new URL(origin).host !== req.headers.host) return send(res, 403, "Origine refusée");
	const name = new URL(req.url, "http://x").searchParams.get("name") || "";
	if (!/^[a-z0-9][a-z0-9_-]{0,60}\.(jpg|png|webp)$/.test(name))
		return send(res, 400, "Nom de fichier invalide");
	const chunks = [];
	let size = 0;
	req.on("data", (chunk) => {
		size += chunk.length;
		if (size > MAX_BYTES) {
			send(res, 413, "Image trop volumineuse");
			req.destroy();
		} else chunks.push(chunk);
	});
	req.on("end", () => {
		if (res.writableEnded) return;
		fs.mkdirSync(UPLOADS, { recursive: true });
		fs.writeFile(path.join(UPLOADS, name), Buffer.concat(chunks), (error) => {
			if (error) return send(res, 500, "Écriture impossible");
			send(res, 200, JSON.stringify({ path: `uploads/illustrations/${name}` }), "application/json");
		});
	});
}

http
	.createServer((req, res) => {
		if (req.method === "POST" && req.url.startsWith("/api/upload")) return upload(req, res);
		if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Méthode non autorisée");
		let pathname;
		try {
			pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
		} catch (error) {
			return send(res, 400, "URL invalide");
		}
		const file = path.join(ROOT, pathname.endsWith("/") ? pathname + "index.html" : pathname);
		if (!file.startsWith(ROOT + path.sep)) return send(res, 403, "Accès refusé");
		fs.readFile(file, (error, data) => {
			if (error) return send(res, 404, "Introuvable");
			send(res, 200, data, TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
		});
	})
	.listen(PORT, "127.0.0.1", () => console.log(`Atelier : http://localhost:${PORT}`));
