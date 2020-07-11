import React, { useState, useContext } from 'react'
import { BookContext } from '../App'

// Components
import BookCard from './BookCard'
import CurrentGroup from './CurrentGroup'

// Styles
import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { grey } from '@material-ui/core/colors'

const useStyles = makeStyles(() => ({
    subtitle: {
        paddingTop: 50,
        paddingBottom: 50,
    },
    emptyGrid: {
        color: grey
    }
  }));

export default function BookGrid() { 
    const [editSelected, setEditSelected] = useState('')

    const { books } = useContext(BookContext)

    const classes = useStyles()

    function enterEdit(_id) {
        setEditSelected(_id)
    }

    return (
        <>
            <Grid container direction="row" justify="space-between" alignItems="center">
                <Grid item>
                    <Typography
                        variant="h4"
                        color="primary"
                        className={classes.subtitle}
                    >
                        Proposed Books
                    </Typography>
                </Grid>
                <Grid item>
                    <CurrentGroup />
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={8} alignItems="stretch">
                {books.length !== 0 && books.map(b => {
                    return (
                        <Grid item sm={12} md={4} key={b.book._id} >
                            <BookCard editSelected={editSelected} setEditSelected={setEditSelected} enterEdit={enterEdit} key={b._id} {...b} />
                        </Grid>
                    )
                })}
                
            </Grid>
        </>
    )
}
