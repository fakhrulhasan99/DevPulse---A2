import { pool } from "../../database";
import type { ICreateIssue } from "./issue.inferface";

type SortType = "newest" | "oldest";
type IssueType = "bug" | "feature_request";
type IssueStatus = "open" | "in_progress" | "resolved";

interface IGetIssuesQuery {
    sort?: SortType;
    type?: IssueType;
    status?: IssueStatus;
}

const createIssueInDB = async (
    reporter_id: number,
    payload: ICreateIssue
) => {
    const { title, description, type } = payload;

    // validate user exists
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

    return result;
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

export const issueService = {
    createIssueInDB,
    getAllIssuesFromDB
};