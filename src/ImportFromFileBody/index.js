import React from 'react'
import { Box } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'

const MyBox = styled(Box)({
    width: '50%',
    display: 'flex',
    justifyContent: 'center'
});

const ImportFromFileBody = (props) => {
    let fileReader

    const handleFileRead = (e) => {
        const content = fileReader.result
        props.updateContent(JSON.parse(content))
    }

    const handleFileChosen = (file) => {
        fileReader = new FileReader()
        fileReader.onloadend = handleFileRead
        fileReader.readAsText(file)
    }
    return (
        <MyBox>
            <input type='file'
                id='file'
                className='input-file'
                accept='.json'
                onChange={e => handleFileChosen(e.target.files[0])}
            />
        </MyBox>
    )
}

export default ImportFromFileBody