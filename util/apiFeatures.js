class APIFaetures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1.0) Filtering
        const queryObj = { ...this.queryString };
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
        ];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1.1) Advanced Filtering localhost:3000/api/v1/tours?duration[gte]=5
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lte)\b/g,
            (match) => `$${match}`
        );
        this.query.find(JSON.parse(queryStr));

        return this;
    }

    // 2) Sorting                              http://localhost:3000/api/v1/tours?sort=price,-duration
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort
                .split(',')
                .join(' ');
            this.query = this.query.sort(sortBy);
        } else this.query = this.query.sort('-createdAt'); //DEFAULT sort by newly created

        return this;
    }

    // 3) Field Limiting                   http://localhost:3000/api/v1/tours?fields=name,price
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields
                .split(',')
                .join(' ');

            this.query.select(fields);
        } else this.query = this.query.select('-__v'); //DEFAULT - remove __v

        return this;
    }

    // 4) Pagination                    http://localhost:3000/api/v1/tours?page=2&limit=100   page1=> 1-100 page2=> 101-200 page3=> 201-300
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // if (this.queryString.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours)
        //         throw new Error("this page doesn't exist");
        // }
        return this;
    }
}

module.exports = APIFaetures;
