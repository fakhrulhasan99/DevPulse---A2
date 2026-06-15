import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post("/", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);

router.get("/", issueController.getAllIssues);

router.get("/:id", issueController.getSingleIssue);

router.patch("/:id", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssue);


// app.put("/:id", async (req: Request, res: Response) => {
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

export const issueRoute = router;