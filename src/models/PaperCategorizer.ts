import { ObjectId } from 'bson';

export interface PaperCategorizer {
  _id: ObjectId;
  _partition: string;
  name: string;
  count: number;
}

export interface PaperTag extends PaperCategorizer {
  _id: ObjectId;
  _partition: string;
  name: string;
  count: number;
}

export interface PaperFolder extends PaperCategorizer {
  _id: ObjectId;
  _partition: string;
  name: string;
  count: number;
}

export interface FeedSubscription extends PaperCategorizer {
    _id: ObjectId;
    _partition: string;
    name: string;
    count: number;
    url: string;
  }


export type CategorizerType = 'PaperTag' | 'PaperFolder' | 'FeedSubscription';

export const PaperTagSchema = {
  name: 'PaperTag',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    _partition: 'string?',
    name: 'string',
    count: 'int',
  },
};

export const PaperFolderSchema = {
  name: 'PaperFolder',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    _partition: 'string?',
    name: 'string',
    count: 'int',
  },
};

export const FeedSubscription = {
    name: 'PaperFolder',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      _partition: 'string?',
      name: 'string',
      count: 'int',
      url: 'string'
    },
  };