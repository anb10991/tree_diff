import React, { useState } from 'react'
import './App.css'

import { Container, Grid, Box, AppBar, Tabs, Tab, Typography, Paper, TextField } from '@material-ui/core'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import blue from '@material-ui/core/colors/blue'

import TreeDiff from './TreeDiff'
import ImportFromFileBody from './ImportFromFileBody'
import { styled } from '@material-ui/styles'

const myTheme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: lightBlue,
  }
});

const MyBox = styled(Box)({
  height: 'calc(100vh - 150px)',
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <MyBox p={3}>{children}</MyBox>}
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [past, setPast] = useState(null)
  const [current, setCurrent] = useState(null)
  const [value, setValue] = useState(0)
  const [threshold, setThreshold] = useState(0.9)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <MuiThemeProvider theme={myTheme}>
      <Container>
        <Paper>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <ImportFromFileBody
              label="Select left file to compare..."
              updateContent={setPast} />
            <ImportFromFileBody
              label="Select right file to compare..."
              updateContent={setCurrent} />
          </Grid>
        </Paper>
        <Paper>
          <TextField
            id="standard-number"
            label="Threshold"
            type="number"
            inputProps={{
              step: 0.1
            }}
            value={threshold}
            onChange={(event) => { setThreshold(event.target.value) }}
          />
        </Paper>
        <MyBox>
          {
            (past && current) &&
            <React.Fragment>
              <AppBar position="static">
                <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                  <Tab label="Categories" {...a11yProps(0)} />
                  <Tab label="Fields" {...a11yProps(1)} />
                  <Tab label="Alerts" {...a11yProps(2)} />
                  <Tab label="Doses" {...a11yProps(3)} />
                </Tabs>
              </AppBar>
              <TabPanel value={value} index={0}>
                <TreeDiff
                  past={past.categories}
                  current={current.categories}
                  options={{
                    baseKeys: ['name', 'fieldName', 'tabName', 'controlTitle', 'containerTitle', 'info'],
                    ignoreKeys: ['id', 'fieldId', 'parentFieldId', 'tabId', 'metadataVersion', 'version'],
                    threshold: threshold,
                  }} />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <TreeDiff
                  past={past.fields}
                  current={current.fields}
                  options={{
                    baseKeys: ['name', 'fieldName', 'tabName', 'controlTitle', 'containerTitle', 'info'],
                    ignoreKeys: ['id', 'fieldId', 'parentFieldId', 'tabId', 'metadataVersion', 'version'],
                    threshold: threshold,
                  }} />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <TreeDiff
                  past={past.alerts}
                  current={current.alerts}
                  options={{
                    baseKeys: ['name', 'fieldName', 'tabName', 'controlTitle', 'containerTitle', 'info'],
                    ignoreKeys: ['id', 'fieldId', 'parentFieldId', 'tabId', 'metadataVersion', 'version'],
                    threshold: threshold,
                  }} />
              </TabPanel>
              <TabPanel value={value} index={3}>
                <TreeDiff
                  past={past.doses}
                  current={current.doses}
                  options={{
                    baseKeys: ['name', 'fieldName', 'tabName', 'controlTitle', 'containerTitle', 'info'],
                    ignoreKeys: ['id', 'fieldId', 'parentFieldId', 'tabId', 'metadataVersion', 'version'],
                    threshold: threshold,
                  }} />
              </TabPanel>
            </React.Fragment>
          }
          {
            (!past || !current) &&
            <span>Open at least two files to compare</span>
          }
        </MyBox>
      </Container>
    </MuiThemeProvider>
  )
}

export default App
