import { createJsonServer } from "./http.js";
import { handleRoute } from "./routes/index.js";

const port = Number.parseInt(process.env.PORT ?? "4310", 10);
const host = process.env.HOST ?? "127.0.0.1";
const server = createJsonServer(handleRoute);

server.listen(port, host, () => {
  console.log(`TechBrief server listening on http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
