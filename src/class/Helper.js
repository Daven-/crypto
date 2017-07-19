import Cookies from 'js-cookie';
/**
 * helper class
 */
export default class Helper {
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

  /**
   * returned filtered coin data - if there is no prefrence return top 10 coins
   * @param  {[type]} coins         [all coins]
   * @param  {[type]} filteredCoins [coins to get]
   * @return {[type]}               [description]
   */
  filterCoins(coins) {
    let filteredCoins = Cookies.get('filteredCoins');
    if (typeof filteredCoins === 'undefined' || filteredCoins.replace(' ', '') === "") {
      return coins.filter(function(coin) {
        for (var i = 0; i < 9; i++) {
          if (coin.rank * 1 === i + 1) {
            return 1;
          }
        }
        return 0;
      });
    } else {
      filteredCoins = filteredCoins.replace(' ', '').split(',');
      return coins.filter(function(coin) {
        for (var i = 0; i < filteredCoins.length; i++) {
          if (filteredCoins[i].toUpperCase() === coin.symbol) {
            return 1;
          }
        }
        return 0;
      });
    }
  }

  /**
   * Format numbers for better readability
   * @param  {[type]} num
   * @return {[type]} string
   */
  formatNumber(num) {
    // Ensure value is a number first
    num = num * 1;

    // Source: https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript#149099
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

    return formatter.format(num);
  }
}
