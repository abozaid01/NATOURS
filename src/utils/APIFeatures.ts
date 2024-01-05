import { Query, Document } from 'mongoose';

interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

const excludedFields = ['page', 'sort', 'limit', 'fields'];

class APIFeatures<T extends Document> {
  private query: Query<T[], T>;
  private reqQuery: ParsedQs;

  constructor(query: Query<T[], T>, reqQuery: ParsedQs) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  public get queryExec(): Query<T[], T> {
    return this.query;
  }

  filter() {
    const queryObj = { ...this.reqQuery };
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr: string;
    queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy: string = (this.reqQuery.sort as string).split(',').join(' ');
      this.query.sort(sortBy);
    } else this.query.sort('-createdAt');
    return this;
  }

  project() {
    if (this.reqQuery.fields) {
      const fields: string = (this.reqQuery.fields as string).split(',').join(' ');
      this.query.select(fields);
    } else this.query.select('-__v');

    return this;
  }

  paginate() {
    const page: number = +(this.reqQuery.page || 1);
    const limit: number = +(this.reqQuery.limit || 10);
    const skip: number = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
