const mongosse = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongosse.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
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
        },
        ratingsAverage: { type: Number, default: 4.5 },
        ratingsQuantity: { type: Number, default: 0 },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        pricrDiscount: Number,
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
