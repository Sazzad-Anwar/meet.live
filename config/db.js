//jshint esversion:10

const mysql = require('mysql');
const secret = require('../config/secret')

if(secret.node_env === 'dev'){
    const options={
        connectionLimit : 10,
        host: 'localhost',
        user: 'root',
        password: '',
        database:'royex_live'
    };

    exports.db = mysql.createPool(options);
    
}else{
    const options={
        connectionLimit : 10,
        host: 'us-cdbr-east-02.cleardb.com',
        user: 'bbe19d232392d6',
        password: 'c3fb9586',
        database:'heroku_d26de4bee22f95a'
    };
    exports.db = mysql.createPool(options);
}

