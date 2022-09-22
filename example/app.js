require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 8080;
const { resize } = require('../.');

app.get('/status', (_req, res) => {
    res.send('All Okay');
});

app.get('/resize', async (req, res) => {
    try {
        let url = req.query.url;
        let response = await resizer(url);
        res.send(response);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.use(resize(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.listen(PORT, () => {
    console.log(`App started on ${PORT}`);
});
