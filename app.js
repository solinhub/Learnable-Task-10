// Dpendencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {});
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

// Define RoomType model
const RoomType = mongoose.model('RoomType', new mongoose.Schema({
    name: String,
}));

// Define Room model
const Room = mongoose.model('Room', new mongoose.Schema({
    name: String,
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType',
    },
    price: Number,
}));

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// RoomType controller functions
const createRoomType = async (req, res) => {
    try {
        const { name } = req.body;
        const roomType = new RoomType({ name });
        await roomType.save();
        res.status(201).json(roomType);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.find();
        res.json(roomTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Room controller functions
const createRoom = async (req, res) => {
    try {
        const { name, roomType, price } = req.body;
        const room = new Room({ name, roomType, price });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const { search, roomType, minPrice, maxPrice } = req.query;
        let query = {};
        if (search) query.name = new RegExp(search, 'i');
        if (roomType) query.roomType = roomType;
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (maxPrice !== undefined) {
            query.price = { $lte: maxPrice };
        }
        const rooms = await Room.find(query);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Routes
app.post('/api/v1/room-types', createRoomType);
app.get('/api/v1/room-types', getAllRoomTypes);
app.post('/api/v1/rooms', createRoom);
app.get('/api/v1/rooms', getAllRooms);
app.get('/api/v1/rooms/:id', getRoomById);
app.patch('/api/v1/rooms/:id', updateRoom);
app.delete('/api/v1/rooms/:id', deleteRoom);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
