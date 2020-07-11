import React, { useState, useContext } from 'react'
import Axios from 'axios'

// Contexts
import { UserAndTokenContext } from '../App'

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
import { Alert } from '@material-ui/lab'

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

export default function NavbarLoggedOut({ setGuestToggle }) {
    const [loginForm, setLoginForm] = useState({ email: '', password: '', error: '' })
    
    const { setToken } = useContext(UserAndTokenContext)

    const classes = useStyles()

    function handleLoginFormChange(e) {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
    }

    // login
    async function handleLoginFormSubmit(e) {
        e.preventDefault()
        try {
            const { data, status } = await Axios.post(`/api/login`, loginForm) // returns jwt
            if (data !== null && status !== 401) {
                localStorage.setItem('accessToken', data.accessToken) // use localstorage to store JWT
                setToken(data.accessToken)
                // setUser({...user, loggedInStatus: true}) 
                setLoginForm({ email: '', password: '' })
            }
        } catch (err) {
            if (err.response.status === 401) {
                setLoginForm(prevState => {
                    return {
                        ...prevState,
                        error: 'Credentials do not match'
                    }
                })
            } else {
                setLoginForm(prevState => {
                    return {
                        ...prevState,
                        error: 'An error occurred. Please try again.'
                    }
                })
            }
        }
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
            Sign In
            </Typography>
            <form className={classes.form} noValidate onSubmit={handleLoginFormSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleLoginFormChange}
                        value={loginForm.email}
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
                        onChange={handleLoginFormChange}
                        value={loginForm.password}
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
                Login
            </Button>
            {
                loginForm.error !== '' &&
                <Alert severity="error">
                    {loginForm.error}
                </Alert>
            }
            <Grid container justify="flex-end">
                <Grid item>
                <Link href="#" variant="body2" onClick={() => setGuestToggle(prevState => !prevState)}>
                    No account yet? Sign up
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