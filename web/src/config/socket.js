import { io } from "socket.io-client";
import { SOCKET_URL } from "./constants";
export const socket = io.connect(SOCKET_URL);
