let socket = io('localhost:4000')

//监听与服务端的连接
socket.on('connect', () => {
    console.log('连接成功')
})

let list = document.getElementById('list')
    input = document.getElementById('input')
    sendBtn = document.getElementById('sendBtn')

// 发送消息的方法
function send() {
    let value = input.value
    if (value) {
        //发消息给服务器
        socket.emit('message', value)
        input.value = ''
    }else{
        alert('输入的内容不能为空')
    }
}

//点击按钮发送消息
sendBtn.onclick = send

// 回车发送消息
function enterSend(event) {
    let code = event.keyCode;
    if (code === 13)  {
        send();}
 }

// 当输入框onkeydown的时候发送消息
input.onkeydown = function(event) {
    enterSend(event);
};

// 进入房间(群)
function join(room) {
    socket.emit('join', room);
}
// 离开房间(群)
function leave(room) {
    socket.emit('leave', room);
}

//监听message事件来接受服务端发来的消息
socket.on('message', data  => {
    // 创建li元素 并将其添加到list列表
    let li = document.createElement('li')
    li.className = 'list-group-item'
    li.innerHTML = 
    `
    <p style="color:#ccc">
        <span class="user">${data.user}</span>
        ${data.createAt}
    </p>
    <p class='content'>${data.content}</p>
    `
    //将li添加到list列表中
    list.appendChild(li)
    // 将聊天区的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight
})

// 私聊方法
function privateChat(event) {
    let target = event.target
    // 拿到对应的用户名
    let user = target.innerHTML
    // 只用class为user的才是目标元素
    if (target.className === 'user') {
        // 将@用户名显示在输入框中
        input.value =  `@${user} `
    }
}

// 点击进行私聊
list.onclick = function (event){
    privateChat(event)
}
