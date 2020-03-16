const express = require('express');
require('dotenv').config();
require('./db/db');
const cors = require('cors');

const port = process.env.PORT || 5000;

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.json());
app.use(cors());

const routes = require('./routers');
app.use(routes);

let users = {};

app.use('/',(req, res) => res.json('Work Trends API is working! Specify full endpoint; e.g /api/v1/reports'));

io.on('connection', (client) => {

    client.on('new_report', (data) => {
        console.log('new_report ',data);
        // client.broadcast.emit('new_',{username: data.username, body: data.body})

        for (let key in users) {
            if(users.hasOwnProperty(key) && (users[key]._id !== data._userId)) {
                console.log('Emitting new report to...', users[key].socket)
                
                client.to(users[key].socket).emit('new_report', {report: data.report})
            }
        }
    });

    client.on('user', (user) => {
        console.log('new user',user);

        users[user._id] = {
            socket: client.id,
            _id: user._id,
        }

        console.log('All users now...',users);
    });

    client.on('delete', (userId) => {
        console.log('delete user with id ',userId);

        delete users[userId];

        console.log('Users after delete...',users);
    });

    client.on('disconnect', () => {
        console.log('client disconnected')

        let key = null;

        for(var k in users){
            if(users[k] && (users[k].socket == client.id)){
                key = k;
                break;
            }    
        }

        if(key != null){
            delete users[key];
        }

        console.log('Users after disconnection...',users);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
});