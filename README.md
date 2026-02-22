<!DOCTYPE html>
<html>
<head>
    <title>Expense Tracker</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #85C1E9, #5DADE2, #2874A6);
            margin: 0;
            padding: 0;
            text-align: center;
            transition: 0.4s;
        }

        body.dark {
            background: #1B2631;
            color: #AED6F1;
        }

        h2 {
            color: #154360;
            padding-top: 20px;
            text-shadow: 1px 1px 3px #1B4F72;
        }

        .container {
            background: rgba(52, 152, 219, 0.95);
            width: 85%;
            max-width: 1000px;
            margin: 30px auto;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.25);
            transition: 0.4s;
        }

        body.dark .container {
            background: #2E4053;
        }

        input, select {
            padding: 12px;
            margin: 8px;
            border-radius: 12px;
            border: 1px solid #1F618D;
            width: 180px;
            font-size: 14px;
        }

        body.dark input,
        body.dark select {
            background: #34495E;
            color: white;
            border: 1px solid #2980B9;
        }

        button {
            padding: 12px 25px;
            border: none;
            border-radius: 12px;
            background: #3498DB;
            color: #D6EAF8;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        button:hover {
            transform: scale(1.05);
            background: #2E86C1;
        }

        .top-controls {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }

        .inputs-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
        }

        .add-btn-row {
            margin-bottom: 20px;
        }

        .add-btn-row button {
            width: 90%;
        }

        table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
            border-radius: 12px;
            overflow: hidden;
        }

        th {
            background: linear-gradient(90deg, #5DADE2, #2E86C1);
            color: white;
            padding: 12px;
        }

        td {
            padding: 10px;
            text-align: center;
        }

        tr:nth-child(even) {
            background: #D6EAF8;
        }

        body.dark tr:nth-child(even) {
            background-color: #34495E;
        }

        tr:hover {
            transform: scale(1.01);
            transition: 0.2s;
        }
    </style>
</head>
<body>

<h2>💰 Family Expense Tracker</h2>

<div class="container">

    <div class="top-controls">
        <button onclick="toggleDarkMode()">🌙 Dark Mode</button>
    </div>

    <div class="inputs-row">
        <input type="text" id="person" placeholder="Person Name">
        <select id="category">
            <option>Groceries</option>
            <option>Rent</option>
            <option>Electricity</option>
            <option>Internet</option>
            <option>Fuel</option>
            <option>Medical</option>
            <option>Education</option>
            <option>Entertainment</option>
            <option>Shopping</option>
            <option>Life Insurance</option>
            <option>Savings</option>
            <option>Investment</option>
            <option>Loan Due</option>
        </select>
        <input type="number" id="amount" placeholder="Amount">
        <input type="date" id="date">
        <input type="text" id="description" placeholder="Description">
    </div>

    <div class="add-btn-row">
        <button onclick="addExpense()">Add Expense</button>
    </div>

    <table id="expenseTable">
        <tr>
            <th>Person</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
        </tr>
    </table>

</div>

<script>
let totalSavings = 0;

/* Dark Mode */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

/* Add Expense */
async function addExpense() {
    const person = document.getElementById("person").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;

    if (!person || !amount || !date) {
        alert("Please fill all required fields!");
        return;
    }

    await fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person, category, amount, date, description })
    });

    const table = document.getElementById("expenseTable");
    const row = table.insertRow();

    row.insertCell(0).innerText = person;
    row.insertCell(1).innerText = category;
    row.insertCell(2).innerText = amount;
    row.insertCell(3).innerText = date;
    row.insertCell(4).innerText = description;

    if(category === "Savings") {
        totalSavings += amount;
        console.log("Total Savings:", totalSavings);
    }

    // Clear inputs
    document.getElementById("person").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    document.getElementById("description").value = "";
}
</script>

</body>
</html>
