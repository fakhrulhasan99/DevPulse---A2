import config from "../../config";
import { pool } from "../../database";
import type { IUser, IUserLogin } from "./auth.interface";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

const userSignupInDB = async (payload: IUser) => {

    const { name, email, password, role } = payload;
    if (
        role &&
        role !== "contributor" &&
        role !== "maintainer"
    ) {
        throw new Error(
            "Role must be contributor or maintainer"
        );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
        INSERT INTO users(name, email, password, role) 
        VALUES($1,$2,$3,COALESCE($4,'contributor')) 
        RETURNING *`,
        [name, email, hashPassword, role]);
    // console.log(result)
    delete result.rows[0].password;
    return result.rows[0];
    // const user = result.rows[0];
    // const { password : string, ...safeUser } = user;
    // return safeUser;
};

const getAllUserFromDB = async () => {
    const result = await pool.query(`
      SELECT * FROM users`);
    return result;
};

const loginUserInDB = async (payload: IUserLogin) => {

    const { email, password } = payload;
    const userData = await pool.query(`
        SELECT * FROM users 
        WHERE email=$1`,
        [email]);

    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials!!")
    }
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);
    // console.log(matchPassword)
    if (!matchPassword) {
        throw new Error("Invalid Credentials!!")
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const accessToken = jwt.sign(jwtPayload, config.secret as string, { expiresIn: "1d" });

    return { accessToken };
}

export const authService = {
    userSignupInDB,
    getAllUserFromDB,
    loginUserInDB
}