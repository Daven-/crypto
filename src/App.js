import React, {
  Component
} from 'react';
import logo from './logo.svg';

import Cookies from 'js-cookie';
import Spinner from './component/Spinner';
import Helper from './class/Helper';
import './css/App.css';


class App extends Component {
  constructor(props) {
    super(props);
    // state {if the value is not used in render it should not be in state}
    this.state = {
      feed: null,
      filteredCoins: typeof Cookies.get('filteredCoins') === 'undefined' ? '' : Cookies.get('filteredCoins')
    };
    this.totalAmount = 0;
    // init load
    this.loadFeed();

    // bind this to functions
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitCoinAmount = this.handleSubmitCoinAmount.bind(this);

    this.helper = new Helper();
  }
  componentDidMount() {
    // save so you can clear this interval later - load data every 15 seconds
    this.streamId = setInterval(this.loadFeed.bind(this), 15000);
  }

  componentWillUnmount() {
    clearInterval(this.streamId);
  }

  /**
   * get coinmarket feed data
   * @return {[type]} [description]
   */
  loadFeed() {
    console.log('getting feed data');
    let xhttp = new XMLHttpRequest();
    let self = this;
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        if (self.state.feed !== null) {
          self.setState({
            oldFeed: self.state.feed
          });
        }
        let filteredFeed = self.filterCoins(JSON.parse(this.responseText));
        self.setState({
          feed: filteredFeed
        });
      }
    };
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/", true);
    xhttp.send()
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
          if (coin.rank == i + 1) {
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
   * save filter preference in cookie
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  handleSubmit(event) {
    event.preventDefault();
    // save coins to filter in a cookie
    Cookies.set('filteredCoins', this.state.filteredCoins, {
      expires: 364
    });
    this.loadFeed();
  }

  /**
   * save coin amount in cookie
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  handleSubmitCoinAmount(event) {
    event.preventDefault();
    // save coins to filter in a cookie
    Cookies.set(this.state.coinId.toUpperCase(), this.state.coinAmount, {
      expires: 364
    });
  }


  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }


  renderSpinners() {
    if (this.state.feed !== null) {
      let feed = this.state.feed;
      let getColor = this.helper.getColor;
      let dataChange = this.dataChange;
      let hour, day, day7;
      return feed.map(function(feed, i) {
          // change color of percentage numbers
          hour = getColor(feed.percent_change_1h);
          day = getColor(feed.percent_change_24h);
          day7 = getColor(feed.percent_change_7d);

          let holdAmount = typeof Cookies.get(feed.symbol) === 'undefined' ? '0' : Cookies.get(feed.symbol) * feed.price_usd
          let holdings = ( <p> hold: ${holdAmount} </p>);
            return (
              <div className="four columns">
                <div key={i} className="coin-container">
                    <h1>{feed.name}</h1>
                    <h3> ${feed.price_usd}</h3>
                    <p> 1h:<span className={hour}> {feed.percent_change_1h}</span></p>
                    <p> 24h:<span className={day}> {feed.percent_change_24h}</span></p>
                    <p> 7d:<span className={day7}> {feed.percent_change_7d}</span></p>
                    {holdings}
                </div>
              </div>
            );
          });
      }
    }
    render() {
      return (
        <div className="container">
          <div className="row">
            <div className="twelve columns"><h1>Total Amount Holding: {this.totalAmount}</h1></div>
          </div>
          <div className="row">
            <div className="five columns">
              <form onSubmit={this.handleSubmit} >
                <div className="row">
                  <div className="seven columns">
                    <input type="text" name="filteredCoins" value={this.state.filteredCoins} onChange={this.handleInputChange}/>
                  </div>
                  <div className="five columns">
                    <input className="button-primary" type="submit" value="filter" />
                  </div>
                </div>
              </form>
            </div>
            <div className="seven columns">
              <form onSubmit={this.handleSubmitCoinAmount} >
                <div className="row">
                  <div className="five columns">
                    <input type="text" name="coinId" onChange={this.handleInputChange}/>
                  </div>
                  <div className="five columns">
                  <input type="text" name="coinAmount" onChange={this.handleInputChange}/>
                  </div>
                  <div className="two columns">
                    <input className="button-primary" type="submit" value="Add" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="row">{this.renderSpinners()}</div>
        </div>
      );
    }
  }

  export default App;
