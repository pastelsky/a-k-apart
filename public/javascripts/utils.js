export function qs(selector) {
  return document.querySelector(selector)
}

export function qsAll(selector) {
  return document.querySelectorAll(selector)
}

export function forEachElement(selector, callback) {
  var elements = qsAll(selector);
  for (var i = 0; i < elements.length; i++) {
    callback(elements[i]);
  }
}

export function on(event, selector, callback, options) {
  forEachElement(selector, function (element) {
    element.addEventListener(event, callback, options)
  });
}


export function show(selector, displayType) {
  forEachElement(selector, function (element) {
    element.style.display = displayType || 'block'
  });
}

export function hide(selector) {
  forEachElement(selector, function (element) {
    element.style.display = 'none'
  });
}

export function addClass(selector, classToAdd) {
  forEachElement(selector, function (element) {
    element.classList.add(classToAdd);
  });
}


export function removeClass(selector, classToRemove) {
  forEachElement(selector, function (element) {
    element.classList.remove(classToRemove);
  });
}
