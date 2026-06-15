import { pool } from "../../database";
import type { ICreateIssue, IGetIssuesQuery, IUpdateIssue } from "./issue.inferface";

const createIssueInDB = async (
    reporter_id: number,
    payload: ICreateIssue
) => {
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

const getAllIssuesFromDB = async (query: IGetIssuesQuery) => {
    const { sort = "newest", type, status } = query;

    let baseQuery = `SELECT * FROM issues`;
    const conditions: string[] = [];
    const values: (string | number)[] = [];

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

    baseQuery +=
        sort === "oldest"
            ? ` ORDER BY created_at ASC`
            : ` ORDER BY created_at DESC`;

    const issuesResult = await pool.query(baseQuery, values);
    const issues = issuesResult.rows;

    const reporterIds = [...new Set(issues.map(i => i.reporter_id))];

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
        usersResult.rows.map(user => [user.id, user])
    );
    const finalData = issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: userMap.get(issue.reporter_id),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    }));

    return finalData;
};

const getSingleIssueFromDB = async (id: number) => {
    
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

const updateIssueInDB = async (
    issueId: number,
    user: { id: number; role: string },
    payload: IUpdateIssue
) => {
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

    const fields: string[] = [];
    const values: (string | number)[] = [];
    
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

const deleteIssueFromDB = async (
    issueId: number,
    user: { id: number; role: string }
) => {
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

export const issueService = {
    createIssueInDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueInDB,
    deleteIssueFromDB
};