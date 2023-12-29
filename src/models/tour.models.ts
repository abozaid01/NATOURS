import { Schema, model, Query } from 'mongoose';
import ITour from '../interfaces/tour.interface';
import { logger } from '../utils/logger';
// const validator = require('validator');

// Extend the Mongoose Query interface with custom properties
interface ITourQuery extends Query<ITour[] | ITour | null, ITour> {
  start: number;
}

const tourSchma = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be at least 40 characters'],
      minlength: [10, 'A tour name must be at most 10 characters'],
      // validate: [ validator.isAlpha, 'Tour name must only contain characters' ], // NOTE: we pass callback function NOT calling it .isAlph()
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // NOTE: this' refers to the current document ON NEW document (CREATION ONLY)
        // FIXME: when updating it always returns flase so it won't update :( ==> so check if the document being updated (write custom validation function that doesn't need 'this')
        // https://mongoosejs.com/docs/validation.html
        validator: function (this: ITour, value: number) {
          return value < this.price;
        },
        message: `Discount price: ({VALUE}) Must be below regular price`, // mongoose can access value in message
      },
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be : easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

//================ Add Virtual properties =======================
tourSchma.virtual('durationWeeks').get(function () {
  // 'this' refers to the document
  return this.duration / 7;
});

//================ Document Middlewares =======================
// NOTE: runs before .save() and create() but NOT insertMany(), findByIdAndUpdate(), ...
tourSchma.pre('save', function (next) {
  // 'this' refers to the document
  this.slug = this.name.toLocaleLowerCase();
  next();
});

tourSchma.pre('save', (next) => {
  // console.log('saving...');
  next();
});

tourSchma.post('save', (doc, next) => {
  // console.log(doc);
  next();
});

//================ Query Middlewares =======================
// tourSchma.pre('find', function (next) {
// tourSchma.pre('findOne', function (next) {
// tourSchma.pre('findOneAndUpdate', function (next) {
tourSchma.pre<ITourQuery>(/^find/, function (next) {
  // 'this' refers to the Query object, not the document
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchma.post<ITourQuery>(/^find/, function (docs, next) {
  logger?.debug(`this Query tooks ${Date.now() - this.start} milliseconds for execution`);
  next();
});

//================ Aggregation Middlewares =======================
tourSchma.pre('aggregate', function (next) {
  // 'this' refers to the current Aggregation object
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = model<ITour>('Tour', tourSchma);

export default Tour;
