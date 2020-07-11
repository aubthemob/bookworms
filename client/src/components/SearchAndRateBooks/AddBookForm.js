import React, { useState, useContext, useEffect } from 'react'
import Axios from 'axios'

// Styles imports
import { Button, TextField, Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

// Components
import GoodreadsSearch from './GoodreadsSearch'

// Contexts
import { BookContext, GroupsContext, UserAndTokenContext } from '../App'

export const AddBookFormContext = React.createContext()

const useStyles = makeStyles((theme) => ({
    bigSearchBar: {
      width: 300,
    },
    container: {
        paddingTop: 50,
    },
    subtitle: {
        paddingTop: 50
    },
    button: {
        margin: 20
    }
  }));

export default function AddBookForm() {
    const [form, setForm] = useState({ bookTitle: '', userRating: '' })
    const [searchResultSelected, setSearchResultSelected] = useState('')
    const [results, setResults] = useState([])
    const [goodreadsInfo, setGoodreadsInfo] = useState({})

    const { books, setBooks } = useContext(BookContext)
    const { user } = useContext(UserAndTokenContext)
    const { currentGroup } = useContext(GroupsContext)

    const classes = useStyles()

    useEffect(() => {
        setGoodreadsInfo(results.filter(i => i.id === searchResultSelected)[0])
    }, [searchResultSelected, results])

    async function handleBookAdd(e) {
        e.preventDefault()
        const submission = { ...goodreadsInfo, userId: user._id, groupId: currentGroup.groupId }
        try {
            const newData = await Axios.post(`/api/add-book`, submission)
            setBooks(prevState => [newData.data, ...prevState])
            setForm({bookTitle: ''})
            setSearchResultSelected('')
            setResults([])
        } catch (err) {
            console.log(err)
        }
    }
    
    function handleFormChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    // Contexts

    const addBookFormContextValue = {
        form,
        setForm,
        searchResultSelected, 
        setSearchResultSelected,
    }

    return (
        <>
            <Typography
                variant="h4"
                color="primary"
                className={classes.subtitle}
            >
                Search Books
            </Typography>

            <Grid container direction="column">
                <form onSubmit={handleBookAdd} autoComplete="off">
                <Grid container direction="row" justify="space-evenly" alignItems="center" className={classes.container} >
                    <Grid item md={2} />
                    <Grid item md={6}>
                        <TextField 
                            id="standard-basic" 
                            label="Search" 
                            type="text"
                            name="bookTitle" 
                            size="medium"
                            fullWidth={true}
                            value={form.bookTitle} 
                            onChange={handleFormChange}
                            autoFocus={ books === [] ? true : false }
                        />
                    </Grid>
                    <Grid item md={2}>
                    <Button 
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.button}
                        disabled={ searchResultSelected === '' ? true : false }
                    >
                        ADD BOOK
                    </Button>
                    </Grid>
                    <Grid item md={2} />
                </Grid>
                </form>
                <Grid container alignItems="center" direction="column" className={classes.container} >
                    <Grid item xs={1} />
                        <Grid item xs={10}>
                        { form.bookTitle !== '' && <div className="over">
                            <div>
                                <AddBookFormContext.Provider value={addBookFormContextValue}>
                                    <GoodreadsSearch results={results} setResults={setResults} />
                                </AddBookFormContext.Provider>
                            </div> 
                        </div> }
                        </Grid>
                    <Grid item xs={1} />
                </Grid>
            </Grid>
        </>
    )
}
