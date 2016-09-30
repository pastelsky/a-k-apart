(function () {
'use strict';

function get(url, cb, isRaw) {
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    return false;
  }
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      cb(isRaw ? httpRequest.responseText : JSON.parse(httpRequest.responseText))
    }
  };
  httpRequest.open('GET', url);
  httpRequest.send();
}

function qs(selector) {
  return document.querySelector(selector)
}

function qsAll(selector) {
  return document.querySelectorAll(selector)
}

function forEachElement(selector, callback) {
  var elements = qsAll(selector);
  for (var i = 0; i < elements.length; i++) {
    callback(elements[i]);
  }
}

function on(event, selector, callback, options) {
  forEachElement(selector, function (element) {
    element.addEventListener(event, callback, options)
  });
}


function show(selector, displayType) {
  forEachElement(selector, function (element) {
    element.style.display = displayType || 'block'
  });
}

function hide(selector) {
  forEachElement(selector, function (element) {
    element.style.display = 'none'
  });
}

function addClass(selector, classToAdd) {
  forEachElement(selector, function (element) {
    element.classList.add(classToAdd);
  });
}


function removeClass(selector, classToRemove) {
  forEachElement(selector, function (element) {
    element.classList.remove(classToRemove);
  });
}

function supportsSpeech() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

var voices = speechSynthesis.getVoices();
console.log(voices);

/*-----------------------------
 Path Animator v1.1.0
 (c) 2013 Yair Even Or <http://dropthebit.com>

 MIT-style license.
 ------------------------------*/
function PathAnimator(path) {
  if (path) this.updatePath(path);
  this.timer = null;
}

PathAnimator.prototype = {
  start: function (duration, step, reverse, startPercent, callback, easing) {
    this.stop();
    this.percent = startPercent || 0;

    if (duration == 0) return false;

    var that = this,
      startTime = new Date(),
      delay = 1000 / 60;

    (function calc() {
      var p = [], angle,
        now = new Date(),
        elapsed = (now - startTime) / 1000,
        t = (elapsed / duration),
        percent = t * 100;

      // easing functions: https://gist.github.com/gre/1650294
      if (typeof easing == 'function')
        percent = easing(t) * 100;

      if (reverse)
        percent = startPercent - percent;
      else
        percent += startPercent;

      that.running = true;

      // On animation end (from '0%' to '100%' or '100%' to '0%')
      if (percent > 100 || percent < 0) {
        that.stop();
        return callback.call(that.context);
      }

      that.percent = percent;	// save the current completed percentage value

      //  angle calculations
      p[0] = that.pointAt(percent - 1);
      p[1] = that.pointAt(percent + 1);
      angle = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x) * 180 / Math.PI;

      // advance to the next point on the path
      that.timer = requestAnimationFrame(calc);
      // do one step ("frame")
      step.call(that.context, that.pointAt(percent), angle, that.percent);
    })();
  },

  stop: function () {
    cancelAnimationFrame(this.timer);
    this.timer = null;
    this.running = false;
  },

  pointAt: function (percent) {
    return this.path.getPointAtLength(this.len * percent / 100);
  },

  updatePath: function (path) {
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path.setAttribute('d', path);
    this.len = this.path.getTotalLength();
  }
};

function setNavigationView(shouldStart) {
  if (shouldStart) {
    show('.nav');
    hide('.intro');
    hide('.nav-start');
    addClass('.ship', 'dock');
    addClass('.story', 'dock');
  } else {
    hide('.nav');
    show('.intro');
    show('.nav-start');
    removeClass('.ship', 'dock');
    removeClass('.story', 'dock');
    hide('.map');
    hide('.path');
  }
}

function StoryBoard(data, startingIndex) {
  var heading = qs('.story h1');
  var storyboard = qs('.storyboard');
  var controlNext = qs('.control-right');
  var controlPrev = qs('.control-left');
  var dateElement = qs('.date');
  var ship = qs('.ship');
  var map = qs('.map');
  var controls = qs('.controls')
  var startButton = qs('.btn-start');
  var portrait = qs('.portrait');
  var journeyPath, pointer, journeyProgress, pointerXOffset, journeyAnimator, pathBCR;
  var journeyTime = 20;
  var self = this;

  this.currentIndex = startingIndex || -1;
  var timeline = data.timeline;

  if (this.currentIndex === 0) {
    controlPrev.disabled = true;
  }

  StoryBoard.setNavigationView = setNavigationView;

  StoryBoard.setNavigationStartView = function (shouldStart) {
    var listenForKeypress = function (e) {
      if (e.keyCode === 37)
        self.prev();
      else if (e.keyCode === 39)
        self.next();
    };
    if (shouldStart) {
      show('.nav-start');
      hide('.heading');
      hide('.nav-intro');
      show('.map');
      show('.path');
      show('.journey');
      removeClass('.story', 'dock');
      addClass('.wave', 'speed');
      removeClass('.ship', 'dock');
      self.next();
      controlPrev.disabled = true;

      on('click', '.control-left', function () {
        self.prev()
      });

      on('click', '.control-right', function () {
        self.next()
      });

      document.addEventListener('keydown', listenForKeypress);

    } else {
      hide('.nav-start');
      hide('.map');
      hide('.journey');
      show('.nav-intro');
      show('.heading');
      addClass('.ship', 'dock');
      addClass('.story', 'dock');
      removeClass('.wave', 'speed');

      self.prev();

      document.removeEventListener('keydown', listenForKeypress);
    }
  };


  this.init = function () {
    heading.innerText = data.name;
    dateElement.innerText = data.lifetime;
    storyboard.innerText = data.about;
    qs('.map').src = "/public/images/world.svg";

    startButton.style.display = 'block';
    portrait.style.backgroundImage = 'url("' + data.portrait + '")';

    get(data.path, function (result) {
      document.body.insertAdjacentHTML('beforeend', result);
      StoryBoard.setNavigationView(true);
    }, true);

    on('click', '.btn-start', this.start)
  };

  this.start = function () {
    journeyPath = qs('.path path');
    pointer = qs('.path circle');
    pathBCR = journeyPath.getBoundingClientRect();
    pointerXOffset = pathBCR.left;

    journeyAnimator = new PathAnimator(journeyPath.getAttribute('d'));
    journeyProgress = 0;
    journeyAnimator.start(journeyTime, self.updatePointer, false, journeyProgress, null);
    StoryBoard.setNavigationStartView(true);
  };

  this.updatePointer = function (point, angle, percent) {
    console.log(percent);
    addClass('.wave', 'speed')
    if (Math.round(percent) === data.stops[self.currentIndex]) {
      journeyAnimator.stop();
      removeClass('.wave', 'speed')
      journeyProgress = Math.round(percent);
    }
    var transform = 'translate(' + point.x + 'px,' + point.y + 'px) rotate(' + angle + 'deg)';
    pointer.style.transform = pointer.style.webkitTransform = transform;
  };

  this.next = function () {
    if (this.currentIndex > timeline.length - 2)
      return;

    if (this.currentIndex === timeline.length - 2) {
      controlNext.disabled = true;
    } else {
      controlNext.disabled = false;
      controlPrev.disabled = false;
    }

    var caption = timeline[++this.currentIndex].caption;
    var date = timeline[this.currentIndex].date;
    storyboard.innerText = caption;
    dateElement.innerText = date;

    if (this.currentIndex !== 0) {
      console.log("stopping journey and starting at", this.currentIndex, data.stops[this.currentIndex]);
      journeyAnimator.stop();
      journeyAnimator.start(journeyTime, self.updatePointer, false, data.stops[this.currentIndex - 1], null);
    }


    if (supportsSpeech()) {
      // speak(caption)
    }
  };

  this.prev = function () {
    if (this.currentIndex < 1)
      return;

    if (this.currentIndex === 1) {
      controlPrev.disabled = true;
    } else {
      controlPrev.disabled = false;
      controlNext.disabled = false;
    }

    var caption = timeline[--this.currentIndex].caption;
    var date = timeline[this.currentIndex].date;
    storyboard.innerText = caption;
    dateElement.innerText = date;

    journeyAnimator.start(journeyTime, self.updatePointer, true, data.stops[this.currentIndex + 1], null);


    if (supportsSpeech()) {
      // speak(caption)
    }
  }
}

var routes = [{
  path: '/',
  onEnter: function () {
    setNavigationView(false);
  }
},
  {
  path: '/vasco-da-gama',
  onEnter: function () {
    get('/public/data/vasco-da-gama.json', function (result) {
      var storyBoard = new StoryBoard(result);
      storyBoard.init();
    })
  },
}];

function Router() {

  function getMatchingPath(path) {

    for (var i = 0; i < routes.length; i++) {
      if (routes[i].path === path)
        return routes[i];
    }
    return null;
  }

  this.init = function () {
    var currentPath = window.location.pathname;
    var currentRoute = getMatchingPath(currentPath);
    var self = this;

    if (currentRoute) {
      currentRoute.onEnter();
    }

    on('click', '[data-html5]', function (e) {
      const nextURL = e.target.closest('[data-html5]').getAttribute('href');
      self.push(nextURL);
      e.preventDefault();
    });

    window.onpopstate = function () {
      var currentPath = window.location.pathname;
      var currentRoute = getMatchingPath(currentPath);
      if (currentRoute) {
        currentRoute.onEnter();
      }
    }
  };

  this.push = function (path) {
    var matchingRoute = getMatchingPath(path);
    history.pushState(null, null, path);
    matchingRoute.onEnter()
  }
}

var router = new Router();
router.init();

}());

//# sourceMappingURL=../maps/index.js.map
