import Card from "../models/card.model.js";
import User from "../models/user.model.js";

export const issueCard = async (req, res) => {
  const { cardholderId, spendLimit } = req.body;
  try {
    const cardholder = await User.findById(cardholderId);
    if (
      !cardholder ||
      cardholder.companyId.toString() !== req.user.companyId.toString()
    ) {
      return res
        .status(404)
        .json({ message: "Cardholder not found or not in your company." });
    }

    const newCard = new Card({
      cardholderId,
      spendLimit,
      cardNumber: `virt_${Math.floor(
        1000000000000 + Math.random() * 9000000000000
      )}`,
      cvv: `${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: "12/28",
    });
    await newCard.save();
    res.status(201).json(newCard);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error issuing card.", error: error.message });
  }
};

export const getCompanyCards = async (req, res) => {
  try {
    const usersInCompany = await User.find({
      companyId: req.user.companyId,
    }).select("_id");
    const userIds = usersInCompany.map((user) => user._id);
    const cards = await Card.find({ cardholderId: { $in: userIds } }).populate(
      "cardholderId",
      "name email"
    );
    res.json(cards);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching cards.", error: error.message });
  }
};

export const getMyCards = async (req, res) => {
  try {
    const cards = await Card.find({ cardholderId: req.user._id });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getCardDetails = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).populate(
      "cardholderId",
      "name email"
    );
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }
    const cardholder = await User.findById(card.cardholderId);
    if (cardholder.companyId.toString() !== req.user.companyId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden. Card does not belong to your company." });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateCard = async (req, res) => {
  const { spendLimit, status } = req.body;
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const cardholder = await User.findById(card.cardholderId);
    if (cardholder.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: "Forbidden action." });
    }

    card.spendLimit = spendLimit ?? card.spendLimit;
    card.status = status ?? card.status;

    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error updating card.", error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const cardholder = await User.findById(card.cardholderId);
    if (cardholder.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: "Forbidden action." });
    }

    await card.deleteOne();
    res.json({ message: "Card deactivated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
