// React imports
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

// Other imports
import Axios from 'axios'
import jwt from 'jsonwebtoken'

// Styles imports
import { Grid, Typography } from '@material-ui/core'

// Components
import Navbar from './Navbar/Navbar'
import HomeGuest from './HomeGuest/HomeGuest'
import Calendar from './Calendar/Calendar'
import SearchAndRateBooks from './SearchAndRateBooks/SearchAndRateBooks'

// Containers
import PrivateRoute from './PrivateRoute'
import CallbackRoute from './CallbackRoute'

// Contexts
export const BookContext = React.createContext()
export const UserAndTokenContext = React.createContext()
export const GroupsContext = React.createContext()

// Axios.defaults.baseURL = process.env.baseURL || 'http://localhost:5000'

// Interceptor to send Auth token --> should probably be in another file
let testVar
Axios.interceptors.request.use(
  config => {
    const { origin } = new URL(config.url)
    testVar = config
    const allowedOrigins = ['https://bookworms-rocks.herokuapp.com/', 'http://localhost:5000'] 
    const accessToken = localStorage.getItem('accessToken') 

    if (allowedOrigins.includes(origin)) {
      config.headers.authorization = `Bearer ${accessToken}`
    }
    return config
  },
  err => {
    return Promise.reject(`promise rejection: ${err}`)
  }
)

function App() {
  const [books, setBooks] = useState([])
  const [token, setToken] = useState(null)
  const [user, setUser] = useState({ _id: '', name: '', loggedInStatus: false })
  const [groups, setGroups] = useState(null)
  const [currentGroup, setCurrentGroup] = useState(null)
  const [testVarState, setTestVarState] = useState(testVar)

  // Setting the token value if there is a valid one in local storage. Else, remove the to token
  useEffect(() => {
    if (localStorage.getItem('accessToken') !== null) {
      const { exp } = jwt.decode(localStorage.getItem('accessToken'))
      if (exp>Math.floor(Date.now()/1000)) {
        setToken(localStorage.getItem('accessToken'))
      } else {
        localStorage.removeItem('accessToken') // do we really need to remove the token from local storage?
        setToken(null)
      }
    }
  }, [])

  // Setting user state on token change
  useEffect(() => {
    if (token !== null) {
      const { _id, name, exp, email, nylasToken } = jwt.decode(token)
      setUser({
        _id,
        name,
        email,
        loggedInStatus: exp>Math.floor(Date.now()/1000) ? true : false,
        nylasToken
      })  
    }
  }, [token])

  // get groups for the logged in user
  useEffect(() => {
    if (groups === null && user._id !== '') {
      getGroups()
    } 
  }, [user, groups, setGroups])

  useEffect(() => {
    if (groups) {
      setCurrentGroup(groups[0])
    }
  }, [groups])

  // getting books from the server 
  useEffect(() => {
    async function getBooks() {
      try {
        if (currentGroup) {
          const { data } = await Axios.get(`/api/books/${currentGroup.groupId}/${user._id}`)
          setBooks(data.reverse())
        }
      } catch(err) {
        console.log(err)
      }
    }
    if (groups !== null) {
      getBooks()
    }
  }, [currentGroup, groups, user._id])

  // Handlers
  async function handleBookDelete(_id) {
    console.log('DELETE book called')
    let newBooks = [...books]
    const index = newBooks.findIndex(book => book._id === _id)
    newBooks = newBooks.filter(book => book !== newBooks[index])
    setBooks(newBooks)
    try {
        await Axios({
            method: 'DELETE',
            url: `/api/delete-book/${_id}`
        })
    } catch (err) {
        console.log(err)
    }
  }

  async function getGroups() {
    try {
      const { data } = await Axios.get(`/api/groups/${user._id}`)
      setGroups(data)
    } catch(err) {
      console.log(err)
    }
  }

  // Contexts
  const bookContextValue = {
    books, 
    setBooks,
    handleBookDelete
  }

  const userAndTokenContextValue = {
    token,
    setToken,
    user, 
    setUser
  }

  const groupsContextValue = {
    groups,
    setGroups,
    getGroups,
    currentGroup,
    setCurrentGroup
  }

  return (
    <BrowserRouter>
      <UserAndTokenContext.Provider value={userAndTokenContextValue} >
        <GroupsContext.Provider value={groupsContextValue}>
          <BookContext.Provider value={bookContextValue}>
            <Grid container direction="column" >
              <Grid item xs={12}>
                <Navbar />
              </Grid>
              <Switch>
                <Route path='/' exact>
                  <Grid item container>
                    <Grid item sm={2} />
                    <Grid item sm={8} >
                        { !user.loggedInStatus && <HomeGuest />}
                        <PrivateRoute component={SearchAndRateBooks} />
                          <pre>{JSON.stringify(testVarState)}</pre>
                    <Grid item sm={2} />
                  </Grid>
                  </Grid>
                </Route>
                <Route path='/calendar' exact>
                  <Grid item container>
                    <Grid item sm={2} />
                    <Grid item sm={8} >
                        { !user.loggedInStatus && <HomeGuest />}
                        <PrivateRoute component={Calendar} />
                    <Grid item sm={2} />
                  </Grid>
                  </Grid>
                </Route>
                <Route path='/nylas-auth-callback' exact>
                  <Grid item container>
                    <Grid item sm={2} />
                    <Grid item sm={8} >
                        { !user.loggedInStatus && <HomeGuest />}
                        <CallbackRoute />
                    <Grid item sm={2} />
                  </Grid>
                  </Grid>
                </Route>
              </Switch>
            </Grid>
          </BookContext.Provider>
        </GroupsContext.Provider>
      </UserAndTokenContext.Provider>
    </BrowserRouter>
  );
}

export default App;
