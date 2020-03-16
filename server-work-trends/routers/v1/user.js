const express = require('express');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require('../../models/User');
const Token = require('../../models/Token');

const auth = require('../../middlewares/auth');

const router = express.Router();

const UPLOAD_PATH = 'uploads/images/profile';

const imageFilter = function (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/images/profile')
    },
    filename: function (req, file, cb) {
        const filename = `${uuidv4()}.${file.mimetype.split('/')[1]}`;
        cb(null,  filename );
    }
});

const upload = multer({ storage, fileFilter: imageFilter });

router.post('/', async (req, res) => {
    console.log('Create new user request')
    // Create a new user
    try {
        const reqBody = req.body;
        reqBody.avatar = '';
        reqBody.role = 'Basic';
        reqBody.tokens = [];
        reqBody.emailVerified = false;

        const user = new User(req.body);
        
        const newUser = await user.save();

        const token = newUser.generateVerificationToken(); 
        await token.save(); 

        let link="http://localhost:5000/api/v1/users/verify/"+token.token;

        let html = `<p>Hi ${user.username}<p>
                    <p>Please click on the link below to verify your account.</p> 
                    <p>${link}</p>
                    <p><b>This code will expire three hours after this email was sent.</b></p>
                    <p>If you did not request this, please ignore this email.</p>`;
        
        const msg = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: 'Verify your Work Trends account email address',
            html
        }

        sgMail.send(msg)
            .then(_ => {
                res.status(200).send({message: 'A verification code has been sent to ' + user.email + '.'});
            })
            .catch(err => {
                res.status(400).send({message: err.message})
            })
    } catch (error) {
        console.log(error)
        if(error.message.indexOf('duplicate') !== -1){
            if(error.message.indexOf('username') !== -1){
                res.status(400).json({error: 'Username already exists'})
            }
            else if(error.message.indexOf('email') !== -1){
                res.status(400).json({error: 'Email already exists'})
            }
        }
        else {
            res.status(500).json({error: error.message})
        }
    }
})

router.post('/uploadAvatar', auth, upload.single('avatar'), async (req, res) => {
    // Create a new event image
    console.log('avatar upload request...')
    try {
        if(req.user.avatar){
            console.log('already has avatar. clearing...')
            
            fs.unlink(path.join(UPLOAD_PATH, req.user.avatar),(err) => {
                if(err) console.log(err)
                else console.log('Old avatar unlinked.')
            })
        }

        // const avatar = `${uuidv4()}.${req.file.mimetype.split('/')[1]}`;
        const avatar = req.file.filename;

        await User.findByIdAndUpdate(req.user._id, { avatar })
        
        console.log('Avatar has been updated. req.file.filename: ', avatar);
        
        res.status(200).send({message: 'Avatar updated', avatar });
    } catch (error) {
        console.log('avatar update error',error);
        res.status(400).send('An unknown error occurred.')
    }
})

router.get('/avatar/:id', async (req, res) => {
    try {  
        fs.access(path.join(UPLOAD_PATH, req.params.id), fs.constants.F_OK, (err) => {
            if(err){
                console.error('File does not exists', err)
                sendDefaultAvatar(res)
                // throw new Error('File does not exists');
            }
          
            //file exists
            
            const mimetype = 'image/'+req.params.id.split('.')[1];

            res.setHeader('Content-Type', mimetype);
            fs.createReadStream(path.join(UPLOAD_PATH, req.params.id)).pipe(res);
        })
    } catch (error) {
        console.log('error getting avatar',_id)
        sendDefaultAvatar(res);
    }
})

router.get('/verify/:token', (req, res) => {
    //Find a matching verification token
    console.log('verify account with token',req.params.token)
    
    Token.findOne({ token: req.params.token }, (err, token) => {
        if (err) return res.status(400).send({ type: 'error', message: 'An unknown error occurred. Try again.' });
        if (!token) return res.status(400).send({ type: 'not-verified', message: 'We were unable to find a valid token. Your token may have expired. Kindly recheck and try again.' });
 
        // If we found a token, find a matching user
        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) return res.status(400).send({ message: 'We were unable to find a user for this token.' });
            if (user.emailVerified) return res.status(400).send({ type: 'already-verified', message: 'This user has already been verified.' });
 
            // Verify and save the user
            user.emailVerified = true;
            user.enabled = true;

            user.save(async (err) => {
                if (err) { return res.status(500).send({ status: 500, message: err.message }); }
                
                res.status(200).send("Your account has been verified. You can now log in.");
            });
        });
    });
})

router.get('/', auth, async (req, res) => {
    // Get users
    if(!req.user.isAdmin){
        res.status(401).send({error: 'You are not authorized to view this resource!'});
        return;
    }

    const limit = Math.abs(req.query.limit) || 10;
    const page = (Math.abs(req.query.page) || 1) - 1;

    let opt = {};
    if(req.query.enabled){
        opt.enabled = req.query.enabled;
    }

    try {
        const users = await User.find(opt).limit(limit).skip(limit * page);
        console.log('users found count',users.length)

        if(users && users.length > 0){
            users.forEach(user=> user.password = null)
        }

        res.status(200).send({ users })
    } catch (error) {
        res.status(400).send({message: 'An unknown error occurred. Please try again.'});
    }
})

router.put('/:id', auth, async (req, res) => {
    console.log('put request',req.body)
    // Update user
    try {
        if(!req.user.isAdmin && (req.user._id !== req.params.id)){
            res.status(401).send({error: 'You are not authorized to view this resource!'});
            return;
        }

        await User.findByIdAndUpdate(req.params.id, req.body);

        console.log('put update successful')
        res.status(200).send({ status: 200, message: 'Update successful'});
    } catch (error) {
        console.log('user put update error',error);
        res.status(400).send({message: error.message})
    }
})

router.delete('/:id', auth, async (req, res) => {
    // Delete user
    try {
        if(!req.user.isAdmin && (req.user._id !== req.params.id)){
            res.status(401).send({error: 'You are not authorized to view this resource!'});
            return;
        }

        await User.findByIdAndDelete(req.body._id);

        res.status(200).send({message: 'User delete successful'})
    } catch (error) {
        res.status(400).send({message: 'An unknown error occurred. Please try again.'})
    }
})

router.post('/login', async(req, res) => {
    //Login a registered user
    try {
        const { username, password } = req.body;
        let user = await User.findOne({ username });
        
        console.log('log in request',req.body)
        
        if(user){
            if(user.emailVerified){
                console.log('Email verified')
                user = await User.findByCredentials(user.email, password);
                
                const token = await user.generateAuthToken();
                user.password = null;

                res.status(200).send({ user, token })
            }
            else {
                res.status(400).send({message: 'Kindly verify your email address.'})
            }
        }
        else {
            res.status(400).send({message: 'Username/password mismatch.'})
        }
    } 
    catch (error) {
        console.log(error)
        res.status(400).send({message: error.message})
    }
})

router.get('/me', auth, async(req, res) => {
    // View logged in user profile
    req.user.password = null;
    res.send(req.user)
})

router.post('/me/logout', auth, async (req, res) => {
    // Log user out of the application
    console.log('/me/logout request')
    
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    console.log('/me/logoutall request___');

    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

const sendDefaultAvatar = (res) => {
    const filename = 'default_dp.png'
    const mimetype = 'image/png';

    res.setHeader('Content-Type', mimetype);
    fs.createReadStream(path.join(UPLOAD_PATH, filename)).pipe(res);
}

module.exports = router;