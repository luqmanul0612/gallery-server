import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { fromFile } from "file-type";

const DEFAULT_BASE_DIR =
  process.env.NODE_ENV === "production"
    ? path.resolve(process.cwd(), "..", "data")
    : "/mnt/c/Users/hkm/Documents/DragonNest/bin/data";

const fileMiddleware = async (req: Request, res: Response) => {
  const pathFile = req.query.path as string;
  const dirFile = path.join(DEFAULT_BASE_DIR, pathFile);
  try {
    const type = await fromFile(dirFile);
    const mimeType = type?.mime || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=604800");
    const fileStream = fs.createReadStream(dirFile);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default fileMiddleware;
