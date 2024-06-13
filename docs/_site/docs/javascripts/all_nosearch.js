/**
 * energize.js v0.1.0
 *
 * Speeds up click events on mobile devices.
 * https://github.com/davidcalhoun/energize.js
 */

(function() {  // Sandbox
  /**
   * Don't add to non-touch devices, which don't need to be sped up
   */
  if(!('ontouchstart' in window)) return;

  var lastClick = {},
      isThresholdReached, touchstart, touchmove, touchend,
      click, closest;
  
  /**
   * isThresholdReached
   *
   * Compare touchstart with touchend xy coordinates,
   * and only fire simulated click event if the coordinates
   * are nearby. (don't want clicking to be confused with a swipe)
   */
  isThresholdReached = function(startXY, xy) {
    return Math.abs(startXY[0] - xy[0]) > 5 || Math.abs(startXY[1] - xy[1]) > 5;
  };

  /**
   * touchstart
   *
   * Save xy coordinates when the user starts touching the screen
   */
  touchstart = function(e) {
    this.startXY = [e.touches[0].clientX, e.touches[0].clientY];
    this.threshold = false;
  };

  /**
   * touchmove
   *
   * Check if the user is scrolling past the threshold.
   * Have to check here because touchend will not always fire
   * on some tested devices (Kindle Fire?)
   */
  touchmove = function(e) {
    // NOOP if the threshold has already been reached
    if(this.threshold) return false;

    this.threshold = isThresholdReached(this.startXY, [e.touches[0].clientX, e.touches[0].clientY]);
  };

  /**
   * touchend
   *
   * If the user didn't scroll past the threshold between
   * touchstart and touchend, fire a simulated click.
   *
   * (This will fire before a native click)
   */
  touchend = function(e) {
    // Don't fire a click if the user scrolled past the threshold
    if(this.threshold || isThresholdReached(this.startXY, [e.changedTouches[0].clientX, e.changedTouches[0].clientY])) {
      return;
    }
    
    /**
     * Create and fire a click event on the target element
     * https://developer.mozilla.org/en/DOM/event.initMouseEvent
     */
    var touch = e.changedTouches[0],
        evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
    evt.simulated = true;   // distinguish from a normal (nonsimulated) click
    e.target.dispatchEvent(evt);
  };
  
  /**
   * click
   *
   * Because we've already fired a click event in touchend,
   * we need to listed for all native click events here
   * and suppress them as necessary.
   */  
  click = function(e) {
    /**
     * Prevent ghost clicks by only allowing clicks we created
     * in the click event we fired (look for e.simulated)
     */
    var time = Date.now(),
        timeDiff = time - lastClick.time,
        x = e.clientX,
        y = e.clientY,
        xyDiff = [Math.abs(lastClick.x - x), Math.abs(lastClick.y - y)],
        target = closest(e.target, 'A') || e.target,  // needed for standalone apps
        nodeName = target.nodeName,
        isLink = nodeName === 'A',
        standAlone = window.navigator.standalone && isLink && e.target.getAttribute("href");
    
    lastClick.time = time;
    lastClick.x = x;
    lastClick.y = y;

    /**
     * Unfortunately Android sometimes fires click events without touch events (seen on Kindle Fire),
     * so we have to add more logic to determine the time of the last click.  Not perfect...
     *
     * Older, simpler check: if((!e.simulated) || standAlone)
     */
    if((!e.simulated && (timeDiff < 500 || (timeDiff < 1500 && xyDiff[0] < 50 && xyDiff[1] < 50))) || standAlone) {
      e.preventDefault();
      e.stopPropagation();
      if(!standAlone) return false;
    }

    /** 
     * Special logic for standalone web apps
     * See http://stackoverflow.com/questions/2898740/iphone-safari-web-app-opens-links-in-new-window
     */
    if(standAlone) {
      window.location = target.getAttribute("href");
    }

    /**
     * Add an energize-focus class to the targeted link (mimics :focus behavior)
     * TODO: test and/or remove?  Does this work?
     */
    if(!target || !target.classList) return;
    target.classList.add("energize-focus");
    window.setTimeout(function(){
      target.classList.remove("energize-focus");
    }, 150);
  };

  /**
   * closest
   * @param {HTMLElement} node current node to start searching from.
   * @param {string} tagName the (uppercase) name of the tag you're looking for.
   *
   * Find the closest ancestor tag of a given node.
   *
   * Starts at node and goes up the DOM tree looking for a
   * matching nodeName, continuing until hitting document.body
   */
  closest = function(node, tagName){
    var curNode = node;

    while(curNode !== document.body) {  // go up the dom until we find the tag we're after
      if(!curNode || curNode.nodeName === tagName) { return curNode; } // found
      curNode = curNode.parentNode;     // not found, so keep going up
    }
    
    return null;  // not found
  };

  /**
   * Add all delegated event listeners
   * 
   * All the events we care about bubble up to document,
   * so we can take advantage of event delegation.
   *
   * Note: no need to wait for DOMContentLoaded here
   */
  document.addEventListener('touchstart', touchstart, false);
  document.addEventListener('touchmove', touchmove, false);
  document.addEventListener('touchend', touchend, false);
  document.addEventListener('click', click, true);  // TODO: why does this use capture?
  
})();
/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function(){function e(){}function t(e,t){for(var n=e.length;n--;)if(e[n].listener===t)return n;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var i=e.prototype,r=this,o=r.EventEmitter;i.getListeners=function(e){var t,n,i=this._getEvents();if("object"==typeof e){t={};for(n in i)i.hasOwnProperty(n)&&e.test(n)&&(t[n]=i[n])}else t=i[e]||(i[e]=[]);return t},i.flattenListeners=function(e){var t,n=[];for(t=0;e.length>t;t+=1)n.push(e[t].listener);return n},i.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},i.addListener=function(e,n){var i,r=this.getListenersAsObject(e),o="object"==typeof n;for(i in r)r.hasOwnProperty(i)&&-1===t(r[i],n)&&r[i].push(o?n:{listener:n,once:!1});return this},i.on=n("addListener"),i.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},i.once=n("addOnceListener"),i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var t=0;e.length>t;t+=1)this.defineEvent(e[t]);return this},i.removeListener=function(e,n){var i,r,o=this.getListenersAsObject(e);for(r in o)o.hasOwnProperty(r)&&(i=t(o[r],n),-1!==i&&o[r].splice(i,1));return this},i.off=n("removeListener"),i.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},i.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},i.manipulateListeners=function(e,t,n){var i,r,o=e?this.removeListener:this.addListener,s=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(i=n.length;i--;)o.call(this,t,n[i]);else for(i in t)t.hasOwnProperty(i)&&(r=t[i])&&("function"==typeof r?o.call(this,i,r):s.call(this,i,r));return this},i.removeEvent=function(e){var t,n=typeof e,i=this._getEvents();if("string"===n)delete i[e];else if("object"===n)for(t in i)i.hasOwnProperty(t)&&e.test(t)&&delete i[t];else delete this._events;return this},i.removeAllListeners=n("removeEvent"),i.emitEvent=function(e,t){var n,i,r,o,s=this.getListenersAsObject(e);for(r in s)if(s.hasOwnProperty(r))for(i=s[r].length;i--;)n=s[r][i],n.once===!0&&this.removeListener(e,n.listener),o=n.listener.apply(this,t||[]),o===this._getOnceReturnValue()&&this.removeListener(e,n.listener);return this},i.trigger=n("emitEvent"),i.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},i.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},i._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},i._getEvents=function(){return this._events||(this._events={})},e.noConflict=function(){return r.EventEmitter=o,e},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return e}):"object"==typeof module&&module.exports?module.exports=e:this.EventEmitter=e}).call(this),function(e){function t(t){var n=e.event;return n.target=n.target||n.srcElement||t,n}var n=document.documentElement,i=function(){};n.addEventListener?i=function(e,t,n){e.addEventListener(t,n,!1)}:n.attachEvent&&(i=function(e,n,i){e[n+i]=i.handleEvent?function(){var n=t(e);i.handleEvent.call(i,n)}:function(){var n=t(e);i.call(e,n)},e.attachEvent("on"+n,e[n+i])});var r=function(){};n.removeEventListener?r=function(e,t,n){e.removeEventListener(t,n,!1)}:n.detachEvent&&(r=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(i){e[t+n]=void 0}});var o={bind:i,unbind:r};"function"==typeof define&&define.amd?define("eventie/eventie",o):e.eventie=o}(this),function(e,t){"function"==typeof define&&define.amd?define(["eventEmitter/EventEmitter","eventie/eventie"],function(n,i){return t(e,n,i)}):"object"==typeof exports?module.exports=t(e,require("wolfy87-eventemitter"),require("eventie")):e.imagesLoaded=t(e,e.EventEmitter,e.eventie)}(window,function(e,t,n){function i(e,t){for(var n in t)e[n]=t[n];return e}function r(e){return"[object Array]"===d.call(e)}function o(e){var t=[];if(r(e))t=e;else if("number"==typeof e.length)for(var n=0,i=e.length;i>n;n++)t.push(e[n]);else t.push(e);return t}function s(e,t,n){if(!(this instanceof s))return new s(e,t);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=o(e),this.options=i({},this.options),"function"==typeof t?n=t:i(this.options,t),n&&this.on("always",n),this.getImages(),a&&(this.jqDeferred=new a.Deferred);var r=this;setTimeout(function(){r.check()})}function f(e){this.img=e}function c(e){this.src=e,v[e]=this}var a=e.jQuery,u=e.console,h=u!==void 0,d=Object.prototype.toString;s.prototype=new t,s.prototype.options={},s.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);var i=n.nodeType;if(i&&(1===i||9===i||11===i))for(var r=n.querySelectorAll("img"),o=0,s=r.length;s>o;o++){var f=r[o];this.addImage(f)}}},s.prototype.addImage=function(e){var t=new f(e);this.images.push(t)},s.prototype.check=function(){function e(e,r){return t.options.debug&&h&&u.log("confirm",e,r),t.progress(e),n++,n===i&&t.complete(),!0}var t=this,n=0,i=this.images.length;if(this.hasAnyBroken=!1,!i)return this.complete(),void 0;for(var r=0;i>r;r++){var o=this.images[r];o.on("confirm",e),o.check()}},s.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded;var t=this;setTimeout(function(){t.emit("progress",t,e),t.jqDeferred&&t.jqDeferred.notify&&t.jqDeferred.notify(t,e)})},s.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";this.isComplete=!0;var t=this;setTimeout(function(){if(t.emit(e,t),t.emit("always",t),t.jqDeferred){var n=t.hasAnyBroken?"reject":"resolve";t.jqDeferred[n](t)}})},a&&(a.fn.imagesLoaded=function(e,t){var n=new s(this,e,t);return n.jqDeferred.promise(a(this))}),f.prototype=new t,f.prototype.check=function(){var e=v[this.img.src]||new c(this.img.src);if(e.isConfirmed)return this.confirm(e.isLoaded,"cached was confirmed"),void 0;if(this.img.complete&&void 0!==this.img.naturalWidth)return this.confirm(0!==this.img.naturalWidth,"naturalWidth"),void 0;var t=this;e.on("confirm",function(e,n){return t.confirm(e.isLoaded,n),!0}),e.check()},f.prototype.confirm=function(e,t){this.isLoaded=e,this.emit("confirm",this,t)};var v={};return c.prototype=new t,c.prototype.check=function(){if(!this.isChecked){var e=new Image;n.bind(e,"load",this),n.bind(e,"error",this),e.src=this.src,this.isChecked=!0}},c.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},c.prototype.onload=function(e){this.confirm(!0,"onload"),this.unbindProxyEvents(e)},c.prototype.onerror=function(e){this.confirm(!1,"onerror"),this.unbindProxyEvents(e)},c.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},c.prototype.unbindProxyEvents=function(e){n.unbind(e.target,"load",this),n.unbind(e.target,"error",this)},s});
//= require ../lib/_imagesloaded.min
;(function () {
  'use strict';

  var loaded = false;

  var debounce = function(func, waitTime) {
    var timeout = false;
    return function() {
      if (timeout === false) {
        setTimeout(function() {
          func();
          timeout = false;
        }, waitTime);
        timeout = true;
      }
    };
  };

  var closeToc = function() {
    $(".toc-wrapper").removeClass('open');
    $("#nav-button").removeClass('open');
  };

  function loadToc($toc, tocLinkSelector, tocListSelector, scrollOffset) {
    var headerHeights = {};
    var pageHeight = 0;
    var windowHeight = 0;
    var originalTitle = document.title;

    var recacheHeights = function() {
      headerHeights = {};
      pageHeight = $(document).height();
      windowHeight = $(window).height();

      $toc.find(tocLinkSelector).each(function() {
        var targetId = $(this).attr('href');
        if (targetId[0] === "#") {
          headerHeights[targetId] = $(targetId).offset().top;
        }
      });
    };

    var refreshToc = function() {
      var currentTop = $(document).scrollTop() + scrollOffset;

      if (currentTop + windowHeight >= pageHeight) {
        // at bottom of page, so just select last header by making currentTop very large
        // this fixes the problem where the last header won't ever show as active if its content
        // is shorter than the window height
        currentTop = pageHeight + 1000;
      }

      var best = null;
      for (var name in headerHeights) {
        if ((headerHeights[name] < currentTop && headerHeights[name] > headerHeights[best]) || best === null) {
          best = name;
        }
      }

      // Catch the initial load case
      if (currentTop == scrollOffset && !loaded) {
        best = window.location.hash;
        loaded = true;
      }

      var $best = $toc.find("[href='" + best + "']").first();
      if (!$best.hasClass("active")) {
        // .active is applied to the ToC link we're currently on, and its parent <ul>s selected by tocListSelector
        // .active-expanded is applied to the ToC links that are parents of this one
        $toc.find(".active").removeClass("active");
        $toc.find(".active-parent").removeClass("active-parent");
        $best.addClass("active");
        $best.parents(tocListSelector).addClass("active").siblings(tocLinkSelector).addClass('active-parent');
        $best.siblings(tocListSelector).addClass("active");
        // $toc.find(tocListSelector).filter(":not(.active)").slideUp(150);
        // $toc.find(tocListSelector).filter(".active").slideDown(150);
        // TODO remove classnames
        document.title = $best.data("title") + " – " + originalTitle;
      }
    };

    var makeToc = function() {
      recacheHeights();
      refreshToc();

      $("#nav-button").click(function() {
        $(".toc-wrapper").toggleClass('open');
        $("#nav-button").toggleClass('open');
        return false;
      });
      $(".page-wrapper").click(closeToc);
      $(".toc-link").click(closeToc);

      // reload immediately after scrolling on toc click
      $toc.find(tocLinkSelector).click(function() {
        setTimeout(function() {
          refreshToc();
        }, 0);
      });

      $(window).scroll(debounce(refreshToc, 400));
      $(window).resize(debounce(recacheHeights, 400));
    };

    makeToc();

    window.recacheHeights = recacheHeights;
    window.refreshToc = refreshToc;
  }

  window.loadToc = loadToc;
})();

/*
Copyright 2008-2013 Concur Technologies, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.
*/
(function() {
  'use strict';

  var languages = [];

  window.setupLanguages = setupLanguages;
  window.activateLanguage = activateLanguage;
  window.getLanguageFromQueryString = getLanguageFromQueryString;

  function activateLanguage(language) {
    if (!language) return;
    if (language === '') return;

    $("#language_switcher option[data-language-name='" + language + "']").prop('selected', true);

    for (var i = 0; i < languages.length; i++) {
      $('.highlight.tab-' + languages[i]).hide();
      $('.lang-specific.' + languages[i]).hide();
    }
    $('.highlight.tab-' + language).show();
    $('.lang-specific.' + language).show();

    window.recacheHeights();

    // scroll to the new location of the position
    // if ($(window.location.hash).get(0)) {
    //   $(window.location.hash)
    //     .get(0)
    //     .scrollIntoView(true);
    // }
  }

  // parseURL and stringifyURL are from https://github.com/sindresorhus/query-string
  // MIT licensed
  // https://github.com/sindresorhus/query-string/blob/7bee64c16f2da1a326579e96977b9227bf6da9e6/license
  function parseURL(str) {
    if (typeof str !== 'string') {
      return {};
    }

    str = str.trim().replace(/^(\?|#|&)/, '');

    if (!str) {
      return {};
    }

    return str.split('&').reduce(function(ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];

      key = decodeURIComponent(key);
      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }

      return ret;
    }, {});
  }

  function stringifyURL(obj) {
    return obj
      ? Object.keys(obj)
          .sort()
          .map(function(key) {
            var val = obj[key];

            if (Array.isArray(val)) {
              return val
                .sort()
                .map(function(val2) {
                  return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                })
                .join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
          })
          .join('&')
      : '';
  }

  // gets the language set in the query string
  function getLanguageFromQueryString() {
    if (location.search.length >= 1) {
      var language = parseURL(location.search).language;
      if (language) {
        return language;
      } else if (jQuery.inArray(location.search.substr(1), languages) != -1) {
        return location.search.substr(1);
      }
    }

    return false;
  }

  // returns a new query string with the new language in it
  function generateNewQueryString(language) {
    var url = parseURL(location.search);
    if (url.language) {
      url.language = language;
      return stringifyURL(url);
    }
    return language;
  }

  // if a button is clicked, add the state to the history
  function pushURL(language) {
    if (!history) {
      return;
    }
    var hash = window.location.hash;
    if (hash) {
      hash = hash.replace(/^#+/, '');
    }
    history.pushState({}, '', '?' + generateNewQueryString(language) + '#' + hash);

    // save language as next default
    localStorage.setItem('language', language);
  }

  function setupLanguages(l) {
    var defaultLanguage = localStorage.getItem('language');

    languages = l;

    var presetLanguage = getLanguageFromQueryString();
    if (presetLanguage) {
      // the language is in the URL, so use that language!
      activateLanguage(presetLanguage);

      localStorage.setItem('language', presetLanguage);
    } else if (defaultLanguage !== null && jQuery.inArray(defaultLanguage, languages) != -1) {
      // the language was the last selected one saved in localstorage, so use that language!
      activateLanguage(defaultLanguage);
    } else {
      // no language selected, so use the default
      activateLanguage(languages[0]);
    }
  }

  // if we click on a language tab, activate that language
  $(function() {
    $('#language_switcher').on('change', function() {
      var language = $(this)
        .find(':selected')
        .data('language-name');
      pushURL(language);
      activateLanguage(language);
      return false;
    });
  });
})();


$(function() {
  loadToc($('#toc'), '.toc-link', '.toc-list-h2', 10);
  setupLanguages($('body').data('languages'));
  $('.content').imagesLoaded(function() {
    window.recacheHeights();
    window.refreshToc();
  });
});

window.onpopstate = function() {
  activateLanguage(getLanguageFromQueryString());
};

