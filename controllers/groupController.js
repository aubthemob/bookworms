if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const mongoose = require('mongoose')
const Group = require('../models/Group')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getGroups = async function(req, res, next) {
    try {
        const docs = await Group.find({ 'users.userId': { $in: [req.params.userId]} })
        groups = docs.map(g => {
            return { 
                groupId: g._id, 
                groupName: g.groupName 
            }
        })
        res.status(200).json(groups)
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}

exports.createGroup = async function(req, res, next) {
    try {
        if (!await Group.exists({ groupName: req.body.groupName })) {
            const group = await new Group({
                _id: new mongoose.Types.ObjectId(),
                groupName: req.body.groupName,
            })
            group.users.push({
                userId: req.body.groupCreator,
                groupCreator: true
            })
            console.log(group)
            await group.save()
            res.status(201).json(group)

            // sendgrid --> this code is only a proof of concept. No email will be sent
            // const emails = req.body.emailInvites
            // const link = 'link' // change this to a real link with the group name filled out!
            // const messages = emails.map(e => {
            //     return {
            //         to: e,
            //         from: 'ahbarkun@gmail.com', // change this for bookworms domain
            //         subject: `Your friend ${req.body.groupCreatorName} has invited you to join Bookworms!`,
            //         text: `Hi there! ${req.body.groupCreatorName} wants you to a book club on Bookworms.
            //         Click here to get started: ${link}`,
            //         html: `Hi there! ${req.body.groupCreatorName} wants you to a book club on Bookworms.
            //         Click here to get started: ${link}`,
            //     }
            // })
            // messages.forEach(async m => {
            //     await sgMail.send(m)
            // })
        } else {
            class DupError extends Error {
                constructor(message) {
                    super(message);
                    this.message = 'This group name is already being used'
                    this.name = 'DupError';
                }
            }
            throw new DupError()
        }
    } catch(err) {
        res.status(400).json(err)
        next(err)
    }
}