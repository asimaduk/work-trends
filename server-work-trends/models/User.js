const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');

const Token = require('../models/Token');

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    avatar: {
        type: String,
        trim: true,
        max: 255
    },
    enabled: {
        type: Boolean,
        required: true,
        default: false
    },
    role: {
        type: String,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    emailVerified: { 
        type: Boolean, 
        default: false 
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
}, 
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email})
    if(!user){
        throw new Error('Username and password do not match. Please check and try again.')
    }
    
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    
    if(!isPasswordMatch) {
        throw new Error('Username and password do not match. Please check and try again.')
    }

    return user
}

userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

userSchema.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).toString('hex')
    };

    return new Token(payload);
};

const User = mongoose.model('User', userSchema);

module.exports = User;