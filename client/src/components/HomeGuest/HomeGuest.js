import React, { useState } from 'react'

import SignUpForm from './SignUpForm'
import LoginForm from './LoginForm'

export default function Home() {
    const [guestToggle, setGuestToggle] = useState(true)

    return (
        <div>
            <div>
                { 
                    guestToggle === true ? 
                    <SignUpForm setGuestToggle={setGuestToggle} /> : 
                    <LoginForm setGuestToggle={setGuestToggle} /> 
                }
            </div>
        </div>
    )
}
