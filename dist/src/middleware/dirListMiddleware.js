"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const MAIN_DIR = process.env.NODE_ENV === "production"
    ? path_1.default.resolve(process.cwd(), "..", "data")
    : "/mnt/c/Users/hkm/Documents/DragonNest/bin/data";
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const dirListMiddleware = async (req, res) => {
    const { path: pathname = "" } = req.body ?? {};
    const sourcePath = path_1.default.join(MAIN_DIR, pathname);
    try {
        let items = await readdir(sourcePath);
        const data = items.reduce((acc, curr) => {
            const itemPath = path_1.default.join(sourcePath, curr);
            const itemStat = fs_1.default.statSync(itemPath);
            if (itemStat.isDirectory())
                return [
                    ...acc,
                    {
                        path: path_1.default.join(pathname, curr),
                        name: curr,
                        totalItems: itemStat.isDirectory()
                            ? fs_1.default.readdirSync(itemPath).length
                            : 0,
                    },
                ];
            else
                return acc;
        }, []);
        res.json({
            message: "OK",
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
exports.default = dirListMiddleware;
