/* eslint-disable */

import axios from 'axios';
import Stripe from 'stripe';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51PsR4gL6Rh9WkGcNYUxgDdNfMURnixVgxs2pyV04rWXXqxqz500rxex6y2Jp2tcg9ASlyBoxHKO8U10YAs2uGR6y00jjaloQG5',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8080/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log(session);
    location.assign(session.data.session.url);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
