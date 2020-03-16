const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async(req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('req.header(Authorization)...',authHeader)
    
    if(authHeader){
        const token = authHeader.replace('Bearer ', '')
        
        const data = jwt.verify(token, process.env.JWT_SECRET)
        
        try {
            const user = await User.findOne({ _id: data.id, 'tokens.token': token })
            if (!user) {
                throw new Error()
            }

            req.user = user;
            req.token = token;

            next();
        } catch (error) {
            console.log('auth error: ',error)
            res.status(401).send({ message: 'You are not authorized to access this resource' })
        }
    }
    else {
        res.status(401).send({ message: 'You are not authorized to access this resource' })
    }
}

module.exports = auth;