const express = require('express')
const router = express.Router()
const bookController = require('./controllers/bookController')
const userController = require('./controllers/userController')
const groupController = require('./controllers/groupController')
const auth = require('./middleware/auth')

// book CRUD operations
router.get('/books/:groupId/:userId', auth.authenticateToken, bookController.getBooks)
router.post('/add-book', auth.authenticateToken, bookController.addBook)
router.delete('/delete-book/:docId', auth.authenticateToken, bookController.deleteBook)

router.post('/rating', auth.authenticateToken, bookController.setBookRating)
router.put('/rating/:groupId/:bookId/:ratingId', auth.authenticateToken, bookController.editBookRating)

// registration, login, and auth
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/groups/:userId', auth.authenticateToken, groupController.getGroups)

router.get('/nylas-auth-connect/:userEmail', auth.authenticateToken, userController.nylasAuth)
router.post('/nylas-auth-callback', auth.authenticateToken, userController.nylasAuthCallback)

// goodreads search
router.post('/goodreadsSearch', auth.authenticateToken, bookController.goodreadsSearch)

// calendar
router.get('/calendar-freebusy/:userEmail/:userId', auth.authenticateToken, userController.freeBusy)
router.post('/event', auth.authenticateToken, userController.addEventFromCalendar)
router.put('/event', auth.authenticateToken, userController.modifyEventFromCalendar)
router.delete('/event/:eventId', auth.authenticateToken, userController.deleteEventFromCalendar)

// Group CRUD operations
router.post('/group', auth.authenticateToken, groupController.createGroup)

router.get('/test', (req, res) => {
    res.json({ message: 'success' })
})

module.exports = router;