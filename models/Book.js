const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation')
const Schema = mongoose.Schema
const validator = require('validator')

let bookSchema = new Schema({
    author: {
        type: String,
        required: false
    },
    avgGoodreadsRating: {
        type: Number,
        required: false
    },
    bookTitle: {
        type: String,
        required: false
    },
    goodreadsBookId: {
        type: String,
        required: false,
        unique: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    goodreadsDescription: {
        type: String,
        required: false
    },
    isbn: {
        type: String,
        required: false
    }
})

bookSchema.plugin(beautifyUnique);

const Book = mongoose.model('Book', bookSchema)

module.exports = Book