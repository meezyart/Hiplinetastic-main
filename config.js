module.exports = {
    sanity: {
        projectId: process.env.SANITY_PROJECT_ID || '00prkzk3',
        dataset: process.env.SANITY_DATASET || 'production',
        useCdn: true
    },
    envUrls: {
        development: 'http://localhost:1444',
        staging: 'http://dev.bymattlee.com',
        production: 'https://bymattlee-11ty-starter.netlify.app'
    }
}