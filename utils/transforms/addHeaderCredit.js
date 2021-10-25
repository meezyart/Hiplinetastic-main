/* ***** ----------------------------------------------- ***** **
/* ***** Add Header Credit Transform
/* ***** ----------------------------------------------- ***** */

const markupHeader = [
    '<!DOCTYPE html>',
    '<!--',
    '**',
    '**',
    '**',
    '**',
    '**',
    '**',
    '**              {{ @meezyart }}',
    '**              {{ meezyart.com }}',
    '**',
    '**',
    '**',
    '**',
    '**',
    '**',
    '-->\n'
];

module.exports = (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
        return markupHeader.join('\n') + content;
    }
    return content;
}