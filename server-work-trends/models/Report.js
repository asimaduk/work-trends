const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    hours: {
        type: Number,
        required: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User'
    },
    userFullname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    edited: {
        type: Boolean,
        default: false
    },
    date: { 
        type: Date, 
        required: true, 
        default: Date.now
    }
}, 
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;