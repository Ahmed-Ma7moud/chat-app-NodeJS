const {objectId} = require('../../validation/common')
module.exports = (socket , io) =>{
    socket.on('typing' , ({conversationID})=>{
        console.log(new Date())
        const {error} = objectId.validate(conversationID)
        if(error)
            return socket.emit('err' , error.details[0].message);
        if(!socket.conversations.has(conversationID))
            return socket.emit('err' , 'Not allowed');

        // broadcase typing to users in the room
        socket.to(conversationID).emit('typing' , {conversationID , user: socket.user})
    })
    socket.on('stopTyping' , ({conversationID})=>{
        console.log(new Date())
        const {error} = objectId.validate(conversationID)
        if(error)
            return socket.emit('err' , error.details[0].message);

        if(!socket.conversations.has(conversationID))
            return socket.emit('err' , 'Not allowed');

        // broadcase typing to users in the room
        socket.to(conversationID).emit('stopTyping' , {conversationID , user: socket.user})
    })
};