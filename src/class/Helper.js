/**
 * helper class
 */
export default class Helper {
  constructor() {

  }
  /**
   * get color based on a number > 0, green > red
   * @param  {[type]} feed    [new feed]
   * @param  {[type]} oldFeed
   * @return {[type]}  string
   */
  getColor(num) {
      if (num > 0) {
        return "green";
      } else {
        return "red";
      }
  }
}
