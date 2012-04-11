/** compatibility window.addEventListener */
window.addEventListener = window.addEventListener || function(type, listener, useCapture) {
     window.attachEvent('on'+type, listener);
};
/** compatibility Array.lastIndexOf */
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
        if (this == null)
            throw new TypeError();

        var t = Object(this),
            len = t.length >>> 0;
        if (len === 0)
            return -1;

        var n = len;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n)
                n = 0;
            else if (n != 0 && n != (1 / 0) && n != -(1 / 0))
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }

        var k = n >= 0
          ? Math.min(n, len - 1)
          : len - Math.abs(n);

        for (; k >= 0; k--) {
            if (k in t && t[k] === searchElement)
                return k;
        }
        return -1;
    };
}
/** comatinility String.trim */
String.prototype.trim = String.prototype.trim || function() {
    return this.replace(/^\s+|\s+$/g,"");
}
/** compatibility window.matchMedia */
window.matchMedia = window.matchMedia || (function(doc, undefined){
    //works only for screen media and [min-|max-|$]width [min-|max-|$]height properities
    var widthPattern = /.*screen.*\((min\-width|width|max-width)\:\s*([0-9]+)px\)/,
        heightPattern = /.*screen.*\((min\-height|width|max-height)\:\s*([0-9]+)px\)"/,
        mediaTypePattern = /\s*(not|only)?\s+([a-z]+)\s+(.+)/,
        featureExpressionPattern = /\((min\-|max\-)?([a-z\-]+)\s*\:\s*([0-9]+)([a-z]+)?\)/,
        checkMqFn,
        listenedMqList = [],
        matchMediaFn;
    
    var Helper = {};
    Helper.getWidth = function() {
        if ( typeof( window.innerWidth ) == 'number' ) {
            return window.innerWidth;
        } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
            return document.documentElement.clientWidth;
        } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
            return document.body.clientWidth;
        }
        return null;
    }
    Helper.getHeight = function() {
        if ( typeof( window.innerWidth ) == 'number' ) {
            return window.innerHeight;
        } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
            return document.documentElement.clientHeight;
        } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
            return document.body.clientHeight;
        }
        return null;
    }        
    var MediaQueryFeatureExpression = function(mqFeatureExpressionString) {
        this.feature = null;
        this.expected = null;
        this.unit = null;
        this.greater = null;
        this.lesser = null;
        var result = mqFeatureExpressionString.match(featureExpressionPattern);
        if (result) {
            if (result[1]) {
                if ( result[1] == "min-") {
                    this.greater = true;
                }
                if ( result[1] == "max-") {
                    this.lesser = true;
                }
            }
            this.feature = result[2];
            this.expected = result[3];
            this.unit = result[4];
        }
    };
    MediaQueryFeatureExpression.prototype = {};
    MediaQueryFeatureExpression.prototype.check = function() {
        switch (this.feature) {
            case "width":
                var val = this.checkValue(Helper.getWidth())
                return val;
                break;
            case "height":
                return this.checkValue(Helper.getHeigth())
                break;                
        }
    };
    MediaQueryFeatureExpression.prototype.checkValue = function(currentValue) {
        if (this.greater) {
            //alert("MediaQueryFeatureExpression.prototype.check(" +  currentValue + ">=" + this.expected + ")");
            return (currentValue >= this.expected);
        } else if (this.lesser) {
            //alert("MediaQueryFeatureExpression.prototype.check(" +  currentValue + "<=" + this.expected + ")");
            return (currentValue <= this.expected);
        } else {
            return (currentValue == this.expected);
        }
    };
    
    var MediaQueryExpressions = function (mqExpressionsString) {
        this.list = mqExpressionsString.split("and");
        if (this.list.length > 0) {
            if (this.list[0].length == 0) {
                this.list.splice(0,1);
            }
            for (var i = 0; i < this.list.length; i++) {
                this.list[i] = new MediaQueryFeatureExpression(this.list[i]);
            }
        }
    };
    MediaQueryExpressions.prototype = {};
    MediaQueryExpressions.prototype.check = function() {
        //alert("MediaQueryExpressions.prototype.check" +  this.list.length);
        var i = 0,
            result = true;
        if (this.list.length == 0) {
            return false;
        }
        while (i < this.list.length && result) {
            result *= this.list[i].check();
            i++;
        }
        //alert("MediaQueryExpressions.prototype.check / return " +  result);
        return result;
    }
    
    var MediaQuery = function (mediaQueryString) {
        this.media = "any";
        this.negation = false;
        this.expressions = null;
        mediaQueryString = mediaQueryString.trim();
        var result = null;
        if (mediaQueryString[0] == "(") {
            //only expressions
            this.expressions = new MediaQueryExpressions(mediaQueryString);
        } else if((result = mediaQueryString.match(mediaTypePattern))) {
            //must have media
            if (result[1] && result[1] == "not") {
                this.negation = true;
            }
            if (result[2]) {
                this.media = result[2];
            }
            if (result[3]) {
                this.expressions = new MediaQueryExpressions(result[3]);
            }
        }
    };
    MediaQuery.prototype = {};
    MediaQuery.prototype.check = function() {
        /* lack of media type check */
        var expressionsTest = this.expressions.check();
        if (this.negation) {
            return !expressionsTest;
        }
        return expressionsTest;
    }
    
    var dispatchListeners = function () {
        var i = 0,
            j = 0,
            mq;
        for (i; i < listenedMqList.length; i++) {
            mq = listenedMqList[i];
            if (MediaQueryList.check(mq)) {
                if (!mq.matches) {
                    mq.matches = true;
                    for (j = 0; j < mq._listeners.length; j++) {
                        mq._listeners[j]();
                    }
                }
            } else if (mq.matches) {
                mq.matches = false;
                for (j = 0; j < mq._listeners.length; j++) {
                    mq._listeners[j]();
                }
            }
        }
    };
    var MediaQueryList = function (mediaQueryString) {
        this.matches = false;
        this.media = mediaQueryString;
        this._listeners = [];
        this._mediaQueries = MediaQueryList.parse(mediaQueryString);
        this.matches = MediaQueryList.check(this);
    };
    MediaQueryList.parse = function (mediaQueryString) {
        var mediaQueries = mediaQueryString.split(","),
            i = 0;
        for (i; i < mediaQueries.length; i++) {
            mediaQueries[i] = new MediaQuery(mediaQueries[i]);
        }
        return mediaQueries; 
    };
    MediaQueryList.check = function (mql) {
        var i = 0,
            result = false;
            //alert("MediaQueryList.check /  mql._mediaQueries.length" + mql._mediaQueries.length);
        while (i < mql._mediaQueries.length && !result) {
            result = mql._mediaQueries[i].check();
            i++;
        }
        if (i < mql._mediaQueries.length) {
            return true
        }
        //alert("MediaQueryList.check / " + result);
        return result;
    }
    MediaQueryList.prototype = {};
    MediaQueryList.prototype.addListener = function (listener) {
        this._listeners.push(listener);
        if (listenedMqList.lastIndexOf(this) < 0) {
            listenedMqList.push(this);
        }
    };
    MediaQueryList.prototype.removeListener = function (listener) {
        var i = this._listeners.lastIndexOf(listener);
        if (i >= 0) {
            this._listeners.splice(i,1);
            if ( this._listeners.length == 0) {
                listenedMqList.splice(listenedMqList.lastIndexOf(this),1);
            }
        }
    };       
    checkMqFn = function(mql) {
       //mql.matches = MediaQueryList.check(mql);
       //return mql.matches;
       return new MediaQueryList.check(mql);
    };
    window.addEventListener("resize", function(e){
        dispatchListeners();
    });
    matchMediaFn = function(mediaQueryString) {
        return new MediaQueryList(mediaQueryString);
    }
    return matchMediaFn;
})(document);