import React from 'react'

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

import styles from './index.css'

import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

import { compare } from './logic';

const TreeDiff = (props) => {
    const { past, current, options } = props

    const diffString = compare(past, current, options);

    const getRowHeight = ({ index }) => {
        const characterCount = 60;
        return 30 * Math.ceil(Math.max(
            diffString.left[index].length / characterCount,
            diffString.right[index].length / characterCount
        ));
    }

    const rowRenderer = ({ key, index, style }) => {
        const newStyles = {
            marker: {
                width: '10px',
                textAlign: 'center',
                height: '30px'
            },
            content: {
                width: '400px',
            },
            diffContainer: {
                whiteSpace: 'nowrap',
                wordBreak: 'break-all'
            },
            wordDiff: {
                paddingTop: 0,
                paddingBottom: 0,
                lineHeight: '30px'
            }
        };
        return (
            <div key={key} style={style}>
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
        <AutoSizer>
            {({ width, height }) => (
                <List
                    className={styles.List}
                    height={height}
                    rowCount={diffString.left.length}
                    rowHeight={getRowHeight}
                    rowRenderer={rowRenderer}
                    width={width}
                />
            )}
        </AutoSizer>
    )
}

export default TreeDiff