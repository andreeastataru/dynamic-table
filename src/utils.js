// function sleep() {
//   return new Promise(() => {}); //va fi intotdeauna pending pt ca nu va rezolva nimic
// }

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(); //returneaza undefined
    }, ms);
  }); //sa sa rezolve are nevoie de parametrul resolve
}

export function $(selector) {
  return document.querySelector(selector);
}
