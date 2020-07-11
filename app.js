if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const router = require('./router')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

let app = express()

// middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(cookieParser())

app.use(cors())
app.use(compression())
app.use(helmet())

// connecting to mongodb
mongoose.connect(process.env.ATLAS_URI, {useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify: false, useCreateIndex: true })
db = mongoose.connection
db.on('error', err => console.log(err))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/api', router)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const port = process.env.PORT || 5000

app.listen(port)