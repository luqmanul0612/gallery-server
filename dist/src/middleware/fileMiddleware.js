"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const file_type_1 = require("file-type");
const MAIN_DIR = process.env.NODE_ENV === "production"
    ? path_1.default.resolve(process.cwd(), "..", "data")
    : "/mnt/c/Users/hkm/Documents/DragonNest/bin/data";
const fileMiddleware = async (req, res) => {
    const pathFile = req.query.path;
    const dirFile = path_1.default.join(MAIN_DIR, pathFile);
    try {
        const type = await (0, file_type_1.fromFile)(dirFile);
        const mimeType = type?.mime || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=604800");
        const fileStream = fs_1.default.createReadStream(dirFile);
        fileStream.pipe(res);
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
exports.default = fileMiddleware;
