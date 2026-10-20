let expenses = JSON.parse(sessionStorage.getItem("expenses")) || [];
function saveExpenses() {
    sessionStorage.setItem("expenses", JSON.stringify(expenses));
}
function money(amount) {
    return "₹" + amount.toFixed(2);
}
function addCell(row, value) {
    let cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}
function showEmpty(list, message, columns) {
    let row = document.createElement("tr");
    let cell = document.createElement("td");
    cell.colSpan = columns;
    cell.textContent = message;
    cell.className = "empty";
    row.appendChild(cell);
    list.appendChild(row);
}
function todayDate() {
    let d = new Date();
    let month = String(d.getMonth() + 1).padStart(2, "0");
    let day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}
let page = document.body.dataset.page;
if (page === "add") {
    let form = document.getElementById("expenseForm");
    let date = document.getElementById("date");
    date.value = todayDate();
    date.max = todayDate();
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        let name = document.getElementById("name").value.trim();
        let amount = Number(document.getElementById("amount").value);
        let category = document.getElementById("category").value;
        let expenseDate = date.value;
        let payment = document.getElementById("payment").value;
        let description = document.getElementById("description").value;
        if (name === "" || amount <= 0 || expenseDate === "") {
            alert("Please enter valid details.");
            return;
        }
        if (expenseDate > todayDate()) {
            alert("Date cannot be in the future.");
            return;
        }
        let expense = {
            id: Date.now(),
            name: name,
            amount: amount,
            category: category,
            date: expenseDate,
            payment: payment,
            description: description
        };
        expenses.push(expense);
        saveExpenses();
        document.getElementById("message").textContent =
            "Expense added successfully!";
        form.reset();
        date.value = todayDate();
    });
}
function showDashboard() {
    let total = 0;
    let highest = 0;
    for (let i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
        if (expenses[i].amount > highest) {
            highest = expenses[i].amount;
        }
    }
    document.getElementById("total").textContent = money(total);
    document.getElementById("count").textContent = expenses.length;
    document.getElementById("highest").textContent = money(highest);
    let list = document.getElementById("recentList");
    list.innerHTML = "";
    if (expenses.length === 0) {
        showEmpty(list, "No expenses added yet.", 4);
        return;
    }
    let start = expenses.length - 5;
    if (start < 0) {
        start = 0;
    }
    for (let i = expenses.length - 1; i >= start; i--) {
        let row = document.createElement("tr");
        addCell(row, expenses[i].name);
        addCell(row, expenses[i].category);
        addCell(row, expenses[i].date);
        addCell(row, money(expenses[i].amount));
        list.appendChild(row);
    }
}
function showHistory() {
    let list = document.getElementById("historyList");
    let search = document.getElementById("search").value.toLowerCase();
    let category = document.getElementById("filter").value;
    let sort = document.getElementById("sort").value;
    list.innerHTML = "";
    let filtered = [];
    for (let i = 0; i < expenses.length; i++) {
        let name = expenses[i].name.toLowerCase();
        if (name.includes(search) &&
            (category === "All Categories" ||
             expenses[i].category === category)) {
            filtered.push(expenses[i]);
        }
    }
    for (let i = 0; i < filtered.length; i++) {
        for (let j = i + 1; j < filtered.length; j++) {
            let swap = false;
            if (sort === "newest" &&
                filtered[i].date < filtered[j].date) {
                swap = true;
            }
            if (sort === "oldest" &&
                filtered[i].date > filtered[j].date) {
                swap = true;
            }
            if (sort === "high" &&
                filtered[i].amount < filtered[j].amount) {
                swap = true;
            }
            if (sort === "low" &&
                filtered[i].amount > filtered[j].amount) {
                swap = true;
            }
            if (swap) {
                let temp = filtered[i];
                filtered[i] = filtered[j];
                filtered[j] = temp;
            }
        }
    }
    document.getElementById("historyCount").textContent =
        "Showing " + filtered.length + " expense(s)";
    if (filtered.length === 0) {
        showEmpty(list, "No matching expenses found.", 6);
        return;
    }
    for (let i = 0; i < filtered.length; i++) {
        let expense = filtered[i];
        let row = document.createElement("tr");
        addCell(row, expense.name);
        addCell(row, expense.category);
        addCell(row, expense.date);
        addCell(row, money(expense.amount));
        addCell(row, expense.payment);
        let cell = document.createElement("td");
        let edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.className = "edit-btn";
        edit.onclick = function() {
            let name = prompt("Enter expense name:", expense.name);
            if (name === null) {
                return;
            }
            name = name.trim();
            if (name === "") {
                alert("Name cannot be empty.");
                return;
            }
            let amount = prompt("Enter amount:", expense.amount);
            if (amount === null) {
                return;
            }
            amount = Number(amount);
            if (amount <= 0 || !Number.isFinite(amount)) {
                alert("Enter a valid amount.");
                return;
            }
            expense.name = name;
            expense.amount = amount;
            saveExpenses();
            showHistory();
        };
        let del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "delete-btn";
        del.onclick = function() {
            if (confirm("Delete this expense?")) {
                let index = expenses.indexOf(expense);
                expenses.splice(index, 1);
                saveExpenses();
                showHistory();
            }
        };
        cell.appendChild(edit);
        cell.appendChild(del);
        row.appendChild(cell);
        list.appendChild(row);
    }
}
function showReports() {
    let month = document.getElementById("month").value;
    let list = document.getElementById("reportList");
    let report = document.getElementById("categoryReport");
    let total = 0;
    let count = 0;
    let categories = ["Food", "Travel", "Shopping",
                      "Education", "Bills", "Other"];
    let amounts = [0, 0, 0, 0, 0, 0];
    let monthly = [];
    for (let i = 0; i < expenses.length; i++) {
        if (expenses[i].date.substring(0, 7) === month) {
            monthly.push(expenses[i]);
            total += expenses[i].amount;
            count++;
            for (let j = 0; j < categories.length; j++) {
                if (expenses[i].category === categories[j]) {
                    amounts[j] += expenses[i].amount;
                }
            }
        }
    }
    document.getElementById("monthlyTotal").textContent = money(total);
    document.getElementById("monthlyCount").textContent = count;
    let average = 0;
    if (count > 0) {
        average = total / count;
    }
    document.getElementById("average").textContent = money(average);
    report.innerHTML = "";
    for (let i = 0; i < categories.length; i++) {
        let row = document.createElement("div");
        row.className = "report-row";
        let info = document.createElement("div");
        info.className = "report-info";
        let name = document.createElement("span");
        name.textContent = categories[i];
        let value = document.createElement("span");
        value.textContent = money(amounts[i]);
        info.appendChild(name);
        info.appendChild(value);
        let background = document.createElement("div");
        background.className = "bar-background";
        let bar = document.createElement("div");
        bar.className = "bar";
        if (total > 0) {
            bar.style.width = (amounts[i] / total * 100) + "%";
        } else {
            bar.style.width = "0%";
        }
        background.appendChild(bar);
        row.appendChild(info);
        row.appendChild(background);
        report.appendChild(row);
    }
    list.innerHTML = "";
    if (count === 0) {
        showEmpty(list, "No expenses for this month.", 4);
        return;
    }
    for (let i = 0; i < monthly.length; i++) {
        let row = document.createElement("tr");
        addCell(row, monthly[i].name);
        addCell(row, monthly[i].category);
        addCell(row, monthly[i].date);
        addCell(row, money(monthly[i].amount));
        list.appendChild(row);
    }
}
if (page === "dashboard") {
    showDashboard();
}
if (page === "history") {
    document.getElementById("search").addEventListener("input", showHistory);
    document.getElementById("filter").addEventListener("change", showHistory);
    document.getElementById("sort").addEventListener("change", showHistory);
    showHistory();
}
if(page === "reports"){
    let month = document.getElementById("month");
    month.value = todayDate().substring(0, 7);
    month.addEventListener("change", showReports);
    showReports();
}