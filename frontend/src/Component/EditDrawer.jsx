import Box from '@mui/material/Box';
import { Children } from 'react';

function EditDrawer({ children }) {
    return (
        <Box className="rounded bg-gray-100 p-4">
        {
            Children.map(children, child =>
                child
            )
        }
        </Box>
    )
}

export default EditDrawer;