import { qs, qsAll, on, show, hide, addClass, removeClass } from './utils'
import { supportsSpeech, speak } from './speak'
import get from './get';
import PathAnimator from './animatePath'


export function setNavigationView(shouldStart) {
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

export default function StoryBoard(data, startingIndex) {
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
};
