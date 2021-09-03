const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginNavigation = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');


/* ***** ----------------------------------------------- ***** **
/* ***** Eleventy Config
/* ***** ----------------------------------------------- ***** */

// Import transforms
const parseContent = require('./utils/transforms/parseContent.js');
const minifyHtml = require('./utils/transforms/minifyHtml.js');
const addHeaderCredit = require('./utils/transforms/addHeaderCredit.js');

// Import filters
const absoluteUrl = require('./utils/filters/absoluteUrl.js');
const cacheBust = require('./utils/filters/cacheBust.js');
const htmlDate = require('./utils/filters/htmlDate.js');
const readableDate = require('./utils/filters/readableDate.js');
const rssLastUpdatedDate = require('./utils/filters/rssLastUpdatedDate.js');
const rssDate = require('./utils/filters/rssDate.js');
const articleUrl = require('./utils/filters/articleUrl.js');
const articleCategoryUrl = require('./utils/filters/articleCategoryUrl.js');
const blocksToHtml = require('./utils/filters/blocksToHtml.js');
const allBlocksToHtml = require('./utils/allBlocksToHtml.js');

// Import shortcodes
const imageUrl = require('./utils/shortcodes/imageUrl.js');
const imageSrcset = require('./utils/shortcodes/imageSrcset.js');
const isSamePageOrSection = require('./utils/shortcodes/isSamePageOrSection.js');
const svg = require('./utils/shortcodes/svg.js');
const currentYear = require('./utils/shortcodes/currentYear.js');


const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const iconsprite = require('./utils/iconsprite.js')

module.exports = function(config) {
    // Plugins
    config.addPlugin(pluginRss)
    config.addPlugin(pluginNavigation)

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })


    // Transforms
    config.addTransform('parseContent', parseContent);
    if (process.env.ELEVENTY_ENV !== 'development')
        config.addTransform('minifyHtml', minifyHtml)
    config.addTransform('addHeaderCredit', addHeaderCredit);

    // Filters
    config.addFilter('absoluteUrl', absoluteUrl);
    config.addFilter('cacheBust', cacheBust);
    config.addFilter('htmlDate', htmlDate);
    config.addFilter('readableDate', readableDate);
    config.addFilter('rssLastUpdatedDate', rssLastUpdatedDate);
    config.addFilter('rssDate', rssDate);
    config.addFilter('articleUrl', articleUrl);
    config.addFilter('articleCategoryUrl', articleCategoryUrl);
    config.addFilter('blocksToHtml', blocksToHtml);
    config.addFilter('allBlocksToHtml', allBlocksToHtml)

    // Shortcodes
    config.addShortcode('imageUrl', imageUrl);
    config.addShortcode('imageSrcset', imageSrcset);
    config.addShortcode('isSamePageOrSection', isSamePageOrSection);
    config.addShortcode('svg', svg);
    config.addShortcode('currentYear', currentYear);

    // Layout aliases
    // config.addLayoutAlias('base', 'layouts/base.njk');
    // config.addLayoutAlias('home', 'layouts/home.njk');
    // config.addLayoutAlias('page', 'layouts/page.njk');


    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite)


    config.addShortcode(
        'debug',
        (value) =>
        `<pre style="padding: 100px 0; font-size: 14px; font-family: monospace;">${JSON.stringify(
                value,
                null,
                2
            )}</pre>`
    )

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    config.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('page', 'page.njk')
    config.addLayoutAlias('home', 'home.njk')
    config.addLayoutAlias('post', 'post.njk')

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/site.webmanifest')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')
    config.addPassthroughCopy('src/assets/css')
    config.addPassthroughCopy('src/assets/js')

    // Deep-Merge
    // config.setDataDeepMerge(true)

    config.setQuietMode(true)

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['njk', 'md', 'html', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}