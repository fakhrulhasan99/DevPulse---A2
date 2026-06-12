import { pool } from "../../database";
import type { IUser } from "./auth.interface";

const createUserInDB = async (payload: IUser) => {

    const { name, email, password, role } = payload;

    const result = await pool.query(`
    INSERT INTO users(name, email, password, role) 
    VALUES($1,$2,$3,$4) 
    RETURNING *`,
        [name, email, password, role]);
    // we should not return password
    // we should not return password
    // we should not return password
    // we should not return password
    // we should not return password
    // console.log(result)
    return result;

    // const user = result.rows[0];
    // const { password : string, ...safeUser } = user;
    // return safeUser;
};

const getAllUserFromDB = async () => {
    const result = await pool.query(`
      SELECT * FROM users`);
    return result;
}

export const authService = {
    createUserInDB,
    getAllUserFromDB,
}