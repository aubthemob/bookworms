import React, { useContext, useEffect, useState } from 'react'
import Axios from 'axios'

// Styles
import { Chip, makeStyles, Grid, Popover, Paper, IconButton } from '@material-ui/core'
import { Schedule, CalendarToday, Close, Group, Delete } from '@material-ui/icons'
import Colors from '../../styles/Colors'

import {
    Calendar,
    momentLocalizer
} from 'react-big-calendar'
import moment from 'moment'
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Components
import CalendarToolbar from './CalendarToolbar'

// Context
import { UserAndTokenContext } from '../App'
import { GroupsContext } from '../App'

// Styles
import { Typography, Link } from '@material-ui/core'

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar);

const useStyles = makeStyles({
    paper: {
        minHeight: 200,
        minWidth: 250,
        padding: '15px 25px 25px'
    },
    smallPaper: {
        height: 20,
        width: 20,
    },
    close: {
        marginLeft: 'auto'
    },
    subtitle: {
        paddingTop: 50,
        paddingBottom: 50,
    }
})

export default function CalendarComponent() {
    const [nylasLink, setNylasLink] = useState('')
    const [events, setEvents] = useState([])
    const [draggedEvent, setDraggedEvent] = useState(null)
    const [popAnchorPos, setPopAnchorPos] = useState(null)
    const [popoverEvent, setPopoverEvent] = useState(null)

    const { user } = useContext(UserAndTokenContext)
    const { groups, setGroups } = useContext(GroupsContext)

    const classes = useStyles()

    useEffect(() => {
        async function getLink() {
            try {
                const { data } = await Axios.get(`/api/nylas-auth-connect/${user.email}`)
                setNylasLink(data.url)
            } catch(err) {
                console.log(err)
            } 
        }
        getLink()
    }, [user])

    useEffect(() => {
        const colors = Colors.slice(0, groups.length)
        setGroups(prevState => prevState.map((g, i) => {
            return {
                ...g, 
                hexColor: colors[i]
            }
        }))
    }, [setGroups])

    useEffect(() => {
        async function getFreeBusy() {
            try {
                const { data } = await Axios.get(`/api/calendar-freebusy/${user.email}/${user._id}`)
                const eventsToPush = data.map(e => {
                    return {
                        title: e.title,
                        start: e.when ? moment.unix(e.when.start_time).toDate() : moment.unix(e.startTimestamp).toDate(),
                        end: e.when ? moment.unix(e.when.end_time).toDate() : moment.unix(e.endTimestamp).toDate(),
                        calendarId: e.calendar_id ? e.calendar_id : undefined,
                        groupId: e.calendar_id ? undefined : e.groupId && groups.filter(g => e.groupId === g.groupId)[0].groupId,
                        groupName: e.calendar_id ? undefined : e.groupId && groups.filter(g => e.groupId === g.groupId)[0].groupName,
                        id: e.id ? e.id : e._id,
                        calendarSource: e.calendar_id ? 'nylas' : 'bookworms',
                        hexColor: e.calendar_id ? '#BCBCBC' : e.groupId && groups.filter(g => e.groupId === g.groupId)[0].hexColor
                    }
                })

                setEvents(eventsToPush)
            } catch(err) {
                console.log(err)
            } 
        }
        if(groups[0].hexColor) { getFreeBusy() }
    }, [groups, user._id, user.email])

    // Handlers
    function handleDragStart(event) {
        setDraggedEvent(event)
    }

    async function onDropFromOutside({ start, end, allDay }) {
        const event = {
          title: draggedEvent.title,
          groupId: draggedEvent.groupId,
          start, 
          end,
          isAllDay: allDay,
        }

        const reqBody = defineEventReqBody(event)
        const { data } = await Axios.post(`/api/event`, reqBody)

        const eventToPush = defineEventToPush(data)
        setEvents(prevState => [...prevState, eventToPush]) 
    }

    async function handleEventDrop({ event, start, end, isAllDay: droppedOnAllDaySlot }) {
        if(event.calendarSource === 'bookworms') {
            const idx = events.indexOf(event)
            let allDay = event.allDay

            // if (!event.allDay && droppedOnAllDaySlot) {
            //     allDay = true
            // } else if (event.allDay && !droppedOnAllDaySlot) {
            //     allDay = false
            // }

            const updatedEvent = { ...event, start, end, allDay }
            const nextEvents = [...events]
            nextEvents.splice(idx, 1, updatedEvent)
            setEvents(nextEvents)

            await modifyEvent(event, start, end)
        }
    }

    async function handleResizeEvent({ event, start, end }) {
        if(event.calendarSource === 'bookworms') {
            const nextEvents = events.map(e => {
                return (
                    e.id === event.id ?
                    { ...e, start, end } :
                    e
                )
            })
            setEvents(nextEvents)
            await modifyEvent(event, start, end)
        }
    }

    async function handleDeleteEvent(event) {
        const { status } = await Axios.delete(`/api/event/${event.id}`)
        
        if (status === 200) {
            handleClose()
            const nextEvents = events.filter(e => e.id !== event.id)
            setEvents(nextEvents)
            
        } else {
            console.log('Unable to delete event') // change
        }
    }

    // Helpers
    async function modifyEvent(event, start, end) {
        try {
            const reqBody = defineEventReqBody(event, start, end)
            const { status } = await Axios.put(`/api/event`, reqBody)
            if (status !== 200) {
                console.log('There was an error')
            }
        } catch(err) {
            console.log(err)
        }
    }

    function defineEventReqBody(event, start, end) {
        return { 
            title: event.title,
            groupId: event.groupId,
            start: start || event.start,
            end: end || event.end,
            userId: user._id,
            type: event.title.includes('reading') ? 'individual' : 'group',
            eventId: event.id ? event.id : null
        }
    }

    function defineEventToPush(data) {
        return {
            title: data.title,
            start: moment.unix(data.startTimestamp).toDate(),
            end: moment.unix(data.endTimestamp).toDate(),
            calendarSource: data.calendarSource,
            id: data._id,
            groupId: data.groupId,
            groupName: groups.filter(g => data.groupId === g.groupId)[0].groupName,
            hexColor: groups.filter(g => data.groupId === g.groupId)[0].hexColor
        }
    }

    // Styles functions
    function eventStyleGetter(event, start, end, isSelected) {
        const backgroundColor = event.hexColor;
        const style = {
            backgroundColor,
            borderRadius: '10px',
            color: 'white',
            borderWidth: '1px',
            borderColor: 'white',
            textAlign: 'top',
            display: 'block',
            fontSize: '14px'
        };
        return {
            style
        };
    }

    function chipStyleGetter(group) {
        const style = {
            backgroundColor: group.hexColor,
            color: 'white'
        }
        return style
    }
    
    function smallPaperStyleGetter(event) {
        const style = {
            backgroundColor: event.hexColor,
            minHeight: '12px',
            minWidth: '12px'
        }
        return style
    }

    // Popover handlers
    const handleClickEvent = (event, e) => {
        setPopAnchorPos({ left: e.clientX, top: e.clientY })
        setPopoverEvent(event)
    };

    const handleClose = () => {
        setPopAnchorPos(null)
        setPopoverEvent(null)
    };

    const open = Boolean(popAnchorPos);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>

            <Typography
                variant="h4"
                color="primary"
                className={classes.subtitle}
            >
                Calendar
            </Typography>
            
            { 
                !user.nylasToken && 
                <>
                    <Typography>Click <Link href={nylasLink} >here</Link> to sync your calendars.</Typography> 
                    <br /> 
                </>
            }

            <Grid container direction="row" spacing={2}>

            { groups.map((g, i) => {
                return (
                    <>
                        <Grid item>
                            <div
                                draggable="true"
                                onDragStart={() => handleDragStart({ title: `${g.groupName} reading session`, groupId: g.groupId })} // add detail to argument here
                                key={g.groupId+'_readingSession'}
                            >
                                <Chip 
                                label={`${g.groupName} reading session`}
                                style={chipStyleGetter(g)}
                                />
                            </div>
                        </Grid>
                        <Grid item>
                        <div
                            draggable="true"
                            onDragStart={() => handleDragStart({ title: `${g.groupName} group meeting`, groupId: g.groupId })}
                            key={g.groupId+'_groupMeeting'}
                        >
                            <Chip 
                                label={`${g.groupName} group meeting`}
                                style={chipStyleGetter(g)}
                            />
                        </div>
                        </Grid>
                    </>
                )
            })}

            </Grid>

            <DnDCalendar
                defaultDate={moment().toDate()}
                defaultView="week"
                events={events}
                localizer={localizer}
                onEventDrop={handleEventDrop}
                onDropFromOutside={onDropFromOutside}
                onEventResize={handleResizeEvent}
                eventPropGetter={eventStyleGetter}
                // dayPropGetter={dayPropGetter}
                // onSelectSlot={handleSelectSlot}
                onSelectEvent={handleClickEvent}
                resizable
                style={{ height: "75vh" }}
                views={['week']}
                popup
                components={{
                    toolbar: CalendarToolbar
                }}
            />  

            { popoverEvent !== null && 
            <Popover
                id={id}
                open={open}
                anchorReference="anchorPosition"
                anchorPosition={popAnchorPos}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                elevation={2}
            >
                <Paper className={classes.paper}>
                    <Grid container direction="row" justify="flex-end" alignItems="center">
                        <Grid item>
                            <IconButton onClick={() => handleDeleteEvent(popoverEvent)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={handleClose}>
                                <Close fontSize={'small'} />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Grid container direction="column" alignItems="space-between" spacing={1}>
                        <Grid item>
                            <Typography fontWeight="fontWeightMedium">{popoverEvent.title}</Typography>
                        </Grid>
                        <Grid container item direction="row" alignItems="center" spacing={2} >
                            <Grid item>
                                <CalendarToday />
                            </Grid>
                            <Grid item>
                                <Typography>{moment(popoverEvent.start).format("dddd, MMMM Do YYYY")}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item direction="row" alignItems="center" spacing={2} >
                            <Grid item>
                                <Schedule />
                            </Grid>
                            <Grid item>
                                <Typography>{moment(popoverEvent.start).format("h:mm a")}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item direction="row" alignItems="center" spacing={2} >
                            <Grid item>
                                <Group />
                            </Grid>
                            <Grid item>
                                <Paper style={smallPaperStyleGetter(popoverEvent)} elevation={0} />
                            </Grid>
                            <Grid item>
                                <Typography>{popoverEvent.groupName}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Popover>}
        </>
    )
}
