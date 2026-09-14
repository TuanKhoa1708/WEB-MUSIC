export default function setupSocket(io) {
    io.on("connection", (socket) => {
        console.log("🟢 A user connected:", socket.id);

        // 1. Tham gia phòng nghe chung
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId}`);

            // Báo cho những người đang ở trong phòng biết có người mới vào
            socket.to(roomId).emit("user_joined", { socketId: socket.id });
        });

        // 2. Đồng bộ: Bấm Play
        socket.on("play_song", (data) => {
            // data gồm: { roomId, currentTime }
            socket.to(data.roomId).emit("receive_play", data);
        });

        // 3. Đồng bộ: Bấm Pause
        socket.on("pause_song", (data) => {
            // data gồm: { roomId, currentTime }
            socket.to(data.roomId).emit("receive_pause", data);
        });

        // 4. Đồng bộ: Tua nhạc (Seek)
        socket.on("seek_song", (data) => {
            // data gồm: { roomId, currentTime }
            socket.to(data.roomId).emit("receive_seek", data);
        });

        // 5. Đồng bộ: Chuyển bài hát khác
        socket.on("change_song", (data) => {
            // data gồm: { roomId, songId }
            socket.to(data.roomId).emit("receive_change_song", data);
        });

        // 6. Rời phòng / Ngắt kết nối
        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });
}