const blocksToHtml = require('@sanity/block-content-to-html')

module.exports = function allBlocksToHtml(data) {
    if (Array.isArray(data)) {
        return data.map(allBlocksToHtml)
    }

    if (data === null || typeof data !== 'object') {
        return data
    }

    if (data._type && data._type === 'text') {
        return blocksToHtml(data)
    }

    const out = {}
    for (const [key, val] of Object.entries(data)) {
        out[key] = allBlocksToHtml(val)
    }
    return out
}