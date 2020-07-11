import React from 'react'

import { IconButton, Typography, Grid, makeStyles, Box } from '@material-ui/core'
import { ArrowLeft, ArrowRight, Today } from '@material-ui/icons'

const useStyles = makeStyles({
    currentWeek: {
        fontSize: '12px',
        font: 'Roboto',
        fontWeight: 'bold',
        color: '#747474',
        padding: 0,
        margin: 0
    }
})

export default function CalendarToolbar(props) {

    const classes = useStyles()

    return (
        <>
            <Box pt={2} pb={1} >
                <Grid container direction="row" alignItems="center" justify="flex-end">
                    <Grid item>
                        <IconButton
                            onClick={() => props.onNavigate('TODAY')}
                        >
                            <Today />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <IconButton
                            onClick={() => props.onNavigate('PREV')}
                        >
                            <ArrowLeft />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <Typography
                            className={classes.currentWeek}
                        >
                            {props.label}
                        </Typography>
                    </Grid>
                    <Grid>
                        <IconButton
                            onClick={() => props.onNavigate('NEXT')}
                        >
                            <ArrowRight/>
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}
