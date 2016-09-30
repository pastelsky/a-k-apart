import get from './get';
import { on, qsAll } from './utils';
import StoryBoard, { setNavigationView } from './storyboard';

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

export default function Router() {

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
    debugger;
    var matchingRoute = getMatchingPath(path);
    history.pushState(null, null, path);
    console.log("Matched", matchingRoute)
    matchingRoute.onEnter()
  }
}
