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

// 监听与客户端的连接事件
io.on('connection', socket => {
    console.log('服务端连接成功')   
    let username;
    socket.on('message', msg => {
        // 服务端发送message事件 吧msg消息再发送给客户端
        if (username) {//如果有用户名
            // 向所有人广播
            io.emit('message', {
                user:username,
                content:msg,
                createAt:new Date().toLocaleTimeString(),
            })
        }else{//没有用户名
            // 如果第一次进入 将输入的内容作为用户名
            username = msg;
            // 向除了自己的所有人广播
            socket.broadcast.emit('message', {
                user:SYSTEM,
                content:`${username}加入聊天！`,
                createAt:new Date().toLocaleTimeString()
            })
        }
    })
})


server.listen(4000)