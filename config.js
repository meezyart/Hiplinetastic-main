module.exports = {
    sanity: {
        projectId: process.env.SANITY_PROJECT_ID || '00prkzk3',
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: 'v1',
        useCdn: true
    },
    envUrls: {
        development: 'http://localhost:8080',
        staging: 'http://dev.bymattlee.com',
        production: 'https://bymattlee-11ty-starter.netlify.app'
    }
}