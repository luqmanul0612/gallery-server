"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./src/routes"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
exports.corsOptions = { origin: "*" };
const main = async () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: 1.2 * 1024 * 1024 }));
    app.use((0, cors_1.default)(exports.corsOptions));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use("/api", routes_1.default);
    app.use(express_1.default.static(path_1.default.resolve(process.cwd(), "../client/dist")));
    app.get(/(.*)/, (_, res) => {
        res.sendFile(path_1.default.join(path_1.default.resolve(process.cwd(), "../client/dist"), "index.html"));
    });
    const PORT = process.env.PORT || 3210;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};
main().catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
});
