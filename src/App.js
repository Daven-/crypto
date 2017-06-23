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
    this.loadFeed();

    // bind this to functions
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitCoinAmount = this.handleSubmitCoinAmount.bind(this);
    this.handleExpand = this.handleExpand.bind(this);

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
        self.filterSbmt.disabled = false;
        document.getElementById('loading-gif').style.visibility = 'hidden';
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
    this.filterSbmt.disabled = true;
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
    this.amountSbmt.disabled = true;
    // save coin amount in local storage
    localStorage.setItem(this.state.coinId.toUpperCase(), this.state.coinAmount);
    this.setState({
      coinId: "",
      coinAmount: ""
    });
    this.amountSbmt.disabled = false;
  }


  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleExpand(){
    this.expand.classList.toggle('expand');
  }


  renderSpinners() {
    if (this.state.feed !== null) {
      let feed = this.state.feed;
      let getColor = this.helper.getColor;
      let formatNumber = this.helper.formatNumber;
      let coins = [];
      let coinTotal = 0;

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

          let holdAmount = typeof localStorage[feed.symbol] === 'undefined' ? 0 : localStorage[feed.symbol] * feed.price_usd;
          let holdings = ( <p> hold: {formatNumber(holdAmount)} </p>);
          coinTotal += holdAmount;
          let name = '';
          // short names only
          if(feed.name.length>9){
            name = feed.symbol;
          }else{
            name = feed.name;
          }
          return (
                <CoinContainer key={i} name={name} price_usd={feed.price_usd} classes={classes} percent={percent}>
                  {holdings}
                </CoinContainer>
          );
      });
      // but 3 coin containers in a row div
      while (coinContainers.length > 0) {
        let row = (<div key={Math.random()} className="row">{coinContainers.splice(0,3)}</div>);
        coins.push(row);
      }
      // Only display the total coin value if "hold" values have been entered
      if (coinTotal > 0) {
        document.getElementById('coin-total').textContent = 'Total: ' + formatNumber(coinTotal);
      }

      return coins;
    }
  }
    render() {
      return (
        <div className="container">
          <div className="row">
            <div className="nine columns">
              <div id="coin-total"></div>
            </div>
            <div className="three columns expand-btn-container">
              <button id="expand-btn" onClick={this.handleExpand}>&#43;</button>
            </div>
            <div className="twelve columns expand " ref={(value)=>this.expand = value}>
              <form onSubmit={this.handleSubmit} >
                  <label for="filter-coins">Comma sperated list of coin ids</label>
                  <input id="filter-coins" type="text" name="filteredCoins" value={this.state.filteredCoins} onChange={this.handleInputChange} placeholder="btc,eth,xrp" required/>
                  <input className="button-primary" type="submit" value="filter" ref={(value) => this.filterSbmt = value} />
              </form>
              <form onSubmit={this.handleSubmitCoinAmount} >
                  <label>Hold amount should be coin amounts not dollar amount you hold</label>
                  <input type="text" name="coinId" value={this.state.coinId} onChange={this.handleInputChange} placeholder="Coin symbol e.g btc" required />
                  <input type="text" name="coinAmount" value={this.state.coinAmount} onChange={this.handleInputChange} placeholder="Holding amount e.g 1000" required />
                  <input className="button-primary" type="submit" value="Add" ref={(value) => this.amountSbmt = value} />
              </form>
            </div>
          </div>
          <img id="loading-gif" style={{display: 'block',margin: "0 auto"}} src="./loading.gif "></img>
          {this.renderSpinners()}
        </div>
      );
    }
  }

  export default App;
