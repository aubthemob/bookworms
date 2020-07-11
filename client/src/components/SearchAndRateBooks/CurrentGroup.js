import React, { useContext } from 'react'

import { GroupsContext } from '../App'

import { FormControl, Select, MenuItem } from '@material-ui/core'

export default function CurrentGroup() {    
    const { groups, currentGroup, setCurrentGroup } = useContext(GroupsContext)

    return (
        <>
            {
                currentGroup &&
                    <FormControl>
                        <Select
                            labelId="select-current-group"
                            id="select-current-group"
                            value={ currentGroup }
                            defaultValue={ currentGroup }
                            onChange={e => setCurrentGroup(e.target.value)}
                        >

                        { 
                            groups && groups.map(g => {
                                return (
                                    <MenuItem key={g.groupId} value={g}>{g.groupName}</MenuItem>
                                )
                            })
                        }
                    </Select>
                </FormControl> 
            }
        </>
    )
}
