const path = require('path');
const express = require('express');

const port = process.env.PORT || 3000;
const app = express();
app.use(express.static(path.resolve(__dirname, '..', '..')));
app.listen(port, () => {
  console.log('serving mocha tests at http://localhost:%s/test/browser/', port);
});
