
require('dotenv').config();
const mysql = require("mysql");

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
});

const productDetails = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
})

con.connect((error) => {
    if (error) {
        console.log("ERROR:::" + error);
    } else {
        console.log("Connected");

        // Execute query after connection is established
        con.query("SELECT * FROM users", (error, result, fields) => { 
            if (error) {
                console.log("Query Error:::", error);
            } else {
                console.log("Result:", result);
                console.log("fields:", fields);
            }

        });
    }
});


productDetails.connect((error) => {
    if (error) {
        console.log("ERROR:::" + error);
    } else {
        console.log("Connected");

        // Execute query after connection is established
        con.query("SELECT * FROM productdetails", (error, result, fields) => { 
            if (error) {
                console.log("Query Error:::", error);
            } else {
                console.log("Result:", result);
            }

        });
    }
});



module.exports = con;
module.exports = productDetails;