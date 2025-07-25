const { spawn } = require("child_process");
const path = require("path");

const processPath = path.resolve(__dirname, "../rag-backend/faiss_server.py");

const python = spawn("python", [processPath]);

python.stdout.on("data", (data) => console.log(`[FAISS]: ${data}`));
python.stderr.on("data", (data) => console.error(`[FAISS Error]: ${data}`));
