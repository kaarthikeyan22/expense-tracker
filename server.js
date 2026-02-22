const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const FILE_NAME = "expenses.xlsx";

// Create Excel file if not exists with headers
if (!fs.existsSync(FILE_NAME)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, FILE_NAME);
}

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Add expense route
app.post("/add", (req, res) => {
    const { person, category, amount, date, description } = req.body;

    if (!person || !amount || !date) {
        return res.status(400).send("Missing required fields");
    }

    const wb = XLSX.readFile(FILE_NAME);
    const ws = wb.Sheets["Expenses"];
    let data = XLSX.utils.sheet_to_json(ws);

    // Remove old TOTAL row if exists
    data = data.filter(row => row.Person !== "TOTAL");

    // Add new row with separate Expense & Savings columns
    const expenseRow = {
        Person: person,
        Category: category,
        Expense: category === "Savings" ? 0 : Number(amount),
        Savings: category === "Savings" ? Number(amount) : 0,
        Date: date,
        Description: description
    };
    data.push(expenseRow);

    // Calculate total expense & total savings
    const totalExpense = data.reduce((sum, row) => sum + (row.Expense || 0), 0);
    const totalSavings = data.reduce((sum, row) => sum + (row.Savings || 0), 0);

    // Add TOTAL row at bottom
    data.push({
        Person: "TOTAL",
        Category: "",
        Expense: totalExpense,
        Savings: totalSavings,
        Date: "",
        Description: ""
    });

    const newWs = XLSX.utils.json_to_sheet(data);
    wb.Sheets["Expenses"] = newWs;
    XLSX.writeFile(wb, FILE_NAME);

    res.send("Expense Saved Successfully");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});