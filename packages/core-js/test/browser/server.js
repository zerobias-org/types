import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', '..')));
app.listen(port, () => {
  console.log('serving mocha tests at http://localhost:%s/test/browser/', port);
});
