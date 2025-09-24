import Expense from "../models/expense.model.js";
import Transaction from "../models/transaction.model.js";
import Card from "../models/card.model.js";

export const submitExpense = async (req, res) => {
  const { transactionId, notes } = req.body;
  try {
    const transaction = await Transaction.findById(transactionId).populate(
      "cardId"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (
      transaction.cardId.cardholderId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden. You do not own this transaction." });
    }

    const newExpense = new Expense({ transactionId, notes });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getCompanyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate({
        path: "transactionId",
        populate: {
          path: "cardId",
          populate: {
            path: "cardholderId",
            select: "name email companyId",
          },
        },
      })
      .exec();

    const companyExpenses = expenses.filter(
      (expense) =>
        expense.transactionId &&
        expense.transactionId.cardId &&
        expense.transactionId.cardId.cardholderId &&
        expense.transactionId.cardId.cardholderId.companyId.toString() ===
          req.user.companyId.toString()
    );

    res.json(companyExpenses);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getMyExpenses = async (req, res) => {
  try {
    const userCards = await Card.find({ cardholderId: req.user._id }).select(
      "_id"
    );
    const userCardIds = userCards.map((card) => card._id);
    const userTransactions = await Transaction.find({
      cardId: { $in: userCardIds },
    }).select("_id");
    const userTransactionIds = userTransactions.map((t) => t._id);

    const expenses = await Expense.find({
      transactionId: { $in: userTransactionIds },
    })
      .populate("transactionId")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate({
      path: "transactionId",
      populate: { path: "cardId" },
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    if (
      expense.transactionId.cardId.cardholderId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden." });
    }

    expense.notes = req.body.notes || expense.notes;
    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    expense.status = status;
    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const uploadReceipt = async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file." });
  }

  try {
    const receiptUrl =
      "https://res.cloudinary.com/demo/image/upload/receipt.jpg"; // Placeholder

    const expense = await Expense.findByIdAndUpdate(
      id,
      { receiptUrl },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
