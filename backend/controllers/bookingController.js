const { populate } = require("../models/Asset");
const booking = require("../models/Bookings");

exports.getBookings = async (req, res) => {
  try {
    const bookings = await booking.find(
      { owner: req.user.id },
      populate("renter asset")
    );
    res.json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBookings = async (req, res) => {
  try {
    const booking = await booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
