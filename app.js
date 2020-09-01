let express = require( 'express' );
let app = express();
let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );
let stream = require( './ws/stream' );
let morgan = require('morgan');
let path = require( 'path' );
// var sslRedirect = require('heroku-ssl-redirect');

// app.use(sslRedirect());

app.use(morgan('common'))

app.set('view engine','ejs');

app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );

app.get( '/', ( req, res ) => {
    res.render('index');
} );


io.of( '/stream' ).on( 'connection', stream );

io.on("connection", ()=>{
  console.log('connected');
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3939;
}


server.listen( port,()=>console.log(`App is connected on port ${port}`));