/* ***** ----------------------------------------------- ***** **
 ** ***** Global JS
 ** ***** ----------------------------------------------- ***** */

/* global Modernizr */
import Alpine from 'alpinejs'
import AOS from 'aos'


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

const choreographerBoxes = () => ({
    openedIndex: -1,
    videoPlaying: false,
    currentVid: null,
    stopVideo(id) {
        if (!id && this.$refs[id] && this.$refs[id].pause() !== undefined) return
            // let pausePromise = this.$refs[id].pause()
            // if (pausePromise !== undefined) {
            //     pausePromise
            //         .then(() => {
            //             // Automatic playback started!
            //             // Show playing UI.

        //         })
        //         .catch((error) => {
        //             // Auto-play was prevented
        //             // this.stopVideo(id)
        //         })
        // }
        this.$refs[id].pause()
        this.videoPlaying = false
        this.currentVid = null
    },
    playVideo(id) {
        if (!id && this.$refs[id] && this.$refs[id].play() !== undefined) return
            // let playPromise = this.$refs[id].play()

        // if (playPromise !== undefined) {
        //     playPromise
        //         .then(() => {
        //             // Automatic playback started!
        //             // Show playing UI.



        //         })
        //         .catch((error) => {
        //             // Auto-play was prevented
        //             this.stopVideo(id)

        //         })
        // }
        this.videoPlaying = true
        this.$refs[id].play()
        this.currentVid = id

    },

    scrollToContent(cont) {
        let target = this.$refs[cont];
        let headerOffset = 100;
        let elementPosition = target.offsetTop;
        let offsetPosition = elementPosition - headerOffset;
        console.log(target, offset)
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    },
    init() {
        // return this.dancers.sort(() => Math.random() - 0.5)
        console.log(this.openedIndex)
    }
})




// Alpine.data('scrollToContent', scrollToContent)
Alpine.data('choreographerBoxes', choreographerBoxes);
Alpine.data('dancerLoop', dancerLoop);

const init = () => {
    Alpine.start();
    AOS.init({
        offset: 100,
        duration: 1000,
        once: true,
        // offset: 20 .0,
        // duration: 600,
        easing: 'ease-in-sine',
        // delay: 100,
        // easing: 'ease'
    })

    // modernizrCheck();
    objectFitImages();
    console.log('init main')
        // -------------------------------*/

    // iNoBounce.disable();
}

export { init };