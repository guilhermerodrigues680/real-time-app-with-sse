import express, { Request, Response } from "express";
import cors from "cors";
import api from "./api";

const port = 5170;
const app = express();

app.use(cors());
app.use(express.json());
app.use(api);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world with Typescript");
});

app.listen(port, () => {
  console.info(
    `server 'NODE_ENV=${process.env.NODE_ENV}' listening on port http://localhost:${port}`
  );
});
