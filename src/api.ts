import express from 'express';
import cors from 'cors';

import { scrapePage } from './utils/puppeteer';

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json({type: () => true}));

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

const api = express.Router();

api.get('/hello', (req, res) => {
  res.status(200).send({ message: 'hello world' });
});

api.post('/scrapper', async (req, res) => {
  const {url, format, withReadability, manualSelector} = req.body;
  if (!url) {
    res.status(400).send({message: 'No URL is provided.'});
    return;
  }
  if (!['markdown', 'html', 'text'].includes(format)) {
    res.status(400).send({message: `Invalid format value. It must be one of 'markdown', 'html', 'text'`});
    return;
  }
  const result = await scrapePage(url, format, withReadability, manualSelector);
  res.status(200).send({url, result});
});

// Version the api
app.use('/api/v1', api);
