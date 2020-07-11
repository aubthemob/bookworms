if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const User = require('../models/User')
const Group = require('../models/Group')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const uniqid = require('uniqid')
const mongoose = require('mongoose')

const Nylas = require('nylas')

Nylas.config({
    clientId: process.env.NYLAS_CLIENT_ID,
    clientSecret: process.env.NYLAS_CLIENT_SECRET,
});
  
exports.register = async function(req, res, next) {
    try {
        // hashing password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        // saving new user to the database
        const user = await new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        await user.save()

        if (req.body.groupName !== '') {
            // if group doesn't exist, create group and make user the creator, else add the user to users in the group
            if (!await Group.exists({ groupName: req.body.groupName })) {
                const group = await new Group({
                    groupName: req.body.groupName,
                })
                group.users.push({
                    userId: user._id,
                    groupCreator: true
                })
                await group.save()
                const accessToken = jwt.sign({ _id: user._id, name: user.name, email: user.email, group: group._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' }) // add expiration and make this a method in the schema
                res.status(200).json({ accessToken })

            } else {
                const group = await Group.findOne({ groupName: req.body.groupName })
                group.users.push({
                    userId: user._id,
                    groupCreator: false
                })
                await group.save()
                const accessToken = jwt.sign({ _id: user._id, name: user.name, email: user.email, initGroup: group._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' }) // add expiration and make this a method in the schema
                res.status(200).json({ accessToken })
            }
        }
        
        // find existing group events and add to the new user's calendar
    } catch (err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.login = async function(req, res, next) {
    try {
        if (await User.exists({ email: req.body.email })) {
            const user = await User.findOne({ email: req.body.email })
            if (await bcrypt.compare(req.body.password, user.password)) {
                const accessToken = jwt.sign({ _id: user._id, name: user.name, email: user.email, nylasToken: user.nylasToken ? true : false }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }) // add expiration and make this a method in the schema
                res.status(200).json({ accessToken })
            } else {
                throw new Error('Credentials do not match')
            }
        } else {
            throw new Error('Credentials do not match')
        }
    } catch (err) {
        res.status(401).json(err)
        next(err)
    }
}

// Nylas calendar auth
exports.nylasAuth = async function(req, res, next) {
    try {
        options = {
            loginHint: req.params.userEmail,
            redirectURI: 'http://localhost:3000/nylas-auth-callback',
            scopes: ['calendar.read_only'],
        };
        
        url = await Nylas.urlForAuthentication(options);
        res.status(200).json({ url })
    } catch(err) {
        res.status(401).json(err)
        next(err)
    }
}

exports.nylasAuthCallback = async function(req, res, next) {
    try {
        if (req.query.code) {
            const token = await Nylas.exchangeCodeForToken(req.query.code)
            const user = await User.findById(req.body.userId)
            user.nylasToken = token
            await user.save()
            const response = user
            res.status(200).json({ ...response._doc, nylasToken: true })
          } else if (req.query.error) {
            throw new Error('Please try using a different email address')
        }
    } catch(err) {
        res.status(400).json(err)
        next(err)
    } 
}

// GET time slots of scheduled calendar activities
exports.freeBusy = async function(req, res, next) {
    const startTime = Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 7) // 7 days ago
    const endTime = startTime + (60 * 60 * 24 * 14) // add 14 days in seconds 
    try { 
        const user = await User.findById(req.params.userId)
        const bookwormsEvents = user.events
        if (user.nylasToken !== null) {
            const nylas = Nylas.with(user.nylasToken);
            const nylasEvents = await nylas.events.list({ 
                expand_recurring: true, 
                starts_after: startTime, 
                ends_before: endTime,
                emails: [req.body.userEmail],
            })
            nylasEvents.map(e => {
                return {
                    ...e, 
                    id: uniqid()
                }
            })
            const combinedEvents = [...nylasEvents, ...bookwormsEvents]
            res.json(combinedEvents)
        } else {
            res.json(bookwormsEvents)
        }
    } catch(err) {
        res.status(400).json(err)
        next(err)
    } 
}

exports.addEventFromCalendar = async function(req, res, next) {
    try {
        const event = defineEvent(req.body)
        if (req.body.type === 'individual') {
            const user = await User.findById(req.body.userId)
            user.events.push(event)
            await user.save()
        } else if (req.body.type === 'group') {
            const group = await Group.findById(req.body.groupId)
            const users = group.users.map(u => u.userId)
            users.forEach(async u => {
                const user = await User.findById(u)
                user.events.push(event)
                await user.save()
            })
        }
        res.status(200).json(event)
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.modifyEventFromCalendar = async function(req, res, next) {
    try {
        const event = defineEvent(req.body)
        const usersWithEvent = await User.find({ 'events._id': req.body.eventId })
        usersWithEvent.forEach(u => u.events.forEach(async e => {
            if (e._id == req.body.eventId) {
                e._id = event._id,
                e. title = event.title,
                e.startTimestamp = event.startTimestamp, 
                e.endTimestamp = event.endTimestamp, 
                e.groupId = event.groupId,
                e.calendarSource = event.calendarSource,
                e.type = event.type
                await u.save()
            }
        }))
        res.sendStatus(200)
        } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.deleteEventFromCalendar = async function(req, res) {
    try {
        const usersWithEvent = await User.find({ 'events._id': req.params.eventId })
        usersWithEvent.forEach(u => u.events = u.events.filter(e => e._id != req.params.eventId))
        usersWithEvent.forEach(async u => await u.save())
        res.sendStatus(200)
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

// Helpers
function defineEvent(body) {
    return {
        _id: !body.eventId ? new mongoose.Types.ObjectId() : body.eventId,
        title: body.title,
        startTimestamp: moment(body.start).unix(), 
        endTimestamp: moment(body.end).unix(), 
        groupId: body.groupId,
        calendarSource: 'bookworms',
        type: body.type
    }
}

