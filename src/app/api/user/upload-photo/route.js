// import { IncomingForm } from 'formidable';
// import { NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// // Disable Next.js built-in body parsing for this route
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Helper to convert Next.js request to Node.js request
// function toNodeRequest(req) {
//   const headers = {};
//   req.headers.forEach((value, key) => {
//     headers[key] = value;
//   });
//   return {
//     method: req.method,
//     url: req.url,
//     headers,
//     // A ReadableStream that formidable expects
//     on: (event, callback) => {
//       if (event === 'data') {
//         req.body.then((buf) => callback(Buffer.from(buf)));
//       }
//       if (event === 'end') {
//         req.body.then(() => callback());
//       }
//     },
//   };
// }

// export async function POST(req) {
//   const form = new IncomingForm({
//     multiples: false,
//     uploadDir: path.join(process.cwd(), 'public', 'uploads'),
//     keepExtensions: true,
//   });

//   const nodeReq = toNodeRequest(req);

//   return new Promise((resolve, reject) => {
//     form.parse(nodeReq, (err, fields, files) => {
//       if (err) {
//         return resolve(NextResponse.json({ error: err.message }, { status: 500 }));
//       }
//       if (!files.file) {
//         return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
//       }
//       const filename = path.basename(files.file.filepath);
//       resolve(NextResponse.json({ filename }, { status: 200 }));
//     });
//   });
// }
