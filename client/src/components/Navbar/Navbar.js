import React, { useContext, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

// Components
import CreateGroup from './CreateGroup'

// Contexts
import { UserAndTokenContext, GroupsContext, BookContext } from '../App'

// Style imports
import { AppBar, Toolbar, Typography, IconButton, makeStyles, Menu, MenuItem, Modal } from '@material-ui/core'
import PersonIcon from '@material-ui/icons/Person';
import theme from '../../styles/theme'

// Custom styles classes
const useStyles = makeStyles({ // --> fix the border after a button click!
    menuButtonStyle: {
        flex: 0 
    },
    appBarRightButtons: { 
        marginLeft: 'auto'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    navLink: {
        color: 'white',
        padding: 12
    },
    navLinkDiv: {
        color: 'white',
        padding: 12,
        marginLeft: 24
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold'
    }
})

export default function Navbar() {
    const [profileMenu, setProfileMenu] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    const { user, setUser, setToken } = useContext(UserAndTokenContext)
    const { setGroups, setCurrentGroup } = useContext(GroupsContext)
    const { setBooks } = useContext(BookContext)

    const classes = useStyles()

    const history = useHistory()

    function handleLogout() {
        localStorage.removeItem('accessToken') // do we really need to remove the token from local storage?
        setToken(null)
        setUser({ _id: '', name: '', loggedInStatus: false })
        setGroups(null)
        setCurrentGroup(null)
        setBooks('')
        history.push('/')
        setProfileMenu(null)
    }

    function handleProfileMenuOpen(event) {
        setProfileMenu(event.currentTarget)
    }

    function handleProfileMenuClose() {
        setProfileMenu(null)
    }

    function handleModelOpen() {
        setModalOpen(true)
    }

    function handleModalClose() {
        setModalOpen(false)
    }
    
    return (
        <>
            { 
                user.loggedInStatus && 
                <>
                <AppBar position="static">
                    <Toolbar>
                        <Typography color="inherit" variant="h6" className={classes.title}>Bookworms</Typography>

                            <Link to='/'>
                                <Typography className={classes.navLinkDiv}>Books</Typography>
                            </Link>
                            
                            <Link to='/calendar'>
                                <Typography className={classes.navLink}>Calendar</Typography>
                            </Link>

                        { user.loggedInStatus && 
                            <div className={classes.appBarRightButtons}>
                                <IconButton 
                                    color="inherit"
                                    onClick={handleProfileMenuOpen}
                                >
                                    <PersonIcon />
                                </IconButton> 
                                <Menu
                                    id="profile-menu"
                                    anchorEl={profileMenu}
                                    keepMounted
                                    open={Boolean(profileMenu)}
                                    onClose={handleProfileMenuClose}
                                >
                                    <MenuItem onClick={handleModelOpen}>Create a Group</MenuItem> 
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </div>
                        }
                    </Toolbar>
                </AppBar> 
                
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    className={classes.modal}
                >
                    <CreateGroup handleModalClose={handleModalClose} handleProfileMenuClose={handleProfileMenuClose} />
                </Modal>
            
            </>

            }
        </>
    )
}
