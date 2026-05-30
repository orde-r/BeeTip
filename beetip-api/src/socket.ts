import type { Server as HttpServer } from "node:http";
import { Server, type Namespace } from "socket.io";
import jwt from "jsonwebtoken";
import { saveMessage, validateUserInOrder } from "./services/chat.service.js";
import type { UserPayload } from "./middlewares/auth.middleware.js";
import type { OrderDTO } from "./dtos/order.dto.js";

const JWT_SECRET = process.env.JWT_SECRET!;
let chatNamespaceRef: Namespace | null = null;

export function emitOrderStatusChanged(order: OrderDTO) {
  chatNamespaceRef?.to(`room_order_${order.id}`).emit("order_status_changed", {
    order,
  });
}

export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust for production
    },
  });

  const chatNamespace = io.of("/chat");
  chatNamespaceRef = chatNamespace;

  // Authentication Middleware
  chatNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.slice(7);
    if (!token) {
      return next(new Error("Authentication error: Missing token"));
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
      socket.data.user = payload;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Observer Pattern (design_patterns.md #2)
  // The Socket.io room acts as the Subject.
  // The connected clients (Buyer and Kurir sockets) act as Observers.
  // When a 'send_message' event occurs, the server persists the message and
  // notifies all Observers in the room by broadcasting the 'receive_message' event.
  chatNamespace.on("connection", (socket) => {
    const user = socket.data.user as UserPayload;
    console.log(`User connected to chat: ${user.id}`);

    socket.on("join_room", async (payload: any) => {
      try {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        const { order_id } = data;
        await validateUserInOrder(order_id, user.id);
        const roomName = `room_order_${order_id}`;
        socket.join(roomName);
        console.log(`User ${user.id} joined room ${roomName}`);
        // Optionally acknowledge success
        socket.emit("room_joined", { order_id, room: roomName });
      } catch (error: any) {
        socket.emit("error", { message: error.message || "Failed to join room" });
      }
    });

    socket.on("send_message", async (payload: any) => {
      try {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        const { order_id, content } = data;
        const message = await saveMessage(order_id, user.id, content);
        
        const roomName = `room_order_${order_id}`;
        // Broadcast to everyone in the room, including sender
        chatNamespace.to(roomName).emit("receive_message", message);
      } catch (error: any) {
        socket.emit("error", { message: error.message || "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from chat: ${user.id}`);
    });
  });

  return io;
}
