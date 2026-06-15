import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issues/issue.route";
import logger from "./middleware/logger";

const app: Application = express()

app.use(express.json());
app.use(logger);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    "message": "DevPulse server",
    "author": "Fakhrul Hasan"
  })
});

app.use("/api/auth", userRoute);
app.use("/api/issues", issueRoute)

export default app;