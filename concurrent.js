const { workerData, parentPort } = require('worker_threads');

const toSort = workerData;
const sortedArrays = toSort.map(arr => [...arr].sort((a, b) => a - b));

parentPort.postMessage(sortedArrays);
