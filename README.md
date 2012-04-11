#just another matchMedia() polyfill

Main goal: provide addListener/romoveListener interface for browsers which doesn't supports matchMedia or media queries at all.
Works fine with IE.
Supports only width/height changes. Device is ignored.

If you need full media query test please look at [paulirish/matchMedia.js](https://github.com/paulirish/matchMedia.js). 

## Usage

####
    var mq = window.matchMedia("only screen and (min-width: 480px) and (max-width: 767px)");
    if (mq.matches) {
        console.log("currently matches given query");
    }
    mq.addListener(function() {
        if (mq.matches) {
            console.log("size changed");
        }
    });