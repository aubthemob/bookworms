const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation')
const Schema = mongoose.Schema
const validator = require('validator')

let groupSchema = new Schema({
    groupName: {
        type: String, 
        required: true,
        trim: true,
        unique: 'This group name is already being used',
        minLength: 3,
        maxlength: 30
    },
    users: [{
        userId: {
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: false
        },
        groupCreator: {
            type: Boolean,
            required: false
        }
    }],
    books: [{
        book: {
            type: Schema.Types.ObjectId, 
            ref: 'Book',
            required: false
        },
        userAdder: {
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: false
        },
        ratings: [{
            userRater: {
                type: Schema.Types.ObjectId, 
                ref: 'User',
                required: false,
                unique: true,
                sparse: true,
                default: null
            },
            rating: {
                type: Number,
                required: false
            }
        }]
    }]
})

groupSchema.virtual('ranking').get(function() {
    const userIds = this.users.map(u => u.userId)

    return (
        this.books.map(b => {
            const userRaters = b.ratings.map(r => r.userRater)
            const ratingSum = b.ratings.map(r => r.rating)

            return {
                _id: b._id,
                bookId: b.book && b.book._id,
                ratingSum: ratingSum.reduce((a,b) => a+b, 0),
                nonRaters: userIds.filter(u => !userRaters.includes(u))
            }
        })
    )
})

groupSchema.set('toJSON', { virtuals: true })
groupSchema.set('toObject', { virtuals: true })

groupSchema.plugin(beautifyUnique);

const Group = mongoose.model('Group', groupSchema)

module.exports = Group