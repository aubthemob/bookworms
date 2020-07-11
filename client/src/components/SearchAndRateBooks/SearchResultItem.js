import React, { useContext } from 'react'

import { AddBookFormContext } from './AddBookForm'

export default function SearchResultItem(props) {
    const {
        id,
        bookTitle,
        image,
        author,
        avgRating,
    } = props

    const { 
        form,
        setForm,
        searchResultSelected, 
        setSearchResultSelected,
    } = useContext(AddBookFormContext)

    return (
        <>
            <tr
                value={bookTitle}
                onClick={() => { // when user clicks on the search result, the form value and the searchResultSelected value change accordingly 
                    if (searchResultSelected === '') {
                        setForm({ ...form, bookTitle })
                        setSearchResultSelected(id)
                    } else if (searchResultSelected !== '' && searchResultSelected !== id) {
                        setForm({ ...form, bookTitle })
                        setSearchResultSelected(id)
                    } else if (searchResultSelected === id) {
                        setSearchResultSelected('')
                    }
                }}
            >
                <td
                    className={ searchResultSelected !== id ? "non-selected-search-result-image" : ""}
                >
                    <img src={image} alt={bookTitle + "book cover"} />
                </td>
                <td
                    className={ searchResultSelected !== id ? "non-selected-search-result-text" : ""}
                >
                    {bookTitle}
                </td>
                <td
                    className={ searchResultSelected !== id ? "non-selected-search-result-text" : ""}
                >
                    {author}
                </td>
                <td
                    className={ searchResultSelected !== id ? "non-selected-search-result-text" : ""}
                >
                    {avgRating}/5
                </td>
            </tr>
        </>
    )
}
