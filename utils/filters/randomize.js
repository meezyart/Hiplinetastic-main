/* ***** ----------------------------------------------- ***** **
/* ***** Randomize objects
/* ***** ----------------------------------------------- ***** */

module.exports = collection => {
    if (!collection || !collection.length) return '';
    // Newest date in the collection
    return collection.sort(() => Math.random() - 0.5)
}