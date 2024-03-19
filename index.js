const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connectDB = mongoose.connection;

// RoomType Schema
const roomTypeSchema = new mongoose.Schema({
    name: String
});

const RoomType = mongoose.model('RoomType', roomTypeSchema);

// Room Schema
const roomSchema = new mongoose.Schema({
    name: String,
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' },
    price: Number
});

const Room = mongoose.model('Room', roomSchema);

// POST endpoint for storing room type
app.post('/api/v1/rooms-types', async (req, res) => {
    try {
        const { name } = req.body;
        const roomType = new RoomType({ name });
        await roomType.save();
        res.status(201).json(roomType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET endpoint for fetching all room types
app.get('/api/v1/rooms-types', async (req, res) => {
    try {
        const roomTypes = await RoomType.find();
        res.json(roomTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST endpoint for storing rooms
app.post('/api/v1/rooms', async (req, res) => {
    try {
        const { name, roomType, price } = req.body;
        const room = new Room({ name, roomType, price });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET endpoint for fetching rooms
app.get('/api/v1/rooms', async (req, res) => {
    try {
        const { search, roomType, minPrice, maxPrice } = req.query;
        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (roomType) {
            filter.roomType = roomType;
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
            filter.price = { $gte: minPrice, $lte: maxPrice };
        } else if (maxPrice !== undefined) {
            filter.price = { $lte: maxPrice };
        }

        const rooms = await Room.find(filter);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH endpoint for editing a room by id
app.patch('/api/v1/rooms/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { name, roomType, price } = req.body;

        const updatedRoom = await Room.findByIdAndUpdate(roomId, { name, roomType, price }, { new: true });

        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE endpoint for deleting a room by id
app.delete('/api/v1/rooms/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const deletedRoom = await Room.findByIdAndDelete(roomId);

        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET endpoint for fetching a room by id
app.get('/api/v1/rooms/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});