const mongosse = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongosse.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must be at least 40 characters',
            ],
            minlength: [
                10,
                'A tour name must be at most 10 characters',
            ],
            // validate: [
            //     validator.isAlpha,
            //     'Tour name must only contain characters',
            // ],
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [
                true,
                'A tour must have a maxGroupSize',
            ],
        },
        difficulty: {
            type: String,
            required: [
                true,
                'A tour must have a difficulty',
            ],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                messages:
                    'Difficulty must be : easy, medium, or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1'],
            max: [5, 'Rating must be below 5'],
        },
        ratingsQuantity: { type: Number, default: 0 },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                //"this" only points to current doc ON NEW document CREATION ONLY
                // so it returns flase when update so won't update :(
                //FIXME: fix update issue here
                validator: function (value) {
                    if (this.price !== undefined)
                        return value < this.price;
                },
                message:
                    'Discount price ({VALUE}) Must be below regular price',
            },
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
            required: [
                true,
                'A tour must have a cover image',
            ],
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
    {
        // validateBeforeSave: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//================ Document Middlewares =======================
//runs before .save() and create() but NOT insertMany()
tourSchema.pre('save', function (next) {
    //console.log(this);
    this.name = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre('save', (next) => {
    console.log('saving...');
    next();
});

tourSchema.post('save', (doc, next) => {
    console.log(doc);
    next();
});

//================ Query Middlewares =======================
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(
        `this Query tooks ${
            Date.now() - this.start
        } milliseconds for execution`
    );
    next();
});

//================ Aggregation Middlewares =======================
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: { secretTour: { $ne: true } },
    });
    next();
});

const Tour = mongosse.model('Tour', tourSchema);

module.exports = Tour;
