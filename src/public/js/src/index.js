/* eslint-disable */
import { login, logout } from './login.js';
import { updateData } from './updateSetting.js';
import { displayMap } from './mapbox.js';

// DOM Elements
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const settingForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const map = document.getElementById('map');

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (settingForm)
  settingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateData({ name, email }, 'data');

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateData(form, 'data');
  });

if (passwordForm)
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const currentPassword = document.getElementById('password-current').value;

    await updateData({ password, passwordConfirm, currentPassword }, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
