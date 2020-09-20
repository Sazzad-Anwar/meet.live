const bcrypt = require('bcryptjs');
const { json } = require('express');

// let word = "1234"

// var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync(word, salt);

// console.log(`this is hash ${hash}`);

fetch(`${url}participant/update/${room_id}/${username}/${partnerName}`,{method:'post',headers:{'Content-Type': 'application/json'}}).then(res=> res.json()).then(json=> console.log(json))