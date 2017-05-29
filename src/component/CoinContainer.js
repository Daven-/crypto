import React from 'react';

const CoinContainer = (props) => (
  <div className="four columns">
    <div className="coin-container">
        <h1>{props.name}</h1>
        <h3> ${props.price_usd}</h3>
        <p> 1h:<span className={props.classes.hour}> {props.percent.hour}</span></p>
        <p> 24h:<span className={props.classes.day}> {props.percent.day}</span></p>
        <p> 7d:<span className={props.classes.day7}> {props.percent.day7}</span></p>
        {props.children}
    </div>
  </div>
);


export default CoinContainer;
