const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

mongoose.connection.once('open', () => {
    console.log('MONGO_DB DB connected.')
}).on('error', (error) => {
    console.log('DB Connection error is: ', error);
})