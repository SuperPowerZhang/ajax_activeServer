const fs = require("fs")
let users = fs.readFileSync("./db/user.json").toString()
let arr = JSON.parse(users)
console.log(arr);

let newUser = {
    "id": "4",
    "name": "zhaoliu",
    "password": "tgb"
}
arr.push(newUser)
fs.writeFileSync("./db/user.json", JSON.stringify(arr))