import React, { useEffect, useContext } from 'react'
import Axios from 'axios'

import 'bootstrap/dist/css/bootstrap.css';

// Components
import SearchResultItem from './SearchResultItem'

// Contexts
import { AddBookFormContext } from './AddBookForm'

const convert = require("xml-js") 

export default function GoodreadsSearch({ results, setResults }) {
    const { 
        form,
        searchResultSelected,
    } = useContext(AddBookFormContext)

    useEffect(() => {
        async function goodReadsSearch() {
            try {
                const res = await Axios.post(`/api/goodreadsSearch`, form)
                const data = JSON.parse(convert.xml2json(res.data, { compact: true, spaces: 2 }))
                const goodreadsResults = data.GoodreadsResponse.search.results.work
                const resultsParsed = goodreadsResults.map(i => {
                return { 
                    id: i.best_book.id._text,
                    bookTitle: i.best_book.title._text,
                    image: i.best_book.small_image_url._text,
                    author: i.best_book.author.name._text,
                    avgRating: i.average_rating._text
                }
                })
                setResults([...resultsParsed])
            } catch (err) {
                console.log(err)
            }
        }
        if (form.bookTitle !== '' && searchResultSelected === '') {
            goodReadsSearch()
        }
    }, [form, searchResultSelected, setResults])
    
    return (
        <div className="overflow-auto">
            <table className="table table-hover">
                <tbody>
                    { 
                        results.map (result => {
                            return <SearchResultItem key={result.id} {...result} results={results} setResults={setResults} />
                        }) 
                    }
                </tbody>
            </table>
        </div>
    )
}
