import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';

import { UserAndTokenContext } from './App'

export default function PrivateRoute({ component: Component, ...rest }) {
    
  const { user } = useContext(UserAndTokenContext)

  return(
    <Route {...rest} render={(props) => {
        if (user.loggedInStatus === true) {
            return (<Component {...props} />)
        } else {
            return (<Redirect to="/" />)
        }
    }} 
    />
  );
}