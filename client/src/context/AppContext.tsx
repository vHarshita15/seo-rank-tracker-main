import type { AxiosInstance } from "axios";
import axios from "axios";
import { createContext, useContext, type ReactNode } from "react";

interface AppContextType {
    api: AxiosInstance;
}
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AppContext = createContext<AppContextType | undefined>(undefined);

export default function AppProvider({ children }: { children: ReactNode }) {

    const api = axios.create({
        baseURL: BACKEND_URL,
    });

    const value = { api };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}