let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let stream = require('./ws/stream');
let path = require('path');
require('dotenv').config();
require('colors');

let port = process.env.PORT || 3939;
let favicon = require('serve-favicon');
const connectDB = require('./db/config');

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

connectDB('royex-live');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/v1', require('./Routes/Room'))


io.of('/stream').on('connection', stream);

server.listen(port, () => console.log(`App is running on port ${port}`));
