const express = require('express')
const app = express()
// 设置静态文件夹  默认找到当前目录下的index.html作为访问页面
app.use(express.static(__dirname))
// 系统设置为常量 方便使用
const SYSTEM = '系统'
// Websocket是依赖HTTP进行握手的
const server = require('http').createServer(app);

const io = require('socket.io')(server)

let socketObj = {}

//设置气泡颜色，每个用户的聊天颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'] 

// 乱序排列   打乱颜色数组
function shuffle(arr) {
    let len = arr.length, random;
    while (0 !== len) {
        random = (Math.random()* len--) >>> 0;

        [arr[len], arr[random]] = [arr[random], arr[len]];
    }
    return arr
}


// 监听与客户端的连接事件
io.on('connection', socket => {
    // console.log('服务端连接成功')   
    let username;
    let color;
    socket.on('message', msg => {
        // 服务端发送message事件 吧msg消息再发送给客户端
        if (username) {//如果有用户名
            // 正则判断消息是否为私聊
            let private = msg.match(/@([^ ]+) (.+)/)
            if (private) {
                // 私聊的用户，正则匹配的第一个分组
                let toUser = private[1]
                // 私聊的内容，正则匹配的第二个分组
                let content = private[2]
                // 从socketObj中获取私聊用户的socket
                let toSocket = socketObj[toUser]

                if (toSocket) {
                    // 向私聊的用户发消息
                    toSocket.send({
                        user:username,
                        content,
                        color,
                        createAt:new Date().toLocaleTimeString(),
                    })
                }
            }else{
                // 向所有人广播
                io.emit('message', {
                    user:username,
                    content:msg,
                    color,
                    createAt:new Date().toLocaleTimeString(),
                })
            }
            
        }else{//没有用户名
            // 如果第一次进入 将输入的内容作为用户名
            username = msg;

            // 分配一个颜色给进入的用户
            color = shuffle(userColor)[0]
            // 向除了自己的所有人广播
            socket.broadcast.emit('message', {
                user:SYSTEM,
                color,
                content:`${username}加入聊天！`,
                createAt:new Date().toLocaleTimeString()
            })
            socketObj[username] = socket
        }
    })
})


server.listen(4000)