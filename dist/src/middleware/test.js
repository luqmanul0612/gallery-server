"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const data_1 = require("../data");
const file_type_1 = require("file-type");
const MAIN_DIR = process.env.NODE_ENV === "production"
    ? path_1.default.resolve(process.cwd(), "..", "data")
    : "/mnt/c/Users/hkm/Documents/DragonNest/bin/data";
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const getFileList = async ({ pathFile, pageNumber, pageSize, isNested, counters = { skip: 0, total: 0 }, }) => {
    const sourcePath = path_1.default.join(MAIN_DIR, pathFile);
    const isPagination = pageNumber > 0 && pageSize > 0;
    const targetSkipFile = isPagination ? (pageNumber - 1) * pageSize : 0;
    let items = data_1.memoryData[pathFile]
        ? data_1.memoryData[pathFile]
        : (data_1.memoryData[pathFile] = await readdir(sourcePath));
    const data = [];
    for (const curr of items) {
        if (isPagination && counters.total >= pageSize)
            break;
        const dirFile = path_1.default.join(sourcePath, curr);
        const itemStat = fs_1.default.statSync(dirFile);
        if (!itemStat.isDirectory()) {
            if (targetSkipFile > counters.skip) {
                counters.skip++;
                continue;
            }
            const type = await (0, file_type_1.fromFile)(dirFile);
            const realExt = type?.ext ? `.${type.ext}` : ".dat";
            const realFilename = path_1.default.basename(dirFile, ".dat") + realExt;
            counters.total++;
            const dirIdx = data.findIndex((dir) => dir.path === pathFile);
            const fileInfo = {
                path: path_1.default.join(pathFile, curr),
                name: realFilename,
                size: itemStat.size,
                ext: realExt,
            };
            if (dirIdx === -1) {
                data.push({
                    path: pathFile,
                    totalFile: 1,
                    files: [fileInfo],
                });
            }
            else {
                data[dirIdx].totalFile += 1;
                data[dirIdx].files.push(fileInfo);
            }
        }
        else if (isNested) {
            const nestedData = await getFileList({
                pathFile: path_1.default.join(pathFile, curr),
                pageNumber,
                pageSize,
                isNested,
                counters,
            });
            data.push(...nestedData);
        }
    }
    return data;
};
const fileListMiddleware = async (req, res) => {
    const { path: pathFile = "", pageNumber = 0, pageSize = 0, isNested = false, } = req.body ?? {};
    const data = await getFileList({
        pathFile,
        pageNumber,
        pageSize,
        counters: { skip: 0, total: 0 },
        isNested,
    });
    try {
        res.json({
            message: "OK",
            pageNumber,
            pageSize,
            totalDir: data.length,
            totalFile: data.reduce((acc, curr) => acc + curr.totalFile, 0),
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
exports.default = fileListMiddleware;
