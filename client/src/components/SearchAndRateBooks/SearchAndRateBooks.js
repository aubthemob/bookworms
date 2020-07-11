import React from 'react'

// Components
import BookGrid from './BookGrid'
import AddBookForm from './AddBookForm'

export default function SearchAndRateBooks() {
    return (
        <>
            <AddBookForm />
            <BookGrid />
        </>
    )
}
