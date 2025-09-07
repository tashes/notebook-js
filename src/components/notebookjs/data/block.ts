import { GENIDREGEXP, BLOCKIDREGEXP, PROPKEY } from "./const";
import { List, Wrap } from "../utils/errors";
import type { BlockRaw } from "../types";

export type BlockInit<D = unknown, P extends Record<string, string> = Record<string, string>> = {
  id: string;
  blockid: string;
  type: string;
  data: D;
  props: P;
};

export class Block<D = unknown, P extends Record<string, string> = Record<string, string>> {
  #id: string;
  #blockid: string;
  #type: string;
  #data: D;
  #props: P;

  constructor({ id = "", blockid = "", type = "", data = {} as D, props = {} as P }: Partial<BlockInit<D, P>> & BlockInit<D, P>) {
    const idError = Block.checkId(id);
    if (idError === true) this.#id = id; else throw Wrap("Invalid Block", idError);
    const blockidError = Block.checkBlockid(blockid);
    if (blockidError === true) this.#blockid = blockid; else throw Wrap("Invalid Block", blockidError);
    const typeError = Block.checkType(type);
    if (typeError === true) this.#type = type; else throw Wrap("Invalid Block", typeError);
    const dataError = Block.checkData(data as unknown);
    if (dataError === true) this.#data = data as D; else throw Wrap("Invalid Block", dataError);
    const propsError = Block.checkProps(props as unknown);
    if (propsError === true) this.#props = props as P; else throw Wrap("Invalid Props", propsError);
  }

  get id() { return this.#id; }
  get blockid() { return this.#blockid; }
  get type() { return this.#type; }
  get data(): D { return this.#data; }
  get props(): P { return this.#props; }

  set id(value: string) {
    const error = Block.checkId(value);
    if (error === true) this.#id = value; else throw Wrap("Cannot set id", error);
  }
  set blockid(value: string) {
    const error = Block.checkBlockid(value);
    if (error === true) this.#blockid = value; else throw Wrap("Cannot set blockid", error);
  }
  set type(value: string) {
    const error = Block.checkType(value);
    if (error === true) this.#type = value; else throw Wrap("Cannot set type", error);
  }
  set data(value: D) {
    const error = Block.checkData(value);
    if (error === true) this.#data = value as D; else throw Wrap("Cannot set data", error);
  }
  set props(value: P) {
    const error = Block.checkProps(value);
    if (error === true) this.#props = value as P; else throw Wrap("Cannot set props", error);
  }

  toObj(): BlockRaw<D, P> {
    return { id: this.#id, blockid: this.#blockid, type: this.#type, data: this.#data, props: this.#props } as BlockRaw<D, P>;
  }

  static checkId(value: unknown): true | Error {
    try {
      if (typeof value !== "string") throw new Error("id must be string");
      if (!GENIDREGEXP.test(value)) throw new Error("id must match GENIDREGEXP");
    } catch (e: any) { return Wrap("Invalid id", e); }
    return true;
  }
  static checkBlockid(value: unknown): true | Error {
    try {
      if (typeof value !== "string") throw new Error("blockid must be string");
      if (!BLOCKIDREGEXP.test(value)) throw new Error("blockid must match BLOCKIDREGEXP");
    } catch (e: any) { return Wrap("Invalid blockid", e); }
    return true;
  }
  static checkType(value: unknown): true | Error {
    try {
      if (typeof value !== "string") throw new Error("type must be string");
    } catch (e: any) { return Wrap("Invalid type", e); }
    return true;
  }
  static checkData(value: unknown): true | Error {
    try {
      if (value === undefined || value === null) throw new Error("data must exist");
    } catch (e: any) { return Wrap("Invalid data", e); }
    return true;
  }
  static checkProps(value: unknown): true | Error {
    try {
      if (typeof value !== "object" || value === null) throw new Error("props must be object");
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      const keysErrors: Error[] = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const error = Block.checkPropsKey(key);
        if (error !== true) keysErrors.push(error);
      }
      const vals = Object.values(obj);
      const valsErrors: Error[] = [];
      for (let i = 0; i < vals.length; i++) {
        const val = vals[i];
        const error = Block.checkPropsVal(val);
        if (error !== true) valsErrors.push(error);
      }
      const allErrors = ([] as Error[]).concat(keysErrors, valsErrors);
      if (allErrors.length > 0) throw List(allErrors);
    } catch (e: any) { return Wrap("Invalid props", e); }
    return true;
  }
  static checkPropsKey(value: unknown): true | Error {
    try {
      if (typeof value !== "string") throw new Error("props key must be string");
      if (!PROPKEY.test(value)) throw new Error("props key must match PROPKEY");
    } catch (e: any) { return Wrap("Invalid props key", e); }
    return true;
  }
  static checkPropsVal(value: unknown): true | Error {
    try {
      if (typeof value !== "string") throw new Error("props value must be string");
    } catch (e: any) { return Wrap("Invalid props val", e); }
    return true;
  }
}
