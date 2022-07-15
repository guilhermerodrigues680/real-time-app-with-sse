// function sayMyName(name: string): void {
//   if (name === "Heisenberg") {
//     console.log("You're right 👍");
//   } else {
//     console.log("You're wrong 👎");
//   }
// }

// sayMyName("Heisenberg");

import express from "express";
import { Router, Request, Response } from "express";

const port = 3333;
const app = express();
const route = Router();

app.use(express.json());

route.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello world with Typescript" });
});

app.use(route);

app.listen(port, () => {
  console.info(
    `server 'NODE_ENV=${process.env.NODE_ENV}' listening on port http://localhost:${port}`
  );
});
