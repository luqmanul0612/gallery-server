import path from "path";
import { promisify } from "util";
import fs from "fs";
import { Request, Response } from "express";
import { FileListType } from "../types";
import { fromFile } from "file-type";

const readdir = promisify(fs.readdir);

const getFileList = async ({
  pathFile,
  isNested,
  baseDir,
}: {
  pathFile: string;
  isNested: boolean;
  baseDir: string;
}) => {
  const sourcePath = path.join(baseDir, pathFile);

  let items: string[] = await readdir(sourcePath);

  const data: FileListType[] = [];

  for (const curr of items) {
    const dirFile = path.join(sourcePath, curr);
    const itemStat = fs.statSync(dirFile);

    if (!itemStat.isDirectory()) {
      const type = await fromFile(dirFile);
      const realExt = type?.ext ? `.${type.ext}` : ".dat";
      const realFilename = path.basename(dirFile, ".dat") + realExt;

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
    } else if (itemStat.isDirectory() && isNested) {
      const nestedData = await getFileList({
        pathFile: path.join(pathFile, curr),
        isNested,
        baseDir,
      });
      data.push(...nestedData);
    }
  }
  for (const dir of data) {
    dir.files.sort((a, b) => a.name.localeCompare(b.name));
  }
  return data;
};

const fileListMiddleware = async (req: Request, res: Response) => {
  const {
    path: pathFile = "",
    pageNumber = 0,
    pageSize = 0,
    isNested = false,
    baseDir = "",
  } = req.body ?? {};

  const fileList = await getFileList({
    pathFile,
    isNested,
    baseDir,
  });

  let resultData = [];
  const isPagination = pageNumber > 0 && pageSize > 0;
  const counters = { skip: 0, total: 0 };

  if (isPagination) {
    const targetSkipFile = (pageNumber - 1) * pageSize;
    for (const dir of fileList) {
      for (const file of dir.files) {
        if (counters.total >= pageSize) break;
        if (counters.skip >= targetSkipFile) {
          const dirIdx = resultData.findIndex((d) => d.path === dir.path);
          if (dirIdx !== -1) {
            resultData[dirIdx].totalFile += 1;
            resultData[dirIdx].files.push(file);
          } else {
            resultData.push({
              path: dir.path,
              totalFile: 1,
              files: [file],
            });
          }
          counters.total += 1;
        } else {
          counters.skip += 1;
        }
      }
    }
  }

  try {
    res.json({
      message: "OK",
      totalDir: resultData.length,
      totalFile: resultData.reduce((acc, curr) => acc + curr.totalFile, 0),
      pagination: {
        pageNumber,
        pageSize,
        totalData: fileList.reduce((acc, curr) => acc + curr.totalFile, 0),
      },
      data: resultData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default fileListMiddleware;
