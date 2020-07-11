import React, { useContext } from 'react'
import Axios from 'axios'
import { BookContext, UserAndTokenContext, GroupsContext } from '../App'

// Styles imports
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Rating from '@material-ui/lab/Rating';
import DeleteIcon from '@material-ui/icons/Delete';

import update from 'immutability-helper'

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 275,
    },
    media: {
      height: 0,
    //   paddingTop: '56.25%', // 16:9
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      width: 40,
      height: 60
    },
    cardActions: {
      padding: 10
    },
    deleteButton: {
      color: 'grey',
      marginBottom: 8
    }
  }));

export default function BookCard(props) {
    const {
        _id, // document ID
        book,
        ratings,
        userAdder,
    } = props

    const { books, setBooks, handleBookDelete } = useContext(BookContext) 
    const { user } = useContext(UserAndTokenContext) 
    const { currentGroup } = useContext(GroupsContext)

    const classes = useStyles()
    
    async function handleChangeRating(event, newValue) { 
      const userRating = ratings.find(r => r.userRater === user._id) && ratings.find(r => r.userRater === user._id)
      const ratingId = userRating ? userRating._id : null

      const submission = { 
        groupId: currentGroup.groupId, 
        userId: user._id,
        bookId: book._id,
        userRating: newValue,
        ratingId
      }

      const bookIndex = books.findIndex(b => b.book._id === book._id)

      if (ratingId) {
        try {
          const { data } = await Axios.put(`/api/rating/${currentGroup.groupId}/${book._id}/${ratingId}`, submission)
          const newBooks = update(books, {
            [bookIndex]: { ratings: { 0: { $set: data } } }
          })
          setBooks(newBooks)
        } catch(err) {
            console.log(err)
        }
      } else {
        try {
          const { data } = await Axios.post(`/api/rating`, submission)
          const newBooks = update(books, {
            [bookIndex]: { ratings: { 0: { $set: data } } }
          })
          setBooks(newBooks)
        } catch(err) {
            if (err.response.status === 400) {
              console.log(err.response.data.message) // temporary
            }
        }
      }
    }

    return (
        <>
            <Card className={classes.root} >
                <CardHeader
                    avatar={
                    <Avatar 
                      aria-label="image" 
                      src={book.imageUrl && book.imageUrl}
                      variant="rounded"
                      className={classes.avatar}
                      // sizes="50"
                    />
                    }
                    title={book.bookTitle}
                    subheader={book.author}
                    />
                    <CardMedia
                        className={classes.media}
                        image={book.imageUrl && book.imageUrl}
                    />
                    <CardContent>
                        <Typography variant="body2" color="textSecondary" component="p">
                        {book.goodreadsDescription.length < 250? book.goodreadsDescription : book.goodreadsDescription.slice(0,250)+'...'}
                        </Typography>
                    </CardContent>
                    <div className={classes.cardActions}>
                      <Grid container alignItems="center" direction="row" justify="space-between">
                        <Grid item >
                          <Rating 
                            name={"rating_"+book._id}
                            value={ratings[0] && ratings[0].rating}
                            onChange={(e, newValue) => handleChangeRating(e, newValue)}
                          />
                        </Grid>
                        { userAdder._id === user._id && 
                          <Grid item >
                            <IconButton 
                              aria-label="delete-button" 
                              color="inherit"
                              onClick={() => handleBookDelete(_id)}
                              className={classes.deleteButton}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        }
                      </Grid>
                    </div>
            </Card>
        </>
    )
}