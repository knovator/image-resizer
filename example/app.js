const express = require('express');
const app = express();
const PORT = 8080;
const { resize } = require('../.');

app.get('/status', (_req, res) => {
    res.send('All Okay');
});

app.use(resize(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.listen(PORT, () => {
    console.log(`App started on ${PORT}`);
});
