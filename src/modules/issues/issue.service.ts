import { pool } from "../../database";

const createIssueInDB = async (payload: any) => {
    // console.log(payload)
    const { reporter_id, title, description, type } = payload;
    // first check if the user exists
    const user = await pool.query(`
    SELECT * FROM users WHERE id=$1`,
        [reporter_id]);
    // console.log(user);
    if (user.rows.length === 0) {
        throw new Error("User not exists!!!")
    }

    const result = await pool.query(`
        INSERT INTO 
        issues(reporter_id, title, description, type)
        VALUES($1, $2, $3, $4) 
        RETURNING *`,
        [reporter_id, title, description, type]);

    return result;
};

export const issueService = {
    createIssueInDB,
}