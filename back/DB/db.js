import { mkdir, writeFile, readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DB {
  constructor(nameColection) {
    this._nameColection = nameColection;
    this.instanceMethod();
  }

  async instanceMethod() {
    const projectFolder = path.join(__dirname, this._nameColection);
    await mkdir(projectFolder, { recursive: true });
  }

  async create(data) {
    const _id = uuidv4();
    const user = { _id, ...data };
    const userStringifyed = JSON.stringify(user, null, 2);
    const pathNewFile = path.join(
      __dirname,
      this._nameColection,
      _id + ".json"
    );
    try {
      await writeFile(pathNewFile, userStringifyed, {
        flag: "wx",
      });
      return userStringifyed;
    } catch (e) {
      console.error(e.message);
      return "Failed to create a record";
    }
  }
  async createWithId(id, data) {
    const userStringifyed = JSON.stringify(data, null, 2);
    const pathNewFile = path.join(__dirname, this._nameColection, id + ".json");
    try {
      await writeFile(pathNewFile, userStringifyed, {
        flag: "wx",
      });
      return userStringifyed;
    } catch (e) {
      console.error(e.message);
      return "Failed to create a record";
    }
  }

  async getAllcolection() {
    const pathDir = path.join(__dirname, this._nameColection);
    const result = [];
    try {
      const files = await readdir(pathDir);
      for (const item of files) {
        const pathFile = path.join(pathDir, item);
        const content = await readFile(pathFile);
        const obj = JSON.parse(content);
        result.push(obj);
      }
      return JSON.stringify(result, null, 2);
    } catch (e) {
      console.error(e.message);
      return e.message;
    }
  }

  async getElemnt(id) {
    const pathFile = path.join(__dirname, this._nameColection, id + ".json");
    try {
      const content = await readFile(pathFile);
      return content.toString();
    } catch (e) {
      console.error(e.message);
      return undefined;
    }
  }

  async updateElement(id, data) {
    const pathFile = path.join(__dirname, this._nameColection, id + ".json");
    if (!uuidValidate(id)) {
      return "Unsuitable id format";
    }
    try {
      //const content = await readFile(pathFile);
      //const obj = JSON.parse(content);
      //const updateObj = { ...obj, ...data };
      const stringifyedObj = JSON.stringify(data, null, 2);
      await writeFile(pathFile, stringifyedObj, {
        flag: "w+",
      });

      return stringifyedObj;
    } catch (e) {
      console.error(e.message);
      return "No results";
    }
  }

  async deleteElement(id) {
    const pathFile = path.join(__dirname, this._nameColection, id + ".json");
    if (!uuidValidate(id)) {
      return "Unsuitable id format";
    }
    try {
      await unlink(pathFile);
      return "The item has been deleted";
    } catch (e) {
      console.error(e.message);
      return "No results";
    }
  }
}
