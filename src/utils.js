// function sleep() {
//   return new Promise(() => {}); //va fi intotdeauna pending pt ca nu va rezolva nimic
// }

export function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  }); //sa sa rezolve are nevoie de parametrul resolve
}
