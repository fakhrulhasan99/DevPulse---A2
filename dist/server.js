
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/database/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      );`);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS issues(
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    );`);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var userSignupInDB = async (payload) => {
  const { name, email, password, role } = payload;
  if (role && role !== "contributor" && role !== "maintainer") {
    throw new Error(
      "Role must be contributor or maintainer"
    );
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) 
        VALUES($1,$2,$3,COALESCE($4,'contributor')) 
        RETURNING *`,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var getAllUserFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM users`);
  return result;
};
var loginUserInDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users 
        WHERE email=$1`,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return { accessToken };
};
var authService = {
  userSignupInDB,
  getAllUserFromDB,
  loginUserInDB
};

// src/utils/sendResponse.ts
var sendResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};
var sendError = (res, statusCode, message, errors) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// src/modules/auth/auth.controller.ts
var userSignup = async (req, res) => {
  try {
    const result = await authService.userSignupInDB(req.body);
    sendResponse(res, 201, "User created successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var getAllUser = async (req, res) => {
  try {
    const result = await authService.getAllUserFromDB();
    sendResponse(res, 200, "Users retrieved successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var userLogin = async (req, res) => {
  try {
    const result = await authService.loginUserInDB(req.body);
    sendResponse(res, 200, "User loggedin successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var authController = {
  userSignup,
  getAllUser,
  userLogin
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      const userData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1`,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!!"
        });
      }
      ;
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden request. Access denied!!"
        });
      }
      ;
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.userSignup);
router.get("/signup", auth_default(USER_ROLE.maintainer), authController.getAllUser);
router.post("/login", authController.userLogin);
var userRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssueInDB = async (reporter_id, payload) => {
  const { title, description, type } = payload;
  const user = await pool.query(
    `SELECT id FROM users WHERE id=$1`,
    [reporter_id]
  );
  if (user.rows.length === 0) {
    throw new Error("User does not exist");
  }
  const result = await pool.query(
    `
        INSERT INTO issues
        (reporter_id, title, description, type)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
    [reporter_id, title, description, type]
  );
  return result.rows[0];
};
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let baseQuery = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    baseQuery += ` WHERE ` + conditions.join(" AND ");
  }
  baseQuery += sort === "oldest" ? ` ORDER BY created_at ASC` : ` ORDER BY created_at DESC`;
  const issuesResult = await pool.query(baseQuery, values);
  const issues = issuesResult.rows;
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  if (reporterIds.length === 0) {
    return [];
  }
  const usersResult = await pool.query(
    `
        SELECT id, name, role
        FROM users
        WHERE id = ANY($1)
        `,
    [reporterIds]
  );
  const userMap = new Map(
    usersResult.rows.map((user) => [user.id, user])
  );
  const finalData = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return finalData;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `
        SELECT id, name, role FROM users WHERE id=$1
        `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0] || null;
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    reporter
  };
};
var updateIssueInDB = async (issueId, user, payload) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;
  if (!isMaintainer) {
    if (!isOwner) {
      throw new Error("You are not allowed to update this issue");
    }
    if (issue.status !== "open") {
      throw new Error("You can only update open issues");
    }
  }
  const fields = [];
  const values = [];
  if (payload.title) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }
  if (payload.description) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }
  if (payload.type) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }
  fields.push(`updated_at = NOW()`);
  if (fields.length === 0) {
    return issue;
  }
  values.push(issueId);
  const query = `
        UPDATE issues
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING *
    `;
  const updatedResult = await pool.query(query, values);
  return updatedResult.rows[0];
};
var deleteIssueFromDB = async (issueId, user) => {
  if (user.role !== "maintainer") {
    throw new Error("Only maintainer can delete issues");
  }
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [issueId]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  await pool.query(
    `DELETE FROM issues WHERE id=$1`,
    [issueId]
  );
  return true;
};
var issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await issueService.createIssueInDB(userId, req.body);
    sendResponse(res, 201, "Issue created successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse(res, 200, "Issues retrived successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 500, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var getSingleIssue = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    sendResponse(res, 200, "Issue retrieved successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var updateIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const result = await issueService.updateIssueInDB(
      issueId,
      req.user,
      req.body
    );
    sendResponse(res, 200, "Issue updated successfully", result);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var deleteIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    await issueService.deleteIssueFromDB(issueId, req.user);
    sendResponse(res, 200, "Issue deleted successfully", null);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssue);
router2.delete(
  "/:id",
  auth_default(USER_ROLE.maintainer),
  issueController.deleteIssue
);
var issueRoute = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method} -- Time -> ${Date.now()} -- URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
var app = express();
app.use(express.json());
app.use(logger_default);
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "DevPulse server",
    "author": "Fakhrul Hasan"
  });
});
app.use("/api/auth", userRoute);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map