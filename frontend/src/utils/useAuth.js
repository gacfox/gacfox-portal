import { useContext } from "react";
import { AuthContext } from "@/utils/AuthContext";

export function useAuth() {
  return useContext(AuthContext);
}
