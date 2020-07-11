if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const Book = require('../models/Book')
const Group = require('../models/Group')
const Axios = require('axios')
const convert = require('xml-js')

exports.getBooks = async function(req, res, next) { // can we (and should we) filter out the information of other users?
    try {
        let results = await Group.findOne({
            "_id": req.params.groupId
        })
        .populate('books.book')
        .populate({ path: 'books.userAdder', select: '_id name' })

        results = results.toObject()
        
        const newRatings = results.books.map(b => b.ratings.filter(z => z.userRater == req.params.userId))  
        for (i = 0; i < results.books.length; i++) {
            results.books[i].ratings = newRatings[i]
        }

        results = results.books.map((b, i) => Object.assign({}, b, results.ranking[i]))
        
        res.status(200).json(results)
    } catch (err) {
        res.status(400).json(err)
        next(err)
    }
}
    
exports.addBook = async function(req, res, next) {
    try {
        if (await Book.exists({ goodreadsBookId: req.body.id })) { // <-- if book exists, but not in this group
            const book = await Book.findOne({ goodreadsBookId: req.body.id })
            const group = await Group.findById(req.body.groupId)
            group.books.push({
                book: book._id,
                userAdder: req.body.userId
            })
            await group.save()

            const newBooks = await Group.findById(req.body.groupId).populate('books.book').populate('books.userAdder') // should filter non-essential user info to be returned
            res.json(newBooks.books.slice(-1)[0]) // respond with the book that was just saved into the group

        } else { // <-- if book does not exist yet
            // use book ID to get description and isbn data
            url = `https://www.goodreads.com/book/show/${req.body.id}.xml?key=${process.env.GOODREADS_KEY}`
            const response = await Axios.get(url)
            const data = JSON.parse(convert.xml2json(response.data, { compact: true, spaces: 2 }))
            let description = data.GoodreadsResponse.book.description._cdata ? data.GoodreadsResponse.book.description._cdata : ''
            description = description.replace(/<[^>]*>?/gm, '') // HTML to text
            if (!description) { description = 'No decription available' }
            const isbn = data.GoodreadsResponse.book.isbn._cdata

            // save book document in books
            const book = await new Book ({
                author: req.body.author,
                avgGoodreadsRating: req.body.avgRating, 
                goodreadsBookId: req.body.id,
                bookTitle: req.body.bookTitle,
                imageUrl: req.body.image,
                avgRating: req.body.avgRating,
                goodreadsDescription: description,
                isbn: isbn
                })
            await book.save()

            // save book to group
            const group = await Group.findById(req.body.groupId)
            group.books.push({
                book: book._id,
                userAdder: req.body.userId
            })
            await group.save()
            
            const newBooks = await Group.findById(req.body.groupId).populate('books.book').populate('books.userAdder') // to do: filter non-essential user info to be returned
            res.status(201).json(newBooks.books.slice(-1)[0]) // respond with the book that was just saved into the group
        }
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.deleteBook = async function(req, res, next) {
    try {
        const doc = await Group.findOne({
            "books._id": req.params.docId
        })
        await doc.books.id(req.params.docId).remove()
        await doc.save()
    } catch (err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.editBookRating = async function(req, res, next) {
    try {
        const doc = await Group.findById(req.params.groupId)
        const book = doc.books.find(b => String(b.book) === req.params.bookId)
        const prevRating = book.ratings.id(req.params.ratingId)
        prevRating.rating = req.body.userRating
        await doc.save()
        res.status(201).json(prevRating)
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.setBookRating = async function(req, res, next) {
    try {
        const doc = await Group.findById(req.body.groupId)
        const book = doc.books.find(b => String(b.book) === req.body.bookId)  
        const newRating = {
            userRater: req.body.userId,
            rating: req.body.userRating
        }         
        book.ratings.push(newRating)
        await doc.save()
        res.status(201).json(newRating)
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.goodreadsSearch = async function(req, res, next) {
    const url = `https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_KEY}&q=${encodeURIComponent(req.body.bookTitle)}`
    try {
        const { data } = await Axios.get(url)
        res.status(200).json(data)
    } catch (err) {
        res.status(400).json(err)
        next(err)
    }
}