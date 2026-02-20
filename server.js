const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const XLSX = require("xlsx");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FILE_NAME = "expenses.xlsx";

if (!fs.existsSync(FILE_NAME)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, FILE_NAME);
}

app.post("/add", (req, res) => {
    const { title, amount } = req.body;

    const wb = XLSX.readFile(FILE_NAME);
    const ws = wb.Sheets["Expenses"];
    let data = XLSX.utils.sheet_to_json(ws);

    data.push({
        Title: title,
        Amount: amount,
        Date: new Date().toLocaleString()
    });

    const newWs = XLSX.utils.json_to_sheet(data);
    wb.Sheets["Expenses"] = newWs;
    XLSX.writeFile(wb, FILE_NAME);

    res.send("Expense Saved Successfully");
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});