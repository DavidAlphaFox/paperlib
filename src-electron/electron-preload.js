/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { contextBridge } from "electron";
const sqlite3 = require("sqlite3").verbose();

function conn(path) {
  let db = new sqlite3.Database(path);
  db.query = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
      that.all(sql, params, function (error, rows) {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  };
  db.launch = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
      that.run(sql, params, function (error) {
        if (error) {
          console.error(error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };

  return db;
}

const moment = require("moment");
import { uid } from "quasar";
import { DBRepository, PaperEntityDraft } from "./realm";

class PaperMeta {
  constructor() {
    const time = moment();
    this.addTime = time.format("YYYY-MM-DD HH:mm:ss");

    this.id = "";
    this.doi = "";
    this.title = "";
    this.authors = "";
    this.pub = "";
    this.pubType = "";
    this.pubTime = "";
    this.citeKey = "";
    this.note = "";
    this.rating = 0;
    this.bib = "";
    this.paperFile = "";
    this.attachments = [];
    this.tags = [];
    this.arxiv = "";
    this.flag = 0;
    this.completed = false;
  }

  update(metaObj) {
    this.id = metaObj.id;
    this.addTime = metaObj.addTime;
    this.doi = metaObj.doi;
    this.title = metaObj.title;
    this.authors = metaObj.authors;
    this.pub = metaObj.pub;
    this.pubType = metaObj.pubType;
    this.pubTime = metaObj.pubTime;
    this.citeKey = metaObj.citeKey;
    this.note = metaObj.note;
    this.rating = metaObj.rating;
    this.paperFile = metaObj.paperFile;
    this.attachments = [];
    if (
      !(
        metaObj.attachments === null ||
        typeof metaObj.attachments === "undefined"
      )
    ) {
      metaObj.attachments.forEach((attachment) => {
        this.addAttachment(attachment);
      });
    }
    this.tags = [];
    if (!(metaObj.tags === null || typeof metaObj.tags === "undefined")) {
      this.addTags(metaObj.tags);
    }
    this.arxiv = metaObj.arxiv;
    this.flag = metaObj.flag;
    this.constructBib();
  }

  hasAttr(name) {
    if (name === "attachments" || name === "tags") {
      return this[name].length !== 0;
    }
    return !(
      this[name] === null ||
      this[name] === "" ||
      typeof this[name] === "undefined"
    );
  }

  setAttr(name, value) {
    if (value === null || value === "" || typeof value === "undefined") {
      if (name === "attachments" || name === "tags") {
        this[name] = [];
      } else {
        this[name] = "";
      }
    } else {
      this[name] = value;
    }
  }

  mergeAttr(name, value) {
    if (!(value === null || value === "" || typeof value === "undefined")) {
      this.setAttr(name, value);
    }
  }

  merge(metaObj) {
    this.mergeAttr("id", metaObj.id);
    this.mergeAttr("addTime", metaObj.addTime);
    this.mergeAttr("title", metaObj.title);
    this.mergeAttr("authors", metaObj.authors);
    this.mergeAttr("pub", metaObj.pub);
    this.mergeAttr("pubType", metaObj.pubType);
    this.mergeAttr("pubTime", metaObj.pubTime);
    this.mergeAttr("citeKey", metaObj.citeKey);
    this.mergeAttr("note", metaObj.note);
    this.mergeAttr("rating", metaObj.rating);
    this.mergeAttr("paperFile", metaObj.paperFile);
    this.mergeAttr("addTime", metaObj.addTime);
    this.mergeAttr("doi", metaObj.doi);
    if (
      metaObj.attachments === null ||
      typeof metaObj.attachments === "undefined"
    ) {
      metaObj.attachments.forEach((attachment) => {
        this.addAttachment(attachment);
      });
    }
    this.addTags(metaObj.tags);
    this.mergeAttr("arxiv", metaObj.arxiv);
    this.mergeAttr("flag", metaObj.flag);
    this.constructBib();
  }

  selfComplete() {
    if (!this.hasAttr("id")) {
      this.id = uid();
    }

    if (!this.hasAttr("citeKey")) {
      if (this.hasAttr("author")) {
        this.citeKey =
          this.authors.split(" and ")[0].replace(" ", "_") + "_" + this.pubTime;
      } else if (this.hasAttr("title")) {
        this.citeKey = this.title.split(" ")[0] + "_" + this.pubTime;
      }
    }

    if (!this.hasAttr("addTime")) {
      const time = moment();
      this.addTime = time.format("YYYY-MM-DD HH:mm:ss");
    }

    if (!this.hasAttr("bib")) {
      if (
        this.pubType === "inproceedings" ||
        this.pubType === "incollection" ||
        this.pubType === "conference"
      ) {
        this.bib = `@inproceedings{${this.citeKey},
    year = {${this.pubTime}},
    title = {{${this.title}}},
    author = {${this.authors}},
    booktitle = {${this.pub}},
  }`;
      } else {
        this.bib = `@article{${this.citeKey},
    year = {${this.pubTime}},
    title = {{${this.title}}},
    author = {${this.authors}},
    journal = {${this.pub}},
   }`;
      }
    }
  }

  constructBib() {
    if (!this.hasAttr("citeKey")) {
      if (this.hasAttr("authors")) {
        this.citeKey =
          this.authors.split(" and ")[0].replace(" ", "_") + "_" + this.pubTime;
      } else if (this.hasAttr("title")) {
        this.citeKey = this.title.split(" ")[0] + "_" + this.pubTime;
      }
    }
    if (
      this.pubType === "inproceedings" ||
      this.pubType === "incollection" ||
      this.pubType === "conference"
    ) {
      this.bib = `@inproceedings{${this.citeKey},
    year = {${this.pubTime}},
    title = {{${this.title}}},
    author = {${this.authors}},
    booktitle = {${this.pub}},
  }`;
    } else {
      this.bib = `@article{${this.citeKey},
    year = {${this.pubTime}},
    title = {{${this.title}}},
    author = {${this.authors}},
    journal = {${this.pub}},
   }`;
    }
  }

  addPaperFile(filePath) {
    this.paperFile = filePath;
  }

  addAttachment(filePath) {
    if (!this.attachments.includes(filePath)) {
      this.attachments.push(filePath);
    }
  }

  addFile(filePath, fileType) {
    if (fileType === "paper") {
      this.addPaperFile(filePath);
    } else if (fileType === "attachment") {
      this.addAttachment(filePath);
    } else {
      console.log("FileType" + fileType + ": " + filePath);
    }
  }

  parseTagsStr(tagsStr) {
    if (!(tagsStr === null || typeof tagsStr === "undefined")) {
      const tagsList = tagsStr.split(";");
      if (tagsList.length === 1 && tagsList[0] === "") {
        return [];
      } else {
        return tagsList;
      }
    } else {
      return [];
    }
  }

  addTags(tags) {
    let tagsList;
    if (Array.isArray(tags)) {
      tagsList = tags;
    } else {
      tagsList = this.parseTagsStr(tags);
    }
    tagsList.forEach((tag) => {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    });
  }

  removeTags(tagsStr) {
    const tagsList = this.parseTagsStr(tagsStr);
    this.tags = this.tags.filter(function (value, index) {
      return !tagsList.includes(value);
    });
  }
}

contextBridge.exposeInMainWorld("api", {
  migrate: async (oldPath) => {
    console.log(oldPath);

    // init sqlite
    const db = conn(oldPath);

    const allData = [];
    const rows = await db.query("SELECT * FROM PaperMetas", []);
    await Promise.all(
      rows.map(async (row) => {
        const meta = new PaperMeta();
        meta.update(row);
        const files = await db.query("SELECT * FROM Files WHERE paperID=?", [
          meta.id,
        ]);
        files.forEach((file) => {
          meta.addFile(file.path, file.type);
        });
        meta.selfComplete();
        allData.push(meta);
      })
    );

    const pathLib = require("path");

    let realm = new DBRepository(pathLib.dirname(oldPath));

    var count = 0;
    var noFile = [];

    for (let oldEntity of allData) {
      let newEntity = new PaperEntityDraft();

      newEntity.addTime = new Date(oldEntity.addTime);

      newEntity.title = oldEntity.title ? oldEntity.title : "";
      newEntity.authors = oldEntity.authors
        ? oldEntity.authors.replace(" and ", ", ")
        : "";
      newEntity.publication = oldEntity.pub ? oldEntity.pub : "";
      newEntity.pubTime = `${oldEntity.pubTime}` ? `${oldEntity.pubTime}` : "";
      newEntity.pubType = ["journal", "conference", "others"].indexOf(
        oldEntity.pubType
      );
      newEntity.doi = oldEntity.doi ? oldEntity.doi : "";
      newEntity.arxiv = oldEntity.arxiv ? oldEntity.arxiv : "";
      newEntity.mainURL = oldEntity.paperFile
        ? pathLib.win32.basename(oldEntity.paperFile)
        : "";
      if (!newEntity.mainURL) {
        noFile.push(newEntity.title);
      }
      newEntity.rating = oldEntity.rating ? oldEntity.rating : 0;
      newEntity.flag = oldEntity.flag == 0 ? false : true;
      newEntity.note = oldEntity.note ? oldEntity.note : "";
      newEntity.supURLs = [];
      for (let url of oldEntity.attachments) {
        if (pathLib.win32.extname(url) === ".pdf") {
          newEntity.supURLs.push(url);
        }
      }

      let success = await realm.add(newEntity);

      if (success) {
        newEntity.tags = oldEntity.tags ? oldEntity.tags.join(";") : "";
        await realm.update(newEntity);
      } else {
        count += 1;
      }
    }

    return [count, noFile];
  },
});
