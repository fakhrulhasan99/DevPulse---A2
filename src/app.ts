import express, { type Application, type Request, type Response } from "express"
import { pool } from "./database";
import { userRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issues/issue.route";
import fs from "fs"
import logger from "./middleware/logger";

const app: Application = express()

app.use(express.json());
app.use(logger);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    "message": "express server",
    "author": "fakhrul"
  })
});

app.use("/api/auth", userRoute);
app.use("/api/issues", issueRoute)

// these will be done later if there is time

// app.get("/api/auth/signup/:id", async (req: Request, res: Response) => {
//   const id = req.params.id;
//   try {
//     const result = await pool.query(`
//       SELECT * FROM users WHERE id=$1`, [id]);

//     if (result.rows.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: "User not found",
//         data: {}
//       })
//     }

//     res.status(200).json({
//       success: true,
//       message: "User retrived successfully",
//       data: result.rows[0]
//     })
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//       error: error
//     })
//   }
// });

// app.put("/api/auth/signup/:id", async (req: Request, res: Response) => {
//   const id = req.params.id;
//   const { name, password, role } = req.body;
//   try {
//     const result = await pool.query(`
//       UPDATE users SET name=COALESCE($1,name), password=COALESCE($2,password), role=COALESCE($3,role) WHERE id=$4 RETURNING *`, [name, password, role, id]);

//     if (result.rows.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: "User not found",
//         data: {}
//       })
//     }

//     res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//       data: result.rows[0]
//     })
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//       error: error
//     })
//   }
// });

// app.delete("/api/auth/signup/:id", async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(`
//       DELETE FROM users WHERE id=$1`, [id]);

//     if (result.rowCount === 0) {
//       res.status(404).json({
//         success: false,
//         message: "User not found",
//         data: {}
//       })
//     }

//     res.status(200).json({
//       success: true,
//       message: "User deleted successfully",
//       data: {}
//     })
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//       error: error
//     })
//   }
// });

export default app;