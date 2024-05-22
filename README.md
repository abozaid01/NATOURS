<h1 align="center">
<img src="./src/public/img/logo-green-round.png" alt="Natours" width="200"></a>
<br>
Natours

</h1>

## Demonstration

![demo](demo.gif)

## Build With

- [NodeJS](https://nodejs.org/en/) - JS runtime environment
- [Express](http://expressjs.com/) - The web framework used
- [Typescrip](https://www.typescriptlang.org/) - Statc type Checking Language
- [Mongoose](https://mongoosejs.com/) - Object Data Modelling (ODM) library
- [MongoDB](https://www.mongodb.com/) - nosql database
- [Pug](https://pugjs.org/api/getting-started.html) - High performance template engine
- [JSON Web Token](https://jwt.io/) - Security token
- [parcel](https://parceljs.org/) - An extremely fast bundler for the web
- [Stripe](https://stripe.com/) - Online payment API
- [Postman](https://www.getpostman.com/) - API testing
- [Mailtrap](https://mailtrap.io/) - Email testing platform
- [Docker](https://www.docker.com/) - virtualiztion technology

## Installation

You can fork the app or you can git-clone the app into your local machine. Once done that, you can start the app

```
set your env variables
$ docker-compose -f docker-compose.dev up --build -d
```

## Key Features

- Authentication and Authorization
  - Signup, Login and logout
- Tour
  - Manage booking, check tours map, check user's reviews and ratings
- User profile
  - Update username, profile photo, email, and password
- Credit card payment using Stripe

## How To Use

### Book a tour

- Login or Signup to the site
- Search for tours that you want to book
- Book a tour
- Proceed to the payment using Stripe
- Enter the card details (Test Mode):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: any
  - CVV: any
  ```
- Finished!

### Manage your booking

- Check the tour you have booked in "Manage Booking" page in your user settings. You'll be automatically redirected to this
  page after you have completed the booking.

### Update your profile

- You can update your own username, profile photo, email and password.

## Contribution

Feel free to create an issue for bugs or features if you run into any issues or have questions, ideas or concerns.
Please enjoy and feel free to share your opinion, constructive criticism, or comments about my work. Thank you! 🙂

## Acknowledgement

- This project is part of the online course I've taken at Udemy. Thanks to [Jonas Schmedtmann](https://twitter.com/jonasschmedtman) for creating this awesome course!
