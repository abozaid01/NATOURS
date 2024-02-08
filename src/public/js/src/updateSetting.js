/* eslint-disable */
import { hideAlert, showAlert } from './alert.js';

const handleResponse = (result) => {
  if (result.status === 'success') {
    showAlert('success', 'Updated Successfully');
    window.setTimeout(() => {
      location.assign('/me');
    }, 1500);
  } else {
    showAlert('error', result.message);
    setTimeout(hideAlert, 2000);
  }
};

// type is either 'data' or 'password'
export const updateData = async (data, type) => {
  try {
    let response;
    // You Don't need to specify Headers when sending Form-data
    if (type === 'data') {
      response = await fetch('/api/v1/users/me', { method: 'PATCH', body: data });
      response = await response.json();
    }
    // Specify Header to send JSON
    else if (type === 'password') {
      response = await fetch('/api/v1/users/update-password', {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      response = await response.json();
    }

    handleResponse(response);
  } catch (error) {
    showAlert('error', 'Something went wrong');
  }
};
