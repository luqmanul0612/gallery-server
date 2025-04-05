import path from "path";
import { promisify } from "util";
import fs from "fs";
import { Request, Response } from "express";
import { memoryData } from "../data";
import { DirItemType } from "../types";

const MAIN_DIR =
  process.env.NODE_ENV === "production"
    ? path.resolve(process.cwd(), "..", "data")
    : "/mnt/c/Users/hkm/Documents/DragonNest/bin/data";
const readdir = promisify(fs.readdir);

const dirListMiddleware = async (req: Request, res: Response) => {
  const { path: pathname = "" } = req.body ?? {};
  const sourcePath = path.join(MAIN_DIR, pathname);
  try {
    let items: string[] = [];
    if (memoryData[pathname]) items = memoryData[pathname];
    else {
      items = await readdir(sourcePath);
      memoryData[pathname] = items;
    }
    const data = items.reduce((acc, curr) => {
      const itemPath = path.join(sourcePath, curr);
      const itemStat = fs.statSync(itemPath);
      if (itemStat.isDirectory())
        return [
          ...acc,
          {
            path: path.join(pathname, curr),
            name: curr,
            totalItems: itemStat.isDirectory()
              ? fs.readdirSync(itemPath).length
              : 0,
          },
        ];
      else return acc;
    }, [] as DirItemType[]);
    res.json({
      message: "OK",
      data,
    });
  } catch (error) {
    delete memoryData[pathname];
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default dirListMiddleware;
