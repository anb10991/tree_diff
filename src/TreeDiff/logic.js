const space = '  ';

const LevenshteinDistance = (s, t) => {
    const m = s.length;
    const n = t.length;
    let d = [];
    for (let i = 0; i <= m; i++) {
        d[i] = [];
        for (let j = 0; j <= n; j++) {
            d[i][j] = (i > 0 && j === 0) ? i : ((j > 0 && i === 0) ? j : 0);
        }
    }

    for (let j = 1; j <= n; j++) {
        for (let i = 1; i <= m; i++) {
            let substitutionCost = 0;
            if (s[i - 1] !== t[j - 1]) {
                substitutionCost = 1;
            }
            d[i][j] = Math.min(
                d[i - 1][j] + 1,                    // deletion
                d[i][j - 1] + 1,                    // insertion
                d[i - 1][j - 1] + substitutionCost  // substitution
            );
        }
    }
    return d[m][n];
}

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

export const compare = (left, right, option = { baseKeys: ['name'], ignoreKeys: ['id'] }, depth = 0, ll = '', rl = '') => {
    const { baseKeys, ignoreKeys, threshold } = option;
    let lt = [], rt = [];

    if (Array.isArray(left) && Array.isArray(right)) {
        let lf = [], rf = [];
        for (let lidx = 0; lidx < left.length; lidx++) {
            let identical = false;

            // Search for exact matching nodes
            for (let ridx = 0; ridx < right.length; ridx++) {
                if (rf[ridx]) continue;
                for (const baseKey of baseKeys) {
                    if (left[lidx][baseKey] && right[ridx][baseKey] && left[lidx][baseKey] === right[ridx][baseKey]) {
                        identical = true;
                        break;
                    }
                }
                if (identical) {
                    lf[lidx] = true; rf[ridx] = true;
                    const diff = compare(left[lidx], right[ridx], option, depth + 1);
                    lt.push(...diff.left);
                    rt.push(...diff.right);
                    break;
                }
            }
            if (identical) {
                continue;
            }

            // Check for renamed nodes using LevenshteinDistance
            for (let ridx = 0; ridx < right.length; ridx++) {
                if (rf[ridx]) continue;
                for (const baseKey of baseKeys) {
                    if (left[lidx][baseKey] && right[ridx][baseKey] &&
                        Math.abs(1 - LevenshteinDistance(left[lidx][baseKey], right[ridx][baseKey]) / Math.max(left[lidx][baseKey].length, right[ridx][baseKey].length)) > threshold) {
                        identical = true;
                        break;
                    }
                }
                if (identical) {
                    lf[lidx] = true; rf[ridx] = true;
                    const diff = compare(left[lidx], right[ridx], option, depth + 1);
                    lt.push(...diff.left);
                    rt.push(...diff.right);
                    break;
                }
            }
            if (identical) {
                continue;
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
        for (let ridx = 0; ridx < ridx.length; ridx++) {
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
    } else {
        lt.push(`${space.repeat(depth + 1)}${left},`);
        rt.push(`${space.repeat(depth + 1)}${right},`);
    }
    return { left: lt, right: rt };
}
