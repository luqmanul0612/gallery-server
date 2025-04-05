import express from "express";
import dirListMiddleware from "../middleware/dirListMiddleware";
import fileMiddleware from "../middleware/fileMiddleware";
import fileListMiddleware from "../middleware/fileListMiddleware";

const routes = express.Router();

routes.post("/dir/list", dirListMiddleware);
routes.post("/file/list", fileListMiddleware);
routes.get("/file", fileMiddleware);

export default routes;
