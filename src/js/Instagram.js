import axios from 'axios';

// Polyfill for ie11
import es6Promise from 'es6-promise';
import 'nodelist-foreach-polyfill';

es6Promise.polyfill();

export default class Instagram {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.requestUrl = `https://api.instagram.com/v1/users/self/media/recent/?access_token=${this.accessToken}`;
    this.cards = document.querySelectorAll('.card');
    this.button = document.querySelectorAll('.card__button');

    // Listen click to change the instagram post
    this.listenClickOnButton();
    // default request
    this.request();
  }

  request() {
    axios.get(this.requestUrl)
      .then((response) => {
        this.response = response.data;
        this.requestCallback();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  requestCallback() {
    this.cards.forEach((element) => {
      this.fillCard(element);
    });
  }

  getRandomNumber(max) {
    let tempRandom = Math.floor(Math.random() * max);
    while (tempRandom === this.random) {
      tempRandom = Math.floor(Math.random() * max);
    }
    return tempRandom;
  }

  fillCard(card) {
    this.random = this.getRandomNumber(this.response.data.length);
    const data = this.response.data[this.random];
    // title
    const title = data.caption ? data.caption.text : 'No title for this post';
    card.querySelector('.card__title').innerHTML = title;

    // description
    const location = data.location ? data.location.name : 'No location for this post';
    card.querySelector('.card__description').innerHTML = location;

    // img
    card.querySelector('.card__img').src = data.images.low_resolution.url;
  }

  listenClickOnButton() {
    this.button.forEach((element, i) => {
      element.addEventListener('click', () => {
        this.fillCard(this.cards[i]);
      });
    });
  }
}
