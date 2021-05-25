let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let stream = require('./ws/stream');
let morgan = require('morgan');
let path = require('path');
const cors = require('cors')
const db = require('./config/db')
const session = require('express-session');
const flash = require('connect-flash');
const secret = require('./config/secret');
const passport = require('passport');
const bcrypt = require('bcryptjs');
require('./config/passport')(passport);

const mysql = require('mysql');
const { resourceUsage } = require('process');

app.use(express.urlencoded({
  extended: true
}))

app.use(express.json());

app.use(cors());

app.use(morgan('common'))

app.set('view engine', 'ejs');

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/admin/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static('assets'));

app.use(
  session({
    secret: secret.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 60 * 60 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // setting up the connect-flash middleware function
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash('error_msg');
  res.locals.warning_msg = req.flash('warning_msg');
  res.locals.error = req.flash('error');
  next();
});


// db.db.getConnection(err => {
//   if (err) {
//     console.log(`Failed to connect to database causing ${err}`);
//   } else {
//     console.log('Database is connected');
//   }
// });

  //creating Meeting tables if not exists
  let createTableMeeting = `CREATE TABLE IF NOT EXISTS meeting(
  id int PRIMARY KEY AUTO_INCREMENT,
  meeting_id TEXT NOT NULL,
  meeting_name TEXT NOT NULL,
  room_master_name TEXT NOT NULL,
  room_master_email TEXT NOT NULL,
  status TEXT NOT NULL,
  room_creation_time TIMESTAMP NOT NULL,
  meeting_closing_time TEXT NOT NULL
  )`
  let createTableQuery = db.db.query(createTableMeeting, (err, done) => {
    if (err) throw err;
  });

  //creating participants table if not exists
  let createTableParticipants = `CREATE TABLE IF NOT EXISTS participants(
  id int PRIMARY KEY AUTO_INCREMENT,
  room_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  email TEXT NULL,
  status TEXT NOT NULL,
  Ip_address TEXT NOT NULL,
  meeting_joining_time TIMESTAMP NOT NULL,
  layout TEXT NULL,
  audioMute TEXT NULL,
  videoMute TEXT NULL
  )`
  let createParticipantsQuery = db.db.query(createTableParticipants, (err, done) => {
    if (err) throw err;
  });


  //creating vault table if not exists
  let createTableVault = `CREATE TABLE IF NOT EXISTS vault(
  id int PRIMARY KEY AUTO_INCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL
  )`;
  let createVaultQuery = db.db.query(createTableVault, (err, done) => {
    if (err) throw err;
  });

//create a table for layout stting
let layoutTable = `CREATE TABLE IF NOT EXISTS layout(
  id INT PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL,
  layout INT NOT NULL
)`;

db.db.query(layoutTable,(err,done)=>{
  if(err) throw err;
});

//automatic set password
let passQuery = db.db.query('SELECT * FROM vault',(err,vault)=>{
  if(err) throw err;
  if(vault.length === 0){
    let email=secret.email;
    let word = secret.password
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(word, salt);

    let sql = "INSERT INTO vault (email,password) VALUES (?,?)";
    let query = db.db.query(sql,[email,hash],(err,done)=>{
      if(err) throw err;
      console.log(done);
    });
  }
});

//royex video app main page
app.get('/', async(req, res) => {
  // const { username } = req.body;
  // try {
  //   const getLayout = async()=>{
  //     return await db.query('SELECT * FROM layout WHERE name=?',username);
  //   }
  
  //   let layoutname = await getLayout();
  
  //   if(layoutname.length !==0 && layoutname[0].layout === '2'){
  //     res.render('layout-2');
  //   }else{
  //     res.render('royex_live');
  //   }
  // } catch (error) {
  //   console.log(error);
  // }
  // res.render('royex_live');
  res.json(req.body);
  
});

app.post('/', async(req, res) => {
  const { layout,username } = req.body;

  db.db.query('SELECT * FROM layout WHERE name=?',username,(err,found)=>{
    if(err) throw err;
    if(found.length !== 0){
      db.query('UPDATE layout SET layout=? WHERE name=?',[layout,username],(err,done)=>{
        if(err) throw err;
        if(layout === '2'){
          res.render('layout-2');
        }else{
          res.render('royex_live');
        }
      })
    }else{
      db.query('INSERT INTO layout (name,layout) VALUES (?,?)',[username,layout],(err,done)=>{
        if(err) throw err;
        if(layout === '2'){
          res.render('layout-2');
        }else{
          res.render('royex_live');
        }
      })
    }
  }); 
});

app.use('/meeting', require('./routes/meeting'));
app.use('/admin', require('./routes/admin'));

io.of('/stream').on('connection', stream);

io.on("connection", () => {
  console.log('connected');
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3939;
}


server.listen(port, () => console.log(`App is connected on port ${port}`));