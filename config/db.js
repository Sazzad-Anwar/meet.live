// //jshint esversion:10

// const mysql = require('mysql');
// const secret = require('../config/secret');
// const util = require('util');

// if(secret.node_env === 'dev'){
//     const options=mysql.createPool({
//         connectionLimit : 10,
//         host: 'localhost',
//         user: 'root',
//         password: '',
//         database:'royex_live'
//     });

//     options.getConnection(err=>{
//         if(err) throw err;
//         console.log('Database is connected');
//     })

//     exports.query = util.promisify(options.query).bind(options);
//     exports.db = options;

// }else{
//     const options=mysql.createPool({
//         connectionLimit : 10,
//         host: 'us-cdbr-east-02.cleardb.com',
//         user: 'bbe19d232392d6',
//         password: 'c3fb9586',
//         database:'heroku_d26de4bee22f95a'
//     });

//     options.getConnection(err=>{
//         if(err) throw err;
//         console.log('Database is connected');
//     })

//     exports.query = util.promisify(options.query).bind(options);
//     exports.db = options;
// }

