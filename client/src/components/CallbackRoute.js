import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom'

import Axios from 'axios'

import { UserAndTokenContext } from './App'

export default function CallbackRoute() {
    const { user, setUser } = useContext(UserAndTokenContext)

    const history = useHistory()

    useEffect(() => {
        async function nylasCallbackToken() {
            if (window.location.search.includes("code=")) {
                try {
                    const { data } = await Axios.post(`/api/nylas-auth-callback/${window.location.search}`, { userId: user._id })
                    const newUser = user
                    setUser({ ...newUser, ...data })
                } catch(err) {
                    console.log(err)
                }
            }
            history.push({
                pathname: '/calendar',
                search: ''
            })
        }
        
        if (user.loggedInStatus===true) {
            nylasCallbackToken()
        }

    }, [user, history, setUser])

    return(
        <>
        </>
    );
}