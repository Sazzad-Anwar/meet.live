let express = require( 'express' );
let app = express();
let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );
let stream = require( './ws/stream' );
let morgan = require('morgan');
let path = require( 'path' );
var enforce = require('express-sslify');

app.use(morgan('common'))

app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );

app.get( '/', ( req, res ) => {
    res.sendFile( __dirname + '/index.html' );
} );


io.of( '/stream' ).on( 'connection', stream );

io.on("connection", ()=>{
  console.log('connected');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3939;
}
app.use(enforce.HTTPS());

server.listen( port,()=>console.log(`App is connected on port ${port}`));