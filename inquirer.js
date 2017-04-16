var inquirer = require('inquirer');

var selectItem = function (choice) {
    inquirer.prompt({
        name: "productID",
        type: "list",
        message: "Which product would you like to buy",
        choices: choice
    }).then(function (answer) {
        //
        console.log(answer);
    });
};