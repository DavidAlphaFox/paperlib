import Realm from "realm";
import { ObjectId } from "bson";
import path from "path";

export const formatString = ({
  str: str,
  returnEmpty: returnEmpty = true,
  removeNewline: removeNewline = false,
  removeWhite: removeWhite = false,
  removeSymbol: removeSymbol = false,
  removeStr: removeStr = null,
  lowercased: lowercased = false,
  trimWhite: trimWhite = false,
}) => {
  var formatted = str;
  if (formatted) {
    if (removeNewline) {
      formatted = formatted.replace(/(\r\n|\n|\r)/gm, "");
    }
    if (trimWhite) {
      formatted = formatted.trim();
    }
    if (removeWhite) {
      formatted = formatted.replace(/\s/g, "");
    }
    if (removeSymbol) {
      formatted = formatted.replace(/[^a-zA-Z0-9]/g, "");
    }
    if (removeStr) {
      formatted = formatted.replace(removeStr, "");
    }
    if (lowercased) {
      formatted = formatted.toLowerCase();
    }
    return formatted;
  } else {
    return "";
  }
};

export const PaperFolderSchema = {
  name: "PaperFolder",
  primaryKey: "_id",
  properties: {
    id: "string",
    _id: "string",
    _partition: "string?",
    name: "string",
    count: "int",
  },
};

export const PaperTagSchema = {
  name: "PaperTag",
  primaryKey: "_id",
  properties: {
    id: "string",
    _id: "string",
    _partition: "string?",
    name: "string",
    count: "int",
  },
};

export const PaperEntitySchema = {
  name: "PaperEntity",
  primaryKey: "_id",
  properties: {
    id: "objectId",
    _id: "objectId",
    _partition: "string?",
    addTime: "date",

    title: "string",
    authors: "string",
    publication: "string",
    pubTime: "string",
    pubType: "int",
    doi: "string",
    arxiv: "string",
    mainURL: "string",
    supURLs: {
      type: "list",
      objectType: "string",
    },
    rating: "int",
    tags: {
      type: "list",
      objectType: "PaperTag",
    },
    folders: {
      type: "list",
      objectType: "PaperFolder",
    },
    flag: "bool",
    note: "string",
  },
};

export class PaperEntityDraft {
  constructor(entity) {
    if (!entity) {
      this._id = new ObjectId();
      this.id = this._id;
      this._partition = "";
      this.addTime = new Date();
      this.title = "";
      this.authors = "";
      this.publication = "";
      this.pubTime = "";
      this.pubType = 2;
      this.doi = "";
      this.arxiv = "";
      this.mainURL = "";
      this.supURLs = [];
      this.rating = 0;
      this.tags = "";
      this.folders = "";
      this.flag = false;
      this.note = "";
    } else {
      this._id = entity._id;
      this.id = entity.id;
      this._partition = entity._partition;
      this.addTime = entity.addTime;
      this.title = entity.title;
      this.authors = entity.authors;
      this.publication = entity.publication;
      this.pubTime = entity.pubTime;
      this.pubType = entity.pubType;
      this.doi = entity.doi;
      this.arxiv = entity.arxiv;
      this.mainURL = entity.mainURL;
      this.rating = entity.rating;
      this.flag = entity.flag;
      this.note = entity.note;

      this.supURLs = [];
      for (let url of entity.supURLs) {
        this.supURLs.push(url);
      }
      this.tags = [];
      if (typeof entity.tags === "string") {
        this.tags = entity.tags;
      } else {
        for (let tag of entity.tags) {
          this.tags.push(tag.name);
        }
        this.tags = this.tags.join("; ");
      }
      this.folders = [];
      if (typeof entity.folders === "string") {
        this.folders = entity.folders;
      } else {
        for (let folder of entity.folders) {
          this.folders.push(folder.name);
        }
        this.folders = this.folders.join("; ");
      }
    }
  }

  setValue(key, value, allowEmpty) {
    if (value != null) {
      var formatedValue = value;
      if (
        typeof formatedValue === "string" ||
        formatedValue instanceof String
      ) {
        if (key == "title" || key == "authors") {
          formatedValue = formatString({
            str: formatedValue,
            removeNewline: true,
            removeStr: ".",
          });
        }
        if (formatedValue) {
          this[key] = formatedValue;
        } else {
          if (allowEmpty) {
            this[key] = formatedValue;
          }
        }
      } else {
        this[key] = formatedValue;
      }
    } else {
      if (allowEmpty) {
        this[key] = value;
      }
    }
  }
}

export class DBRepository {
  constructor(path) {
    this.path = path;
    this._realm = null;
    this._schemaVersion = 4;

    this.initRealm();
  }

  async realm() {
    if (!this._realm) {
      await this.initRealm();
    }
    return this._realm;
  }

  async initRealm() {
    if (this._realm) {
      this._realm.close();
      this._realm = null;
    }
    this.initLocal();
  }

  initLocal() {
    console.log("Init Local.");
    this._realm = new Realm({
      schema: [PaperEntitySchema, PaperTagSchema, PaperFolderSchema],
      schemaVersion: this._schemaVersion,
      path: path.join(this.path, "default.realm"),
      migration: this.migrate,
    });
  }

  async buildTag(entity) {
    let realm = await this.realm();
    var tagNames = [];
    var tagObjs = [];
    if (typeof entity.tags == "string") {
      let tagsStr = formatString({ str: entity.tags, removeWhite: true });
      tagNames = tagsStr.split(";");
    } else {
      tagNames = entity.tags.map((tag) => {
        return tag.name;
      });
    }
    for (const name of tagNames) {
      let tagName = formatString({
        str: name,
        returnEmpty: true,
        trimWhite: true,
      });
      if (tagName) {
        var tagObj;
        tagObj = realm.objectForPrimaryKey("PaperTag", "tag-" + tagName);
        if (tagObj) {
          realm.write(() => {
            tagObj.count += 1;
          });
        } else {
          tagObj = {
            _id: "tag-" + tagName,
            id: "tag-" + tagName,
            name: tagName,
            count: 1,
          };
        }
        if (this.syncUser) {
          realm.write(() => {
            tagObj._partition = this.syncUser.id;
          });
        }
        tagObjs.push(tagObj);
      }
    }
    return tagObjs;
  }

  async buildFolder(entity) {
    let realm = await this.realm();
    var folderNames = [];
    var folderObjs = [];
    if (typeof entity.folders == "string") {
      let foldersStr = formatString({ str: entity.folders, removeWhite: true });
      folderNames = foldersStr.split(";");
    } else {
      folderNames = entity.folders.map((folder) => {
        return folder.name;
      });
    }
    for (const name of folderNames) {
      let folderName = formatString({
        str: name,
        returnEmpty: true,
        trimWhite: true,
      });
      if (folderName) {
        var folderObj;
        folderObj = realm.objectForPrimaryKey(
          "PaperFolder",
          "folder-" + folderName
        );
        if (folderObj) {
          realm.write(() => {
            folderObj.count += 1;
          });
        } else {
          folderObj = {
            _id: "folder-" + folderName,
            id: "folder-" + folderName,
            name: folderName,
            count: 1,
          };
        }
        if (this.syncUser) {
          realm.write(() => {
            folderObj._partition = this.syncUser.id;
          });
        }
        folderObjs.push(folderObj);
      }
    }
    return folderObjs;
  }

  async add(entity) {
    if (this.syncUser) {
      entity._partition = this.syncUser.id;
    }
    entity.tags = [];
    entity.folders = [];

    let realm = await this.realm();

    let existEntities = realm
      .objects("PaperEntity")
      .filtered(
        `title == \"${entity.title}\" and authors == \"${entity.authors}\"`
      );
    if (existEntities.length > 0) {
      return false;
    }
    realm.write(() => {
      realm.create("PaperEntity", entity);
    });
    return true;
  }

  // Update
  async update(entity) {
    let realm = await this.realm();
    let editEntity = realm.objectForPrimaryKey(
      "PaperEntity",
      new ObjectId(entity._id)
    );
    realm.write(() => {
      editEntity.title = entity.title;
      editEntity.authors = entity.authors;
      editEntity.publication = entity.publication;
      editEntity.pubTime = entity.pubTime;
      editEntity.pubType = entity.pubType;
      editEntity.doi = entity.doi;
      editEntity.arxiv = entity.arxiv;
      editEntity.mainURL = entity.mainURL;
      editEntity.supURLs = entity.supURLs;
      editEntity.rating = entity.rating;
      editEntity.flag = entity.flag;
      editEntity.note = entity.note;
    });

    realm.write(() => {
      // remove old tags
      for (const tag of editEntity.tags) {
        let tagObj = realm.objectForPrimaryKey("PaperTag", tag._id);
        tagObj.count -= 1;
        if (tagObj.count <= 0) {
          realm.delete(tagObj);
        }
      }
      editEntity.tags = [];
    });
    // add new tags
    let tagObjs = await this.buildTag(entity);

    realm.write(() => {
      for (const tag of tagObjs) {
        editEntity.tags.push(tag);
      }

      // remove old folders
      for (const folder of editEntity.folders) {
        let folderObj = realm.objectForPrimaryKey("PaperFolder", folder._id);
        folderObj.count -= 1;
        if (folderObj.count <= 0) {
          realm.delete(folderObj);
        }
      }
      editEntity.folders = [];
    });
    // add new folders
    let folderObjs = await this.buildFolder(entity);
    realm.write(() => {
      for (const folder of folderObjs) {
        editEntity.folders.push(folder);
      }
    });
  }
}
