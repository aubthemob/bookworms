import { createMuiTheme } from '@material-ui/core/styles'
import { blue, green, red } from '@material-ui/core/colors'

const theme = createMuiTheme({
    palette: {
        primary: blue,
        secondary: green,
        warning: red,
    },
    status: {
        danger: red
    },
    typography: {
        fontFamily: 'Nunito, Arial, sans-serif',
        fontWeightRegular: 400,
        fontSize: 14
    }
})

export default theme