import { Priority } from "@/interfaces/Board"
import { ReactNode } from "react";
import { FaFlag } from "react-icons/fa"

export const PRIORITY_FLAG: Record<Priority, ReactNode> = {
    LOW: <></>,
    MEDIUM: <FaFlag className="text-xl text-blue-600" />,
    HIGH: <FaFlag className="text-xl text-red-600" />,
};