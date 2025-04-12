"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dirListMiddleware_1 = __importDefault(require("../middleware/dirListMiddleware"));
const fileMiddleware_1 = __importDefault(require("../middleware/fileMiddleware"));
const fileListMiddleware_1 = __importDefault(require("../middleware/fileListMiddleware"));
const routes = express_1.default.Router();
routes.post("/dir/list", dirListMiddleware_1.default);
routes.post("/file/list", fileListMiddleware_1.default);
routes.get("/file", fileMiddleware_1.default);
exports.default = routes;
