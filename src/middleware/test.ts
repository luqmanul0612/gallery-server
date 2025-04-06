import path from "path";
import { promisify } from "util";
import fs from "fs";
import { Request, Response } from "express";
import { memoryData } from "../data";
import { FileItemType, FileListType } from "../types";
import { fromFile } from "file-type";

const MAIN_DIR =
  process.env.NODE_ENV === "production"
    ? path.resolve(process.cwd(), "..", "data")
    : "/mnt/c/Users/hkm/Documents/DragonNest/bin/data";
const readdir = promisify(fs.readdir);

const getFileList = async ({
  pathFile,
  pageNumber,
  pageSize,
  isNested,
  counters = { skip: 0, total: 0 },
}: {
  pathFile: string;
  pageNumber: number;
  pageSize: number;
  isNested: boolean;
  counters?: { skip: number; total: number };
}) => {
  const sourcePath = path.join(MAIN_DIR, pathFile);
  const isPagination = pageNumber > 0 && pageSize > 0;
  const targetSkipFile = isPagination ? (pageNumber - 1) * pageSize : 0;

  let items: string[] = memoryData[pathFile]
    ? memoryData[pathFile]
    : (memoryData[pathFile] = await readdir(sourcePath));

  const data: FileListType[] = [];

  for (const curr of items) {
    if (isPagination && counters.total >= pageSize) break;

    const dirFile = path.join(sourcePath, curr);
    const itemStat = fs.statSync(dirFile);

    if (!itemStat.isDirectory()) {
      if (targetSkipFile > counters.skip) {
        counters.skip++;
        continue;
      }

      const type = await fromFile(dirFile);
      const realExt = type?.ext ? `.${type.ext}` : ".dat";
      const realFilename = path.basename(dirFile, ".dat") + realExt;

      counters.total++;

      const dirIdx = data.findIndex((dir) => dir.path === pathFile);
      const fileInfo = {
        path: path.join(pathFile, curr),
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
      } else {
        data[dirIdx].totalFile += 1;
        data[dirIdx].files.push(fileInfo);
      }
    } else if (isNested) {
      const nestedData = await getFileList({
        pathFile: path.join(pathFile, curr),
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

const fileListMiddleware = async (req: Request, res: Response) => {
  const {
    path: pathFile = "",
    pageNumber = 0,
    pageSize = 0,
    isNested = false,
  } = req.body ?? {};

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
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default fileListMiddleware;
