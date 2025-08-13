import { useSelector } from "react-redux";
import type { RootState } from '../store';

export const useAuth = () => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    return { isAuth: Boolean(token), token, user };
};
