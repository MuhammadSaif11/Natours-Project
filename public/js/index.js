/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { bookTour } from './stripe';

const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {

    e.target.textContent = 'Processing...'
    const {tourId} = e.target.dataset;
    bookTour(tourId);
  });
