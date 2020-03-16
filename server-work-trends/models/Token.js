const mongoose = require('mongoose')

const tokenSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    token: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now, 
        expires: 10800 
    }
});


const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;