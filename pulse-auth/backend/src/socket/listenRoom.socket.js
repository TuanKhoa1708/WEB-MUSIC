/**
 * Listen Room Socket Handler
 * 
 * In-memory room store. Each room:
 * {
 *   code: string,
 *   hostSocketId: string,
 *   hostUserId: string,
 *   hostUsername: string,
 *   members: [{ socketId, userId, username, avatarUrl }],
 *   state: { song, queue, currentTime, isPlaying }
 * }
 */

const rooms = new Map(); // roomCode → room object

// Generate a short 6-char uppercase code
function generateCode() {
    return Math.random().toString(36).toUpperCase().slice(2, 8);
}

export function initListenRoomSocket(io) {
    io.on("connection", (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // ── HOST: Create a room ──────────────────────────────────────────────────
        socket.on("room:create", ({ userId, username, avatarUrl, state }) => {
            // If user already has a room, close it first
            for (const [code, room] of rooms.entries()) {
                if (room.hostSocketId === socket.id) {
                    io.to(code).emit("room:closed", { reason: "Host recreated the room" });
                    rooms.delete(code);
                    break;
                }
            }

            let code;
            do { code = generateCode(); } while (rooms.has(code));

            const room = {
                code,
                hostSocketId: socket.id,
                hostUserId: userId,
                hostUsername: username,
                hostAvatarUrl: avatarUrl,
                members: [{ socketId: socket.id, userId, username, avatarUrl, isHost: true }],
                state: state || { song: null, queue: [], currentTime: 0, isPlaying: false },
            };

            rooms.set(code, room);
            socket.join(code);
            socket.emit("room:created", { code });
            console.log(`[Room] Created room ${code} by ${username}`);
        });

        // ── GUEST: Join a room ───────────────────────────────────────────────────
        socket.on("room:join", ({ code, userId, username, avatarUrl }) => {
            const room = rooms.get(code?.toUpperCase());

            if (!room) {
                socket.emit("room:error", { message: "Room not found or has ended." });
                return;
            }

            // Remove if already in room (reconnect case)
            room.members = room.members.filter(m => m.socketId !== socket.id);
            room.members.push({ socketId: socket.id, userId, username, avatarUrl, isHost: false });

            socket.join(code.toUpperCase());

            // Send current state to the joining guest
            socket.emit("room:state", {
                code: room.code,
                hostUsername: room.hostUsername,
                members: room.members.map(m => ({ userId: m.userId, username: m.username, avatarUrl: m.avatarUrl, isHost: m.isHost })),
                state: room.state,
            });

            // Notify everyone else
            io.to(code.toUpperCase()).emit("room:member-update", {
                members: room.members.map(m => ({ userId: m.userId, username: m.username, avatarUrl: m.avatarUrl, isHost: m.isHost })),
                joined: { username },
            });

            console.log(`[Room] ${username} joined room ${code}`);
        });

        // ── HOST: Broadcast sync event (play/pause/seek/song change) ────────────
        socket.on("room:host-sync", ({ code, state }) => {
            const room = rooms.get(code);
            if (!room) return;

            if (room.hostSocketId !== socket.id) {
                socket.emit("room:error", { message: "Only the host can sync." });
                return;
            }

            // Update stored state
            room.state = { ...room.state, ...state };

            // Broadcast to everyone except host
            socket.to(code).emit("room:sync", { state: room.state });
        });

        // ── HOST: Request current time from host (for late joiners) ─────────────
        socket.on("room:request-state", ({ code }) => {
            const room = rooms.get(code);
            if (!room) return;
            // Ask host to send current state
            io.to(room.hostSocketId).emit("room:push-state", { requesterSocketId: socket.id });
        });

        // ── HOST: Respond to state push request ──────────────────────────────────
        socket.on("room:push-state-response", ({ code, state, requesterSocketId }) => {
            const room = rooms.get(code);
            if (!room || room.hostSocketId !== socket.id) return;
            room.state = { ...room.state, ...state };
            io.to(requesterSocketId).emit("room:sync", { state: room.state });
        });

        // ── Leave room ───────────────────────────────────────────────────────────
        socket.on("room:leave", ({ code }) => {
            handleLeave(socket, code, io);
        });

        // ── Disconnect ───────────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
            // Find which room(s) this socket was in
            for (const [code, room] of rooms.entries()) {
                if (room.hostSocketId === socket.id) {
                    // Host disconnected → close the room
                    io.to(code).emit("room:closed", { reason: "Host left the session" });
                    rooms.delete(code);
                    console.log(`[Room] Closed room ${code} (host disconnected)`);
                } else {
                    const memberIdx = room.members.findIndex(m => m.socketId === socket.id);
                    if (memberIdx >= 0) {
                        const [member] = room.members.splice(memberIdx, 1);
                        io.to(code).emit("room:member-update", {
                            members: room.members.map(m => ({ userId: m.userId, username: m.username, avatarUrl: m.avatarUrl, isHost: m.isHost })),
                            left: { username: member.username },
                        });
                    }
                }
            }
        });
    });
}

function handleLeave(socket, code, io) {
    const room = rooms.get(code);
    if (!room) return;

    if (room.hostSocketId === socket.id) {
        // Host leaves → close room
        io.to(code).emit("room:closed", { reason: "Host ended the session" });
        rooms.delete(code);
        console.log(`[Room] Closed room ${code} (host left)`);
    } else {
        // Guest leaves
        const memberIdx = room.members.findIndex(m => m.socketId === socket.id);
        if (memberIdx >= 0) {
            const [member] = room.members.splice(memberIdx, 1);
            socket.leave(code);
            io.to(code).emit("room:member-update", {
                members: room.members.map(m => ({ userId: m.userId, username: m.username, avatarUrl: m.avatarUrl, isHost: m.isHost })),
                left: { username: member.username },
            });
            console.log(`[Room] ${member.username} left room ${code}`);
        }
    }
}
