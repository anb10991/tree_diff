import React from 'react'

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

import styles from './index.css'

// import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

import { compare } from './logic';

const TreeDiff = (props) => {
    const { past, current, options } = props

    const diffString = compare(past, current, options);

    // const getRowHeight = ({ index }) => {
    //     const characterCount = 73;
    //     return 30 * Math.ceil(Math.max(
    //         diffString.left[index].length / characterCount,
    //         diffString.right[index].length / characterCount
    //     ));
    // }

    // const rowRenderer = ({ key, index, style }) => {
    //     const newStyles = {
    //         marker: {
    //             width: '10px',
    //             textAlign: 'center',
    //             height: '30px'
    //         },
    //         content: {
    //             width: '400px'
    //         },
    //         diffContainer: {
    //             whiteSpace: 'nowrap',
    //             pre: {
    //                 wordBreak: 'break-all',
    //                 lineHeight: '30px'
    //             }
    //         },
    //         wordDiff: {
    //             paddingTop: 0,
    //             paddingBottom: 0,
    //             lineHeight: '30px',
    //             display: 'inline'
    //         }
    //     };
    //     return (
    //         <div key={key} style={style}>
    //             <ReactDiffViewer
    //                 styles={newStyles}
    //                 oldValue={diffString.left[index]}
    //                 newValue={diffString.right[index]}
    //                 splitView={true}
    //                 compareMethod={DiffMethod.WORDS}
    //                 hideLineNumbers={true}
    //                 showDiffOnly={false}
    //             />
    //         </div>
    //     );
    // }

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
        // <AutoSizer>
        //     {({ width, height }) => (
        //         <List
        //             className={styles.List}
        //             height={height}
        //             rowCount={diffString.left.length}
        //             rowHeight={getRowHeight}
        //             rowRenderer={rowRenderer}
        //             width={width}
        //         />
        //     )}
        // </AutoSizer>
        <div className="tree-container">
            {rows}
        </div>
    )
}

export default TreeDiff