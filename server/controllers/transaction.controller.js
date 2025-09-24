import Transaction from "../models/transaction.model.js";
import Card from "../models/card.model.js";
import User from "../models/user.model.js";

export const getTransactions = async (req, res) => {
  try {
    const { userId, category, startDate, endDate } = req.query;

    const usersInCompany = await User.find({
      companyId: req.user.companyId,
    }).select("_id");
    const userIds = usersInCompany.map((user) => user._id);
    const cardsInCompany = await Card.find({
      cardholderId: { $in: userIds },
    }).select("_id");
    const cardIds = cardsInCompany.map((card) => card._id);

    let query = { cardId: { $in: cardIds } };

    if (userId) {
      const userCards = await Card.find({ cardholderId: userId }).select("_id");
      const userCardIds = userCards.map((card) => card._id);
      const finalCardIds = cardIds.filter((id) =>
        userCardIds.some((userCardId) => userCardId.equals(id))
      );
      query.cardId = { $in: finalCardIds };
    }

    if (category) query.category = category;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(query)
      .populate({
        path: "cardId",
        populate: {
          path: "cardholderId",
          select: "name email",
        },
      })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate({
      path: "cardId",
      populate: {
        path: "cardholderId",
        select: "name email companyId",
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (
      transaction.cardId.cardholderId.companyId.toString() !==
      req.user.companyId.toString()
    ) {
      return res.status(403).json({ message: "Forbidden." });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
