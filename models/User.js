if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation')
const Schema = mongoose.Schema
const validator = require('validator')
const jwt = require('jsonwebtoken')

let userSchema = new Schema({
    name: {
        type: String, 
        required: [true, 'A name is required'],
        trim: true,
        minlength: 2,
        maxlength: 15
    },
    email: {
        type: String, 
        required: [true, 'An email address is required'], 
        trim: true, 
        unique: 'This email address is already in use',
        lowercase: true,
        validate: {
            validator: value => (validator.isEmail(value)),
            message: props => `${props.value} is not a valid email address`
        },
        maxlength: 30
    },
    password: {
        type: String, 
        required: [true, 'A password is required'],
        trim: false
    },
    nylasToken: {
        type: String,
        default: null
    },
    events: [{
        title: {
            type: String,
            required: true
        }, 
        calendarSource: {
            type: String
        },
        groupId: {
            type: Schema.Types.ObjectId, 
            ref: 'Group',
            required: false
        },
        recurringType: {
            type: Number
        },
        startTimestamp: {
            type: Number
        },
        endTimestamp: {
            type: Number
        },
        type: {
            type: String
        }
    }]  
})

userSchema.plugin(beautifyUnique);

const User = mongoose.model('User', userSchema)

module.exports = User