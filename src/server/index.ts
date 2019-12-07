import express from 'express';

const PORT = process.env.PORT || '3001';

const app = express();

app.get('/', (req, res) => {
  res.send("Hallo");
});

export function run() {
  const port = parseInt(PORT);
  if (isNaN(port)) {
    throw new Error(`Invalid PORT: "${PORT}"`);
  }
  app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
  });
};
