const Message = require('../models/Message');
const Booking = require('../models/Booking');

// @desc    Get messages for a booking
// @route   GET /api/chat/:bookingId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('guideId', 'userId'); // Populate guideId to access its userId

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Security Check: User must be part of the booking
        const isParticipant =
            booking.userId.toString() === req.user.id ||
            (booking.guideId && booking.guideId.userId.toString() === req.user.id);

        if (!isParticipant && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ bookingId: req.params.bookingId })
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat/:bookingId
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const booking = await Booking.findById(req.params.bookingId)
            .populate('guideId', 'userId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Security Check
        const isParticipant =
            booking.userId.toString() === req.user.id ||
            (booking.guideId && booking.guideId.userId.toString() === req.user.id);

        if (!isParticipant && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to send messages to this booking' });
        }

        const newMessage = await Message.create({
            bookingId: req.params.bookingId,
            senderId: req.user.id,
            content,
            timestamp: new Date()
        });

        // Socket.io: Emit to room
        const io = req.app.get('socketio');
        if (io) {
            io.to(`chat_${req.params.bookingId}`).emit('new_message', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
