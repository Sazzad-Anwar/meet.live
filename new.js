const bcrypt = require('bcryptjs');

let word = "#Admin123@bluetech.com"

var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync(word, salt);

console.log(`this is hash ${hash}`);

// const date = new Date();
