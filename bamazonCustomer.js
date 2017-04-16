var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
});

var displayTable = function () {
    var tableField = [];
    connection.query("SHOW COLUMNS FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            tableField.push(res[i].Field);
        }
        var table = new Table({
            head: tableField
            , colWidths: [9, 25, 20, 9, 9]
        });

        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            choice = [];
            for (var i = 0; i < res.length; i++) {
                //console.log(JSON.stringify(res[i]));
                var row = [];
                row.push(res[i].item_id);
                row.push(res[i].product_name);
                row.push(res[i].department_name);
                row.push(res[i].price);
                row.push(res[i].stock_quantity);
                table.push(row);
                choice.push(JSON.stringify(res[i].item_id));
            }
            console.log(table.toString());
            //console.log(choice);
            selectItem(choice);
        });
    });
};

var selectItem = function (choice) {
    inquirer.prompt([{
        name: "productID",
        type: "rawlist",
        message: "Which product would you like to buy \n",
        choices: choice
    }, {
        name:"quantity",
        type: "input",
        message: "How many? \n",
        }]).then(function (answer) {
        //
        //console.log(answer.productID);
        //console.log(answer.quantity);

        connection.query("SELECT stock_quantity, price FROM products WHERE ?", { item_id: answer.productID }, function (err, res) {
            if (err) throw err;
            var stockQuantity = res[0].stock_quantity;
            var itemPrice = res[0].price;
            if (res[0].stock_quantity < answer.quantity) {
                console.log("Insufficient stock");
                displayTable();
            } else {
                var updatedQuantity = stockQuantity - answer.quantity;
                console.log("Successful purchase ");
                console.log("Your total is " + itemPrice*answer.quantity);
                connection.query("UPDATE products SET ? WHERE ?", [{
                    stock_quantity: updatedQuantity
                }, {
                    item_id: answer.productID
                }]);
                displayTable();
            }
        });
    });
};

displayTable();