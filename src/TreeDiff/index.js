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
        return 30 * Math.max(diffString.left[index].split('\n').length, diffString.right[index].split('\n').length);
    }

    const rowRenderer = ({ key, index, style }) => {
        const newStyles = {
            marker: {
                width: 'auto',
                minWidth: 10,
                textAlign: 'center',
                height: '30px'
            },

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