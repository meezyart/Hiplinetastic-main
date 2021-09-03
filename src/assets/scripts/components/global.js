/* ***** ----------------------------------------------- ***** **
 ** ***** Global JS
 ** ***** ----------------------------------------------- ***** */

/* global Modernizr */
import Alpine from 'alpinejs'
// import iNoBounce from 'inobounce';
import 'lazysizes';
import 'lazysizes/plugins/bgset/ls.bgset';
import objectFitImages from 'object-fit-images';
// import 'svgxuse';
import { displaySiteAlert } from '../utilities/display.js';

// Display message for user to upgrade if browser does not support flexbox
const modernizrCheck = () => {
    if (!Modernizr.flexbox || !Modernizr.svg) {
        const upgradeMessage = 'For an improved browsing experience, please upgrade your browser to the latest version. Click here to upgrade.';
        displaySiteAlert(upgradeMessage, 'http://outdatedbrowser.com/');
    }
}


window.Alpine = Alpine

const dancerLoop = (danceTotal) => ({
    activeDancer: 1,
    currentDancer: 'dancer-1',
    totalDancers: danceTotal,
    danceInterval: null,

    hoverMe(dancer) {
        this.activeDancer = dancer
        this.currentDancer = 'dancer-' + dancer

        this.$refs[this.currentDancer].play()
        clearInterval(this.danceInterval)
            // console.log(dancer)
    },

    loop() {
        if (this.totalDancers < 1) return

        clearInterval(this.danceInterval)
        this.danceInterval = setInterval(() => {

            this.activeDancer = this.activeDancer === this.totalDancers ? 1 : this.activeDancer + 1;
            this.currentDancer = 'dancer-' + this.activeDancer;
            this.$refs[this.currentDancer].currentTime = 0.1;
            this.$refs[this.currentDancer].play();

            // console.log(this.activeDancer, this.totalDancers, this.$refs[this.currentDancer])
        }, 4000)
    }
})

Alpine.data('dancerLoop', dancerLoop)

const init = () => {
    Alpine.start()
        // modernizrCheck();
    objectFitImages();
    // iNoBounce.disable();
}

export { init };