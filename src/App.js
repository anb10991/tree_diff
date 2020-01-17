import React, { useState, useEffect } from 'react'
import queryString from 'query-string';
import './App.css'

import {
  Container,
  Grid,
  Box,
  Paper,
  TextField,
  FormControlLabel,
  FormGroup,
  Checkbox
} from '@material-ui/core'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import blue from '@material-ui/core/colors/blue'

import TreeDiffViewer from './TreeDiffViewer'
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


function App() {
  const [past, setPast] = useState(null)
  const [current, setCurrent] = useState(null)
  const [threshold, setThreshold] = useState(0.9)
  const [ignoreMandatory, setIgnoreMandatory] = useState(false)
  const [ignorePosition, setIgnorePosition] = useState(false)
  const [ignoreExport, setIgnoreExport] = useState(false)
  const [collapsedNew, setCollapsedNew] = useState(true)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const parsed = queryString.parse(document.location.search);
    const { leftVersionUrl, rightVersionUrl } = parsed;
    if (leftVersionUrl && rightVersionUrl) {
      let decodedUrlLeft;
      let decodedUrlRight;
      try {
        decodedUrlLeft = decodeURI(leftVersionUrl);
        decodedUrlRight = decodeURI(rightVersionUrl);
      } catch (ex) {
        alert("Urls are invalid.");
      }
      setIsLoading(true);
      const fetchLeft = fetch(decodedUrlLeft).then(res => {
        return res.json();
      });
      const fetchRight = fetch(decodedUrlRight).then(res => {
        return res.json();
      });
      Promise.all([fetchLeft, fetchRight])
        .then(([leftJson, rightJson]) => {
          setPast(leftJson.result);
          setCurrent(rightJson.result);
        })
        .catch(() => {
          alert("An error has happened during fetching metadata.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const handleCheckboxChange = name => event => {
    switch (name) {
      case 'ignoreMandatory':
        setIgnoreMandatory(event.target.checked);
        break;
      case 'ignorePosition':
        setIgnorePosition(event.target.checked);
        break;
      case 'ignoreExport':
        setIgnoreExport(event.target.checked);
        break;
      case 'collapsedNew':
        setCollapsedNew(event.target.checked);
        break;
      default:
        break;
    }
  };

  const baseKeys = ['name', 'fieldName', 'tabName', 'controlTitle', 'containerTitle'];
  const ignoreKeys = ['id', 'fieldId', 'parentFieldId', 'tabId', 'metadataVersion', 'version',
    ignoreMandatory ? 'mandatory' : null, ignorePosition ? 'position' : null,
    ignoreExport ? 'export' : null].filter(e => e !== null);

  return (
    <MuiThemeProvider theme={myTheme}>
      <Container className="full-width">
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
          <FormGroup row>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={ignoreMandatory}
                  onChange={handleCheckboxChange('ignoreMandatory')}
                  value="ignoreMandatory"
                  color="primary" />
              }
              label="Ignore Mandatory"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={ignorePosition}
                  onChange={handleCheckboxChange('ignorePosition')}
                  value="ignorePosition"
                  color="primary" />
              }
              label="Ignore Position"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={ignoreExport}
                  onChange={handleCheckboxChange('ignoreExport')}
                  value="ignoreExport"
                  color="primary" />
              }
              label="Ignore Export"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={collapsedNew}
                  onChange={handleCheckboxChange('collapsedNew')}
                  value="collapsedNew"
                  color="primary" />
              }
              label="Collapse new/deleted nodes"
            />
          </FormGroup>
        </Paper>
        <MyBox>
          {
            (past && current) &&
            <TreeDiffViewer
              past={past}
              current={current}
              options={{
                baseKeys: baseKeys,
                ignoreKeys: ignoreKeys,
                threshold: threshold,
                collapsedNew: collapsedNew
              }} />
          }
          {
            (!past || !current) && !isLoading &&
            <span>Open at least two files to compare</span>
          }
          {isLoading && <h1>Loading metadata...</h1>}
        </MyBox>
      </Container>
    </MuiThemeProvider>
  )
}

export default App
