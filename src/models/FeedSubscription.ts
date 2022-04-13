import { ObjectId } from 'bson';

export interface FeedSubscription {
  _id: ObjectId;
  _partition: string;
  name: string;
  count: number;
  url: string;
}

export const FeedSubscriptionSchema = {
  name: 'FeedSubscription',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    _partition: 'string?',
    name: 'string',
    count: 'int',
    url: 'string',
  },
};

export class FeedSubscriptionDraft {
  _id: ObjectId | string = '';
  _partition = '';
  name = '';
  count = 0;
  url = '';

  [Key: string]: unknown;

  constructor(initObjectId = false) {
    if (initObjectId) {
      this._id = new ObjectId();
    }
  }

  initialize(feed: FeedSubscription | FeedSubscriptionDraft) {
    this._id = feed._id;
    this._partition = feed._partition;
    this.name = feed.name;
    this.count = feed.count;
    this.url = feed.url;
  }

  create(): FeedSubscription {
    const id = this._id ? new ObjectId(this._id) : new ObjectId();
    this._id = id.toString();

    const feed = {
      _id: id,
      _partition: this._partition,
      name: this.name,
      count: this.count,
      url: this.url,
    };
    return feed;
  }

  setValue(key: string, value: unknown) {
    if (value && value !== 'undefined') {
      this[key] = value;
    }
  }
}
