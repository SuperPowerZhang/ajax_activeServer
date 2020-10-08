
var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/
    // request.headers可以获得所有的请求头。请求体不好读
    console.log('勤奋的孩子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

    if (path === "/sign.html" && method === "POST") {
        response.setHeader("Content-Type", "text/html;charset=utf-8")
        let userList = JSON.parse(fs.readFileSync("./db/user.json").toString())
        let array = []
        request.on('data', (chunk) => {
            //Buffer提供的把编码utf-8的数据改成string的方法，不然是utf-8的乱码看不懂的
            array.push(chunk)
        })
        request.on('end', () => {
            let data = Buffer.concat(array).toString()
            data = JSON.parse(data)
            let newUser = {
                id: userList[0] ? userList[userList.length - 1].id + 1 : 1,
                name: data.name,
                password: data.password
            }

            console.log(newUser)
            userList.push(newUser)
            fs.writeFileSync("./db/user.json", JSON.stringify(userList))
            response.end("nice")
        })

    } else if (path === "/login.html" && method === "POST") {
        response.setHeader("Content-Type", "text/html;charset=utf-8")
        let userList = JSON.parse(fs.readFileSync("./db/user.json").toString())
        let array = []
        request.on('data', (chunk) => {
            array.push(chunk)
        })
        request.on('end', () => {
            let data = Buffer.concat(array).toString()
            data = JSON.parse(data)
            let result = userList.find((Element) =>
                Element.name === data.name && Element.password === data.password

            )
            if (result === undefined) {
                response.statusCode = 404
                response.end("失败")
            } else {
                let num = Math.random().toString()

                let session = JSON.parse(fs.readFileSync('./session.json').toString())
                session[num] = { 'user_id': result.id }
                fs.writeFileSync('./session.json', JSON.stringify(session))
                response.statusCode = 200
                response.setHeader("Set-Cookie", `user_id=${num}`)
                response.end("成功")
            }
        })
    }
    else if (path === "/index.html") {
        response.setHeader("Content-Type", "text/html;charset=utf-8")
        let cookie = request.headers['cookie']
        let userList = JSON.parse(fs.readFileSync("./db/user.json").toString())
        let content
        try {
            content = fs.readFileSync('./index.html').toString()
            let index = cookie.indexOf("user_id=")
            if (index) {

                let id = cookie.slice(index + 8)
                console.log(id)
                let session = JSON.parse(fs.readFileSync('./session.json').toString())
                let userId = session[id].user_id
                console.log(userId);
                let user = userList.find((item) => item.id === Number(userId))
                if (user) {
                    content = content.replace('{{status}}', `欢迎${user.name}`)
                } else {
                    content = content.replace('{{status}}', `登录的用户不对哦，输对了密码可是数据库里没有`)
                }
            } else {
                content = content.replace('{{status}}', '还没登录')
            }
        } catch (error) {
            response.statusCode = 404
            content = response.statusCode + " + 文件不存在鸭~"
        }
        response.write(content)
        response.end()
    }
    else {
        response.statusCode = 200
        let type = {
            ".html": "text/html",
            ".css": "text/css",
            ".xml": "text/xml",
            ".js": "text/javascript",
            ".json": "text/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        }
        // 用来设置返回字符集，不然可能乱码
        path = (path === "/" ? "/index.html" : path)
        let index = path.indexOf(".")
        let suffix = path.substring(index)
        response.setHeader('Content-Type', `${type[suffix] || "text/html"};charset=utf-8`)
        let content
        try {
            content = fs.readFileSync(`./${path}`)

        } catch (error) {
            response.statusCode = 404
            content = response.statusCode + " + 文件不存在鸭~"

        }
        response.write(content)
        response.end()

    }


    /******** 代码结束，下面不要看 ************/

})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
