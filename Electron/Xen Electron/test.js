const path = require('path');
const fs  = require('fs');
const configFilePath = path.join(__dirname,'config.json');
const configString = fs.readFileSync(configFilePath);
const config = JSON.parse(configString);

console.log(config.tasks)
console.log(config.tasks.indexOf("Push ups"))
config.tasks.splice(config.tasks.indexOf("Push ups"),1)
console.log(config.tasks)
