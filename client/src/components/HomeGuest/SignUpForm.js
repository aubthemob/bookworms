import React, { useState, useContext } from 'react'
import Axios from 'axios'
import jwt from 'jsonwebtoken'
import validator from 'validator'

// Contexts
import { UserAndTokenContext, GroupsContext } from '../App'

// Styles imports
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));

export default function SignUpForm({ setGuestToggle }) {
    const [regForm, setRegForm] = useState({ 
        name: '', 
        nameError: '', 
        email: '', 
        emailError: '', 
        password: '', 
        passwordError: '',
        groupName: '',
        groupNameError: ''
    })
    const classes = useStyles()

    const { setUser, setToken } = useContext(UserAndTokenContext)
    const { setCurrentGroup } = useContext(GroupsContext)

    function handleRegFormChange(e) {
        setRegForm({...regForm, [e.target.name]: e.target.value})
    }

    async function handleRegFormSubmit(e) {
        e.preventDefault()
        const errors = validate()
        if (!errors) {
            try {
                const { data, status } = await Axios.post(`/api/register`, regForm)
                if (data !== null && status !== 400) {
                    localStorage.setItem('accessToken', data.accessToken) 
                    setToken(data.accessToken)
                    const newData = jwt.decode(data.accessToken)
                    setRegForm({ 
                        name: '', 
                        nameError: '', 
                        email: '', 
                        emailError: '', 
                        password: '', 
                        passwordError: '',
                        groupName: '',
                        groupNameError: ''
                    })
                    setUser({_id: newData._id, email: newData.email, name: newData.name, loggedInStatus: true})
                    setCurrentGroup(newData.initGroup)
                    console.log(newData)
                }
            } catch (err) {
                if (err.response.status === 400) {
                    const errVar = Object.keys(err.response.data.errors)[0]
                    const errVarError = `${errVar}Error`
                    const errMessage = err.response.data.errors[errVar].message
                    setRegForm(prevState => {
                        return {
                            ...prevState,
                            [errVarError]: errMessage
                        }
                    })
                }
            }
        }
    }

    const validate = () => {
        let isError = false
        const errors = { 
            nameError: '', 
            emailError: '', 
            passwordError: '',
            groupNameError: '',
        }

        if (regForm.name.length < 2 || regForm.name.length > 15) {
            isError = true
            errors.nameError = 'Name must be 2 to 15 characters in length'
        }

        if (regForm.email.length > 30) {
            isError = true
            errors.emailError = 'Email address must be less than 30 characters in length'
        }

        if (regForm.email === '') {
            isError = true
            errors.emailError = 'You must enter an email address'
        }

        if (!validator.isEmail(regForm.email)) {
            isError = true
            errors.emailError = 'Please enter a valid email address'
        }

        if (regForm.name !== '' && !validator.isAlphanumeric(regForm.name)) {
            isError = true
            errors.nameError = 'Name must not contain any special characters'
        }

        if (regForm.password.length < 8 || regForm.password.length > 30) {
            isError = true
            errors.passwordError = 'Password must be between 8 and 30 characters in length'
        }

        if (regForm.groupName.length < 3 || regForm.groupName.length > 30) {
            isError = true
            errors.groupNameError = 'Group name must be between 3 and 30 characters in length'
        }

        if (regForm.groupName === '') {
            isError = true
            errors.groupNameError = 'You must join or create a group'
        }

        if (isError) {
            setRegForm(prevState => {
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
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
            Sign Up
            </Typography>
            <form className={classes.form} noValidate onSubmit={handleRegFormSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="fname"
                        name="name"
                        variant="outlined"
                        required
                        fullWidth
                        id="firstName"
                        label="Name"
                        autoFocus
                        onChange={handleRegFormChange}
                        value={regForm.name}
                        error={regForm.nameError === '' ? false : true}
                        helperText={regForm.nameError}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        onChange={handleRegFormChange}
                        value={regForm.email}
                        error={regForm.emailError === '' ? false : true}
                        helperText={regForm.emailError}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handleRegFormChange}
                        value={regForm.password}
                        error={regForm.passwordError === '' ? false : true}
                        helperText={regForm.passwordError}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        name="groupName"
                        label="Group Name"
                        type="text"
                        id="groupName"
                        autoComplete="group-name"
                        onChange={handleRegFormChange}
                        value={regForm.groupName}
                        error={regForm.groupNameError === '' ? false : true}
                        helperText={regForm.groupNameError}
                    />
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
                Sign Up
            </Button>
            <Grid container justify="flex-end">
                <Grid item>
                <Link href="#" variant="body2" onClick={() => setGuestToggle(prevState => !prevState)}>
                    Already have an account? Sign in
                </Link>
                </Grid>
            </Grid>
            </form>
        </div>
        {/* <Box mt={5}>
            <Copyright />
        </Box> */}
        </Container>
        </>
    )
}
