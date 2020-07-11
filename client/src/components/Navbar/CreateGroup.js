import React, { useState, useContext } from 'react'
import Axios from 'axios'

import validator from 'validator'

// Styles
import { IconButton, Paper, Grid, Typography, makeStyles, TextField, Chip, Button } from '@material-ui/core'
import { Close, Add } from '@material-ui/icons'
import { UserAndTokenContext, GroupsContext } from '../App'

const useStyles = makeStyles({
    paper: {
        minHeight: 300,
        width: 450,
        padding: '25px',
        justify: 'center' // make this in the middle of the screen
    },
    close: {
        marginLeft: 'auto'
    },
    chip: {
        margin: 10
    }
})

export default function CreateGroup({ handleModalClose, handleProfileMenuClose }) {
    const [form, setForm] = useState({ groupName: '', groupNameError: '', emailInput: '', emailInputError: '', emailList: [] })

    const { user } = useContext(UserAndTokenContext)
    const { setGroups } = useContext(GroupsContext)

    const classes = useStyles()

    function handleFormChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    function handleAddEmail(event) {
        event.preventDefault()
        const errors = validateEmailAdd()
        if (!errors) {
            const newList = form.emailList
            newList.push(form.emailInput)
            setForm(prevState => {
                return {
                    ...prevState,
                    emailInput: '',
                    emailInputError: '',
                    emailList: newList
                }
            })
        }
    }

    function handleDeleteEmail(email) {
        let newList = form.emailList
        newList = newList.filter(i => i !== email)
        setForm(prevState => {
            return {
                ...prevState,
                emailList: newList
            }
        })
    }
 
    async function handleFormSubmit(e) {
        console.log(e)
        e.preventDefault()
        const errors = validate()
        if (!errors) {
            const reqBody = { 
                groupName: form.groupName, 
                groupCreator: user._id, 
                groupCreatorName: user.name,
                emailInvites: form.emailList 
            }
            try {
                const { status, data } = await Axios.post(`/api/group`, reqBody)
                if (status === 201 && data !== null) {
                    console.log(data)
                    handleModalClose()
                    setForm({ groupName: '', groupNameError: '', emailInput: '', emailInputError: '', emailList: [] })
                    setGroups(prevState => [...prevState, data])
                    handleProfileMenuClose()
                } 
            } catch(err) {
                if (err.response.status === 400) {
                    setForm(prevState => {
                        return {
                            ...prevState,
                            groupNameError: err.response.data.message
                        }
                    })
                }
            }
        }
    }

    const validateEmailAdd = () => {
        let isError = false
        const errors = {
            emailInputError: ''
        }

        if (form.emailList.includes(form.emailInput)) {
            isError = true
            errors.emailInputError = 'You have already added this email to the list'
        }

        if (form.emailInput === '' || !validator.isEmail(form.emailInput)) {
            isError = true
            errors.emailInputError = 'Please enter a valid email address'
        }

        if (isError) {
            setForm(prevState => {
                return {
                    ...prevState,
                    ...errors
                }
            })
        }

        return isError
    }

    const validate = () => {
        let isError = false
        const errors = {
            groupNameError: '',
            emailInputError: ''
        }

        if (form.groupName < 3 || form.groupName > 30) {
            isError = true
            errors.groupNameError = 'Group names must be between 3 and 30 characters in length'
        }

        if (isError) {
            setForm(prevState => {
                return {
                    ...prevState,
                    ...errors
                }
            })
        }

        return isError
    }

    return (
        <>
            <Paper className={classes.paper}>
                <Grid container direction="column" justify="space-around">
                    <Grid item container direction="row" justify="space-between" alignItems="flex-end">
                        <Grid item>
                            <Typography variant="h6">Create a Group</Typography>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={handleModalClose}>
                                <Close fontSize={'small'} />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <form autoComplete="off" onSubmit={handleFormSubmit}>
                        <Grid item>
                            <TextField 
                                id="group-name" 
                                label="Group Name" 
                                type="text"
                                name="groupName" 
                                size="medium"
                                fullWidth={true}
                                value={form.groupName} 
                                onChange={handleFormChange}
                                autoFocus={true}
                                error={form.groupNameError === '' ? false : true}
                                helperText={form.groupNameError}
                            />
                        </Grid>
                        <Grid item container direction="row" alignItems="flex-end">
                            <Grid item>
                                <TextField 
                                    id="emails" 
                                    label="Invite Friends by Email" 
                                    type="text"
                                    name="emailInput" 
                                    size="medium"
                                    fullWidth={true}
                                    value={form.emailInput} 
                                    onChange={handleFormChange}
                                    error={form.emailInputError === '' ? false : true}
                                    helperText={form.emailInputError}
                                />
                            </Grid>
                            <Grid item>
                                <IconButton 
                                    onClick={handleAddEmail}
                                    disabled={ form.emailInput === '' ? true : false }
                                >
                                    <Add />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid item container direction="row" spacing={1} alignItems="flex-start">
                            { 
                                form.emailList.map(email => {
                                    return (
                                        <Grid item key={email} className={classes.chip}>
                                            <Chip 
                                                label={email}
                                                onDelete={() => handleDeleteEmail(email)}
                                            />
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                        <Grid item container direction="row" justify="flex-end">
                            <Grid item >
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={form.groupName === '' ? true : false}
                                >
                                    SUBMIT
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Paper>
        </>
    )
}