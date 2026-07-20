module.exports = {
    sanity: {
        projectId: process.env.SANITY_PROJECT_ID || '00prkzk3',
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: 'v1',
        // Static release builds must see newly published Sanity content immediately.
        useCdn: false
    },
    envUrls: {
        development: '',
        staging: 'https://hipline.netlify.app',
        production: 'https://myhipline.com'
    }
}
