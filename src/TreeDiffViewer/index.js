import React, { useState } from 'react'

import {
  AppBar,
  Box,
  Tabs,
  Tab,
  Typography
} from '@material-ui/core'

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { styled } from '@material-ui/styles'

// import styles from './index.css'

// import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

import { compare, updateDoses } from './logic';

const MyBox = styled(Box)({
  height: 'calc(100vh - 150px)',
});

// const TreeDiff = (props) => {
//   const { past, current, options } = props

//   if (options.baseKeyMap) {
//     options.baseKeys = options.baseKeys.map((baseKey) => (options.baseKeyMap[baseKey] ? options.baseKeyMap[baseKey] : baseKey))
//   }

//   const diffString = compare(past, current, options);

//   const getRowHeight = ({ index }) => {
//     const characterCount = 72;
//     return 30 * Math.ceil(Math.max(
//       diffString.left[index].length / characterCount,
//       diffString.right[index].length / characterCount
//     ));
//   }

//   const rowRenderer = ({ key, index, style }) => {
//     const newStyles = {
//       marker: {
//         width: '10px',
//         textAlign: 'center',
//         height: '30px'
//       },
//       content: {
//         width: '400px'
//       },
//       diffContainer: {
//         whiteSpace: 'nowrap',
//         pre: {
//           wordBreak: 'break-all',
//           lineHeight: '30px'
//         }
//       },
//       wordDiff: {
//         paddingTop: 0,
//         paddingBottom: 0,
//         lineHeight: '30px',
//         display: 'inline'
//       }
//     };
//     return (
//       <div key={key} style={style}>
//         <ReactDiffViewer
//           styles={newStyles}
//           oldValue={diffString.left[index]}
//           newValue={diffString.right[index]}
//           splitView={true}
//           compareMethod={DiffMethod.WORDS}
//           hideLineNumbers={true}
//           showDiffOnly={false}
//         />
//       </div>
//     );
//   }

//   return (
//     <AutoSizer>
//       {({ width, height }) => (
//         <List
//           className={styles.List}
//           height={height}
//           rowCount={diffString.left.length}
//           rowHeight={getRowHeight}
//           rowRenderer={rowRenderer}
//           width={width}
//         />
//       )}
//     </AutoSizer>
//   )
// }

const TreeDiff = (props) => {
  const { past, current, options } = props

  if (options.baseKeyMap) {
    options.baseKeys = options.baseKeys.map((baseKey) => (options.baseKeyMap[baseKey] ? options.baseKeyMap[baseKey] : baseKey))
  }

  const diffString = compare(past, current, options);
  
  const rows = [];
  const newStyles = {
      marker: {
          width: '10px',
          textAlign: 'center',
          height: '30px'
      },
      content: {
          width: '400px'
      },
      diffContainer: {
          whiteSpace: 'nowrap',
          pre: {
              wordBreak: 'break-all',
              lineHeight: '30px'
          }
      },
      wordDiff: {
          paddingTop: 0,
          paddingBottom: 0,
          lineHeight: '30px',
          display: 'inline'
      }
  };

  for (let index = 0; index < 100; index++) {
      rows.push(
          <div key={index}>
              <ReactDiffViewer
                  styles={newStyles}
                  oldValue={diffString.left[index]}
                  newValue={diffString.right[index]}
                  splitView={true}
                  compareMethod={DiffMethod.WORDS}
                  hideLineNumbers={true}
                  showDiffOnly={false}
              />
          </div>
      );
  }

  return (
      <div className="tree-container">
          {rows}
      </div>
  )
}

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

const TreeDiffViewer = (props) => {
  const [value, setValue] = useState(0)
  const { past, current, options } = props;

  updateDoses(past);
  updateDoses(current);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
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
          options={options} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TreeDiff
          past={past.fields}
          current={current.fields}
          options={options} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <TreeDiff
          past={past.alerts}
          current={current.alerts}
          options={options} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <TreeDiff
          past={past.doses}
          current={current.doses}
          options={{
            ...options,
            ignoreKeys: [
              ...options.ignoreKeys,
              'doseName'
            ],
            baseKeyMap: {
              fieldName: 'doseName'
            }
          }} />
      </TabPanel>
    </React.Fragment>
  )
}

export default TreeDiffViewer