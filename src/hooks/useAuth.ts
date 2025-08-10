import { useSelector } from "react-redux";
import type { RootState } from '../store';

export const useAuth = () => {
    const { token, username } = useSelector((state: RootState) => state.auth);
    return { isAuth: Boolean(token), token, username };
};
