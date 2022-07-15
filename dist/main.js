"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("./api"));
const port = 5170;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(api_1.default);
app.get("/", (req, res) => {
    res.send("hello world with Typescript");
});
app.listen(port, () => {
    console.info(`server 'NODE_ENV=${process.env.NODE_ENV}' listening on port http://localhost:${port}`);
});
