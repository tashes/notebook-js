import { expect } from "chai";

import { GENIDREGEXP, BLOCKIDREGEXP, PROPKEY } from "./const";
import { List, Wrap } from "../utils/errors";

export class Block {
    #id;
    #blockid;
    #type;
    #data;
    #props;

    constructor({ id = "", blockid = "", type = "", data = {}, props = {} }) {
        let idError = Block.checkId(id);
        if (idError === true) {
            this.#id = id;
        } else {
            throw Wrap("Invalid Block", idError);
        }
        let blockidError = Block.checkBlockid(blockid);
        if (blockidError === true) {
            this.#blockid = blockid;
        } else {
            throw Wrap("Invalid Block", blockidError);
        }
        let typeError = Block.checkType(type);
        if (typeError === true) {
            this.#type = type;
        } else {
            throw Wrap("Invalid Block", typeError);
        }
        let dataError = Block.checkData(data);
        if (dataError === true) {
            this.#data = data;
        } else {
            throw Wrap("Invalid Block", dataError);
        }
        let propsError = Block.checkProps(props);
        if (propsError === true) {
            this.#props = props;
        } else {
            throw Wrap("Invalid Props", propsError);
        }
    }

    get id() {
        return this.#id;
    }
    get blockid() {
        return this.#blockid;
    }
    get type() {
        return this.#type;
    }
    get data() {
        return this.#data;
    }
    get props() {
        return this.#props;
    }

    set id(value) {
        let error = Block.checkId(value);
        if (error === true) {
            this.#id = value;
        } else {
            throw Wrap("Cannot set id", error);
        }
    }
    set blockid(value) {
        let error = Block.checkBlockid(value);
        if (error === true) {
            this.#blockid = value;
        } else {
            throw Wrap("Cannot set blockid", error);
        }
    }
    set type(value) {
        let error = Block.checkType(value);
        if (error === true) {
            this.#type = value;
        } else {
            throw Wrap("Cannot set type", error);
        }
    }
    set data(value) {
        let error = Block.checkData(value);
        if (error === true) {
            this.#data = value;
        } else {
            throw Wrap("Cannot set data", error);
        }
    }
    set props(value) {
        let error = Block.checkProps(value);
        if (error === true) {
            this.#props = value;
        } else {
            throw Wrap("Cannot set props", error);
        }
    }

    toObj() {
        return {
            id: this.#id,
            blockid: this.#blockid,
            type: this.#type,
            data: this.#data,
            props: this.#props,
        };
    }

    static checkId(value) {
        try {
            expect(value).to.be.a("string");
            expect(value).to.match(GENIDREGEXP);
        } catch (e) {
            return Wrap("Invalid id", e);
        }
        return true;
    }
    static checkBlockid(value) {
        try {
            expect(value).to.be.a("string");
            expect(value).to.match(BLOCKIDREGEXP);
        } catch (e) {
            return Wrap("Invalid blockid", e);
        }
        return true;
    }
    static checkType(value) {
        try {
            expect(value).to.be.a("string");
        } catch (e) {
            return Wrap("Invalid type", e);
        }
        return true;
    }
    static checkData(value) {
        try {
            expect(value).to.exist;
        } catch (e) {
            return Wrap("Invalid data", e);
        }
        return true;
    }
    static checkProps(value) {
        try {
            expect(value).to.be.an("object");
            let keys = Object.keys(value);
            let keysErrors = [];
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let error = Block.checkPropsKey(key);
                if (error !== true) keysErrors.push(error);
            }
            let vals = Object.values(value);
            let valsErrors = [];
            for (let i = 0; i < vals.length; i++) {
                let val = vals[i];
                let error = Block.checkPropsVal(val);
                if (error !== true) valsErrors.push(error);
            }
            let allErrors = [].concat(keysErrors, valsErrors);
            if (allErrors.length > 0) throw List(allErrors);
        } catch (e) {
            return Wrap("Invalid props", e);
        }
        return true;
    }
    static checkPropsKey(value) {
        try {
            expect(value).to.be.a("string");
            expect(value).to.match(PROPKEY);
        } catch (e) {
            return Wrap("Invalid props key", e);
        }
        return true;
    }
    static checkPropsVal(value) {
        try {
            expect(value).to.be.a("string");
        } catch (e) {
            return Wrap("Invalid props val", e);
        }
        return true;
    }
}
