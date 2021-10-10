import { getUser } from "../firebase";

export const user = getUser(); // the logged in user (null if not logged)
