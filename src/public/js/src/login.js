/* eslint-disable */
import { hideAlert, showAlert } from './alert.js';

export const login = async (email, password) => {
  try {
    const response = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (result.status === 'success') {
      showAlert('success', 'Logged In Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', result.message);
      setTimeout(hideAlert, 2000);
    }
  } catch (error) {
    showAlert('error', 'Something went wrong');
  }
};

export const logout = async () => {
  try {
    const response = await fetch('/api/v1/users/logout');
    const result = await response.json();
    if (result.status === 'success') {
      showAlert('success', 'Logged out Successfully');
      setTimeout(() => {
        location.reload(true); // NOTE: force reload from the server, instead of reloading it from browser cache
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', 'Something went wrong');
  }
};
