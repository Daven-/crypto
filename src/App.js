import React, {
  Component
} from 'react';
import logo from './logo.svg';

import Cookies from 'js-cookie';
import CoinContainer from './component/CoinContainer';
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
    //this.loadFeed();

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
        self.setState({
          feed: self.helper.filterCoins(JSON.parse(this.responseText))
        });
      }
    };
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/", true);
    xhttp.send()
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
      let coins = [];

      let coinContainers = feed.map(function(feed, i) {
          // change color of percentage numbers
          let classes = {
            hour: getColor(feed.percent_change_1h),
            day: getColor(feed.percent_change_24h),
            day7: getColor(feed.percent_change_7d)
          }
          let percent = {
            hour: feed.percent_change_1h,
            day: feed.percent_change_24h,
            day7: feed.percent_change_7d
          }

          let holdAmount = typeof Cookies.get(feed.symbol) === 'undefined' ? '0' : Cookies.get(feed.symbol) * feed.price_usd
          let holdings = ( <p> hold: ${holdAmount} </p>);
          return (
                <CoinContainer key={i} name={feed.name} price_usd={feed.price_usd} classes={classes} percent={percent}>
                  {holdings}
                </CoinContainer>
          );
      });
      // but 3 coin containers in a row div
      while (coinContainers.length > 0) {
        let row = (<div key={Math.random()} className="row">{coinContainers.splice(0,3)}</div>);
        coins.push(row);
      }
      return coins;
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

          {this.renderSpinners()}
        </div>
      );
    }
  }

  export default App;
