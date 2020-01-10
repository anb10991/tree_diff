const space = '  ';

// Get Levenshtein distance between two strings.
const LevenshteinDistance = (s, t) => {
    // create two work vectors of integer distances
    const m = s.length;
    const n = t.length;
    let v0 = [];
    let v1 = [];

    // initialize v0 (the previous row of distances)
    // this row is A[0][i]: edit distance for an empty s
    // the distance is just the number of characters to delete from t
    for (let i = 0; i <= n; i++) {
        v0[i] = i;
    }

    for (let i = 0; i < m; i++) {
        // calculate v1 (current row distances) from the previous row v0

        // first element of v1 is A[i+1][0]
        //   edit distance is delete (i+1) chars from s to match empty t
        v1[0] = i + 1;

        // use formula to fill in the rest of the row
        for (let j = 0; j < n; j++) {
            // calculating costs for A[i+1][j+1]
            const deletionCost = v0[j + 1] + 1;
            const insertionCost = v1[j] + 1;
            const substitutionCost = v0[j] + (s[i] === t[j] ? 0 : 1);
            v1[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost)
        }
        // copy v1 (current row) to v0 (previous row) for next iteration
        // since data in v1 is always invalidated, a swap without copy could be more efficient
        for (let j = 0; j < n; j++) {
            const temp = v0[j];
            v0[j] = v1[j];
            v1[j] = temp;
        }
    }
    // after the last swap, the results of v1 are now in v0
    return v1[n];
}

// Get the string representation of the object.
// Remove the children attribute from the object because the string will be too long
// and hard to calculate levenshtein distance.
const getString = (obj, option) => {
    if (Array.isArray(obj)) {
        return JSON.stringify(obj);
    }
    if (typeof obj !== 'object') {
        return `${obj}`;
    }
    let newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (['children', ...option.ignoreKeys].indexOf(key) === -1) {
            newObj[key] = value;
        }
    }
    return JSON.stringify(newObj);
}

// Get string representation of the object in tree-like format
const convertToString = (obj, depth = 0) => {
    let returnStr;
    if (Array.isArray(obj)) {
        returnStr = '[\n';
        for (const value of obj) {
            returnStr += `${space.repeat(depth + 1)}${convertToString(value, depth + 1)},\n`;
        }
        returnStr += `${space.repeat(depth)}]`;
    } else if (typeof obj === 'object') {
        returnStr = '{\n';
        for (const [key, value] of Object.entries(obj)) {
            returnStr += `${space.repeat(depth + 1)}"${key}": ${convertToString(value, depth + 1)},\n`;
        }
        returnStr += `${space.repeat(depth)}}`;
    } else {
        returnStr = `"${obj}"`;
    }
    return returnStr;
}

// Get the average threshold between two objects by its content
export const getAvgThreshold = (left, right, option) => {
    const { baseKeys, threshold } = option;
    let childThreshold = 0;

    // Calculate the children nodes first
    if (left.children && right.children && (left.children.length + right.children.length)) {
        let lf = [], rf = [];

        // Search for exact matching nodes
        for (let lidx = 0; lidx < left.children.length; lidx++) {
            if (lf[lidx]) continue;
            let identical = false;
            for (let ridx = 0; ridx < right.children.length; ridx++) {
                if (rf[ridx]) continue;
                for (const baseKey of baseKeys) {
                    // compare node name
                    if (left.children[lidx][baseKey] !== undefined &&
                        right.children[ridx][baseKey] !== undefined &&
                        left.children[lidx][baseKey] === right.children[ridx][baseKey]) {
                        identical = true;
                        break;
                    }
                }
                if (identical) {    // once find the same one
                    lf[lidx] = true; rf[ridx] = true;
                    childThreshold += getAvgThreshold(left.children[lidx], right.children[ridx], option);
                    break;
                }
            }
        }

        // Check for renamed nodes using LevenshteinDistance
        for (let lidx = 0; lidx < left.children.length; lidx++) {
            if (lf[lidx]) continue;
            let identical = false;
            for (let ridx = 0; ridx < right.children.length; ridx++) {
                if (rf[ridx]) continue;
                for (const baseKey of baseKeys) {
                    // compare Levenshtein distance between node name
                    if (left.children[lidx][baseKey] !== undefined &&
                        right.children[ridx][baseKey] !== undefined &&
                        Math.abs(1 - LevenshteinDistance(left.children[lidx][baseKey], right.children[ridx][baseKey])
                            / Math.max(left.children[lidx][baseKey].length, right.children[ridx][baseKey].length)) > threshold) {
                        identical = true;
                        break;
                    }
                }
                if (identical) {    // once find the similar one
                    lf[lidx] = true; rf[ridx] = true;
                    childThreshold += getAvgThreshold(left.children[lidx], right.children[ridx], option);
                    break;
                }
            }
        }

        // Skip getting threshold by content, for now
        for (let lidx = 0; lidx < left.children.length; lidx++) {
            if (lf[lidx]) continue;
            let maxThreshold = 0; let maxRIdx = -1;
            for (let ridx = 0; ridx < right.children.length; ridx++) {
                if (rf[ridx]) continue;
                const tempThreshold = getAvgThreshold(left.children[lidx], right.children[ridx], option);
                if (maxThreshold < tempThreshold) {
                    maxThreshold = tempThreshold;
                    maxRIdx = ridx;
                }
            }
            if (maxRIdx !== -1) {
                childThreshold += maxThreshold;
                lf[lidx] = true; rf[maxRIdx] = true;
            }
        }

        childThreshold /= Math.max(left.children ? left.children.length : 0, right.children ? right.children.length : 0);
    }
    const lStr = getString(left, option);
    const rStr = getString(right, option);
    return Math.max(Math.abs(1 - LevenshteinDistance(lStr, rStr) / Math.max(lStr.length, rStr.length)), childThreshold);
}

// Compare two objects
export const compare = (left, right, option = { baseKeys: ['name'], ignoreKeys: ['id'] }, depth = 0, ll = '', rl = '') => {
    const { baseKeys, ignoreKeys, threshold } = option;
    let lt = [], rt = [];

    if (Array.isArray(left) && Array.isArray(right)) {  // In case of array, loop through all the items and find similar ones
        let lf = [], rf = [];
        
        // Search for exact matching nodes
        for (let lidx = 0; lidx < left.length; lidx++) {
            if (lf[lidx]) continue;
            let identical = false;
            for (let ridx = 0; ridx < right.length; ridx++) {
                if (rf[ridx]) continue;
                for (const baseKey of baseKeys) {
                    // compare node name
                    if (left[lidx][baseKey] !== undefined && right[ridx][baseKey] !== undefined && left[lidx][baseKey] === right[ridx][baseKey]) {
                        identical = true;
                        break;
                    }
                }
                if (identical) {    // once find the same one
                    lf[lidx] = true; rf[ridx] = true;
                    const diff = compare(left[lidx], right[ridx], option, depth + 1);
                    lt.push(...diff.left);
                    rt.push(...diff.right);
                    break;
                }
            }
        }

        // Check for renamed nodes using LevenshteinDistance
        for (let lidx = 0; lidx < left.length; lidx++) {
            if (lf[lidx]) continue;
            let identical = false;
            for (let ridx = 0; ridx < right.length; ridx++) {
                if (rf[ridx]) continue;
                for (const baseKey of baseKeys) {
                    // compare Levenshtein distance between node name
                    if (left[lidx][baseKey] !== undefined && right[ridx][baseKey] !== undefined &&
                        Math.abs(1 - LevenshteinDistance(left[lidx][baseKey], right[ridx][baseKey]) / Math.max(left[lidx][baseKey].length, right[ridx][baseKey].length)) > threshold) {
                        identical = true;
                        break;
                    }
                }
                if (identical) {    // once find the similar one
                    lf[lidx] = true; rf[ridx] = true;
                    const diff = compare(left[lidx], right[ridx], option, depth + 1);
                    lt.push(...diff.left);
                    rt.push(...diff.right);
                    break;
                }
            }
        }

        // Compare the nodes by its content
        for (let lidx = 0; lidx < left.length; lidx++) {
            if (lf[lidx]) continue;
            for (let ridx = 0; ridx < right.length; ridx++) {
                if (rf[ridx]) continue;
                if (getAvgThreshold(left[lidx], right[ridx], option) > threshold) {
                    lf[lidx] = true; rf[ridx] = true;
                    const diff = compare(left[lidx], right[ridx], option, depth + 1);
                    lt.push(...diff.left);
                    rt.push(...diff.right);
                    break;
                }
            }
        }

        for (let lidx = 0; lidx < left.length; lidx++) {
            if (!lf[lidx]) {
                let stringArray;
                if (typeof left[lidx] === 'object') {
                    stringArray = (`${space.repeat(depth + 1)}` + convertToString(left[lidx], depth + 1)).split('\n');
                } else {
                    stringArray = [`${space.repeat(depth + 1)}${left[lidx]},`];
                }

                lt.push(...stringArray);
                stringArray.fill('');
                rt.push(...stringArray);
            }
        }
        for (let ridx = 0; ridx < right.length; ridx++) {
            if (!rf[ridx]) {
                let stringArray;
                if (typeof right[ridx] === 'object') {
                    stringArray = (`${space.repeat(depth + 1)}` + convertToString(right[ridx], depth + 1)).split('\n');
                } else {
                    stringArray = [`${space.repeat(depth + 1)}${right[ridx]},`];
                }

                rt.push(...stringArray);
                stringArray.fill('');
                lt.push(...stringArray);
            }
        }
        if (lt.length) {
            lt.unshift(space.repeat(depth) + (ll ? '"' + ll + '": ' : '') + '[');
            rt.unshift(space.repeat(depth) + (rl ? '"' + rl + '": ' : '') + '[');
            lt.push(space.repeat(depth) + '],');
            rt.push(space.repeat(depth) + '],');
        }
    } else if (typeof left === 'object' && typeof right === 'object') {
        const keySet = new Set([...Object.keys(left), ...Object.keys(right)]);
        let hasDiff = false;
        keySet.forEach((currentValue, currentKey, set) => {
            if (left[currentKey] !== undefined && right[currentKey] !== undefined &&
                typeof left[currentKey] === 'object' && typeof right[currentKey] === 'object') {
                const diff = compare(left[currentKey], right[currentKey], option, depth + 1, currentKey, currentKey);
                lt.push(...diff.left);
                rt.push(...diff.right);
                if (diff.left.length) {
                    hasDiff = true;
                }
            } else if ((left[currentKey] !== right[currentKey] && ignoreKeys.indexOf(currentKey) === -1)
                || (baseKeys.indexOf(currentKey) !== -1)) {
                if ((left[currentKey] !== right[currentKey] && ignoreKeys.indexOf(currentKey) === -1)) {
                    hasDiff = true;
                }
                if (left[currentKey] !== undefined) {
                    if (typeof left[currentKey] === 'object') {
                        lt.push(
                            `${space.repeat(depth + 1)}"${currentKey}": ` +
                            convertToString(left[currentKey], depth + 1));
                    } else {
                        lt.push(`${space.repeat(depth + 1)}"${currentKey}": "${left[currentKey]}",`);
                    }
                } else {
                    lt.push('');
                }
                if (right[currentKey] !== undefined) {
                    if (typeof right[currentKey] === 'object') {
                        rt.push(
                            `${space.repeat(depth + 1)}"${currentKey}":` +
                            convertToString(right[currentKey], depth + 1));
                    } else {
                        rt.push(`${space.repeat(depth + 1)}"${currentKey}": "${right[currentKey]}",`);
                    }
                } else {
                    rt.push('');
                }
            }
        });
        if (hasDiff) {
            lt.unshift(space.repeat(depth) + (ll ? '"' + ll + '": ' : '') + '{');
            rt.unshift(space.repeat(depth) + (rl ? '"' + rl + '": ' : '') + '{');
            lt.push(space.repeat(depth) + '},');
            rt.push(space.repeat(depth) + '},');
        } else {
            lt = [];
            rt = [];
        }
    } else if (left !== right) {
        lt.push(`${space.repeat(depth + 1)}${left},`);
        rt.push(`${space.repeat(depth + 1)}${right},`);
    }
    return { left: lt, right: rt };
}
