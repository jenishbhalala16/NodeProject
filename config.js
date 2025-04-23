const mysql = require("mysql");

const con = mysql.createConnection({
    host: "bjiyeefxvcrlmjzqzrv2-mysql.services.clever-cloud.com",
    user: "unpqo7fzbyngsdtr",
    password: "4Y99pCFS2IgNbWy2fHKG",
    database: "bjiyeefxvcrlmjzqzrv2"
});

const productDetails = mysql.createConnection({
    host: "bjiyeefxvcrlmjzqzrv2-mysql.services.clever-cloud.com",
    user: "unpqo7fzbyngsdtr",
    password: "4Y99pCFS2IgNbWy2fHKG",
    database: "bjiyeefxvcrlmjzqzrv2"
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