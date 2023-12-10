const express = require('express');
const bodyParser = require('body-parser');
const { Worker, isMainThread, workerData } = require('worker_threads');

const app = express();
const port = 8000;

app.use(bodyParser.json());

function processSequential(toSort) {
  const startTime = process.hrtime.bigint();

  const sortedArrays = toSort.map(arr => [...arr].sort((a, b) => a - b));

  const endTime = process.hrtime.bigint();
  const timeNS = Number(endTime - startTime);

  return { sortedArrays, timeNS };
}

function processConcurrent(toSort) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();

    const worker = new Worker('./concurrentSort.js', { workerData: toSort });

    worker.on('message', result => {
      const endTime = process.hrtime.bigint();
      const timeNS = Number(endTime - startTime);
      resolve({ sortedArrays: result, timeNS });
    });

    worker.on('error', error => {
      reject(error);
    });
  });
}

app.post('/process-single', (req, res) => {
  const { to_sort } = req.body;
  const { sortedArrays, timeNS } = processSequential(to_sort);

  res.json({ sortedArrays, timeNS });
});

app.post('/process-concurrent', async (req, res) => {
  const { to_sort } = req.body;

  try {
    const { sortedArrays, timeNS } = await processConcurrent(to_sort);

    res.json({ sortedArrays, timeNS });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
