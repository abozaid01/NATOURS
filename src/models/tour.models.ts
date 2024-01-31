import { Schema, model, Query } from 'mongoose';
import ITour from '../interfaces/tour.interface';
import { logger } from '../utils/logger';
import Review from './review.models';
// const validator = require('validator');

// Extend the Mongoose Query interface with custom properties
interface ITourQuery extends Query<ITour[] | ITour | null, ITour> {
  start: number;
}

const tourSchma = new Schema<ITour>(
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
      set: (val: number) => Math.round(val * 10) / 10, // 4.666667 => 46.66667 => 4.7
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // Child Referencing
    guides: [
      {
        type: Schema.ObjectId,
        ref: 'User',
      },
    ],
    // Embedding Documents - Denormalized Dataset
    locations: [
      {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'locations.type' must be 'Point'
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
        description: String,
        day: Number,
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

//================ Add Virtual properties =======================
tourSchma.virtual<ITour>('durationWeeks').get(function () {
  // 'this' refers to the document
  return this.duration / 7;
});

// Virtual Populate - Because of Parent Referncing on the Review Model, the Tour Model has no idea of its own Reviews
tourSchma.virtual<ITour>('reviews', {
  ref: 'Review',
  foreignField: 'tour_id',
  localField: '_id',
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

tourSchma.pre<ITourQuery>(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v' });
  next();
});

tourSchma.post<ITourQuery>(/^find/, function (docs, next) {
  logger?.debug(`this Query tooks ${Date.now() - this.start} milliseconds for execution`);
  next();
});

tourSchma.pre<ITourQuery>('findOneAndDelete', async function (next) {
  const tourId = this.getQuery()._id;
  try {
    await Review.deleteMany({ tour_id: tourId });
    next();
  } catch (error) {
    next(error as Error);
  }
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
