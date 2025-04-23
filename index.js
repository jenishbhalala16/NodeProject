const express = require("express")
const con = require("./config")
const productDetails = require("./config")
const app = express();
const jwt = require("jsonwebtoken");
const e = require("express");
const { log } = require("console");

const secreteKey = "$!@#&^%#*!$asdbhgwgem#&^%HGJGhdgdflkhGLHG*%@$*JGKhgsdgfkh&^%$#sdfdh"

app.use(express.json());

app.get("/", (req, res) => {

    con.query("SELECT * FROM users", (error, result) => {
                
        if (error) {
           res.send("Erroe")
        } else { 
            res.send(result);

        }

    })

});


// app.get("/home", verifyToken, (req, res) => {

//     jwt.verify(req.token, secreteKey, (error,authData) => {
//         if (error) {
//             console.log(error);
//          } else {
//             productDetails.query("SELECT * FROM productdetails", (err, products) => {
//                 if (err) {
//                     return res.status(500).json({ message: "Failed to fetch products", error: err });
//                 }

//                 res.json({
//                     message: "Login successful",
//                     products: products
//                 });
//             });
//         }
//     });

// });


// Product Details
app.get("/home", verifyToken, (req, res) => {
  jwt.verify(req.token, secreteKey, (error, authData) => {
    if (error) {
      return res.status(403).json({ result: "Invalid or expired token" });
    }

    const userID = authData.id;

   

    const sql = `
      SELECT 
  p.*, 
  CASE 
    WHEN f.productID IS NOT NULL THEN 1 
    ELSE 0 
  END AS isFavorite
FROM productdetails p
LEFT JOIN favorites f 
  ON p.id = f.productID AND f.userID = ?
ORDER BY p.id ASC
    `;

    productDetails.query(sql, [userID], (err, products) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch products", error: err });
      }

      res.json({
        message: "Login successful",
        products: products
      });
    });
  });
});



// ADD TO CART
app.post("/addToCart", verifyToken, (req, res) => {
    const { userID, productID, quantity } = req.body;
  
    jwt.verify(req.token, secreteKey, (error, authData) => {
      if (error) {
        return res.status(403).json({ result: "Invalid or expired token" });
      }
  
      if (!userID || !productID) {
        return res.status(400).send({ message: "Missing userID or productID" });
      }
  
      const qty = quantity || 1;
  
      const sql = `
        INSERT INTO cart (userID, productID, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + ?`;
  
      con.query(sql, [userID, productID, qty, qty], (err, result) => {
        if (err) {
          return res.status(500).send({ message: "Error adding to cart", err });
        }
  
        res.send({ message: "Item added to cart successfully", result });
      });
    });
  });
  
  
// FETCH CART ITEM
app.post("/cart", verifyToken, (req, res) => {
   
    const userID = req.body.userID;
   jwt.verify(req.token, secreteKey, (error, authData) => {

        if (error) {
            console.log(error);
            return res.status(403).json({ result: "Invalid or expired token" });
        } else {
    const sql = `SELECT 
  c.id AS cartItemID,  
  c.quantity AS cartQuantity,
  p.id AS productID,
  p.name,
  p.price,
  p.imageURL,
  p.discription
FROM cart c 
LEFT JOIN productdetails p ON c.productID = p.id 
WHERE c.userID = ?`;
    
    con.query(sql, [userID], (err, result) => {
      if (err) return res.status(500).send({ message: "Error fetching cart", err });
  
      res.send({ message: "Cart items", cart: result });
    });
  }

  });

});


// UPDATE CART ITEM QUANTITY
app.post("/updateCartQuantity", verifyToken, (req, res) => {
    const { userID, productID, quantity } = req.body;

    jwt.verify(req.token, secreteKey, (error, authData) => {
        if (error) {
            return res.status(403).json({ result: "Invalid or expired token" });
        }

        if (!userID || !productID || quantity == null) {
            return res.status(400).send({ message: "Missing userID, productID or quantity" });
        }

        const sql = `UPDATE cart SET quantity = ? WHERE userID = ? AND productID = ?`;

        con.query(sql, [quantity, userID, productID], (err, result) => {
            if (err) {
                return res.status(500).send({ message: "Error updating cart quantity", err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Cart item not found" });
            }

            res.send({ message: "Cart quantity updated successfully", result });
        });
    });
});


app.get("/favorite", verifyToken, (req,res) => { 
 
  jwt.verify(req.token, secreteKey, (error, authData) => { 
    const userID = authData.id;
    if (error) {
      console.log(error);
      return res.status(403).json({ result: "Invalid or expired token" });
    } else { 
      const sql = `SELECT  
  c.id AS favItemID,  
  p.id AS productID,
  p.name,
  p.price,
  p.imageURL,
  p.discription,
  p.quantity
FROM favorites c 
LEFT JOIN productdetails p ON c.productID = p.id 
WHERE c.userID = ?`;

      con.query(sql, [userID], (err, result) => { 
        
        if (err) return res.status(500).send({ message: "Error fetching favorite", err });

           res.send({message: "Successfully fetch favorite items", favorite: result})
      })

    }

  })

})


// DELETE CART ITEM
app.post("/deleteCartItem", verifyToken, (req, res) => {
    const { cartItemID } = req.body;
  
    jwt.verify(req.token, secreteKey, (error, authData) => {
      if (error) {
        return res.status(403).json({ result: "Invalid or expired token" });
      }
  
      if (!cartItemID) {
        return res.status(400).json({ message: "cartItemID and userID are required" });
      }
  
      const deleteSql = "DELETE FROM cart WHERE id = ?";
      con.query(deleteSql, [cartItemID], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Failed to delete cart item", err });
          }
          
          if (result.affectedRows === 0) {
            return res.json({ message: "Cart item not found" });
          }
    
  
        res.json({
            message: "Cart item deleted successfully",
            cart: result,
          });
      });
    });
});
  

// ADD ITEM TO FAVORITE 
app.post("/addFavorite", verifyToken, (req, res) => {
    const { userID, productID } = req.body;
  
    jwt.verify(req.token, secreteKey, (error, authData) => {
      if (error) {
        return res.status(403).json({ result: "Invalid or expired token" });
      }
  
      // Check if already in favorites
      const checkSql = "SELECT * FROM favorites WHERE userID = ? AND productID = ?";
      con.query(checkSql, [userID, productID], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", err });
  
        if (result.length > 0) {
          // Remove from favorites
          const deleteSql = "DELETE FROM favorites WHERE userID = ? AND productID = ?";
          con.query(deleteSql, [userID, productID], (delErr) => {
            if (delErr) return res.status(500).json({ message: "Failed to remove favorite", delErr });
            res.json({
              message: "Removed from favorites",
              "status": false
             });
          });
        } else {
          // Add to favorites
          const insertSql = "INSERT INTO favorites (userID, productID) VALUES (?, ?)";
          con.query(insertSql, [userID, productID], (insErr) => {
            if (insErr) return res.status(500).json({ message: "Failed to add favorite", insErr });
            res.json({ message: "Added to favorites" ,"status": true});
          });
        }
      });
    });
  });
  


  
// LOGIN 
app.post("/login",  (req, res) => {
    const { email, password } = req.body;

   
  
    con.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
      if (err) return res.status(500).send({ message: "DB error", err });
  
      if (result.length === 0) {
        return res.status(404).send({ message: "User not found" });
      }
  
      const user = result[0];
  
      if (user.password !== password) {
        return res.send({ message: "Invalid password" });
      }
      console.log("USERRRR:::::::::::" + user.id);
      // Generate token
      jwt.sign({ id: user.id, email: user.email }, secreteKey, { expiresIn: "7d" }, (err, token) => {
        if (err) return res.status(500).send({ message: "Token generation failed" });
  
        res.send({
            message: "Login successful",
            user,
            token: token
        });
      });
    });
  });



// SIGHN UP
app.post("/signUp", (req, res) => {
    const data = req.body;

     // First check if email already exists
     con.query("SELECT * FROM users WHERE email = ?", [data.email], (error, result) => {
        if (error) {
            return res.status(500).send({ message: "Server error", error });
        }

        if (result.length > 0) {
            return res.send({ message: "Email already exists"});
        }

        // If email does not exist, insert new user
        con.query("INSERT INTO users SET ?", data, (insertError, insertResult) => {
            if (insertError) {
                return res.status(500).send({ message: "Insert failed", error: insertError });
            }

            if (insertResult.affectedRows === 1) {
                
                return onTokenGenerate(data, res);
            } else {
                return res.status(500).send({ message: "User registration failed." });
            }
        });
    });
    

});


function onTokenGenerate(user,res) { 
    jwt.sign({ user }, secreteKey, { expiresIn: "7d" }, (err,token) => { 
        res.json({
          message: "User register sucessfully",
           user,
           token
       })
    })
}


// PROFILE
app.post("/profile", verifyToken, (req, res) => {
    jwt.verify(req.token, secreteKey, (error, authData) => {
        if (error) {
            return res.status(403).json({ result: "Invalid or expired token" });
        } else {
            res.json({
                message: "Profile fetched successfully",
                authData
            });
        }
    });
});


// VERIFY TOKEN
function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
        const token = bearerHeader.split(" ")[1];
        req.token = token;
        next();
    } else {
        return res.status(401).json({ result: "Unauthorized - Token missing" });
    }
}





app.put("/:id", (req, res) => {

    const data = [req.body.name, req.body.password, req.params.id];

    con.query("UPDATE users SET name = ?, password= ? where id=  ?", data, (error, result, fields) => {

        if (error) error;
        res.send(result);

    })


});

app.delete("/:id", (req,res) => { 

    con.query("DELETE FROM users WHERE id="+ req.params.id, (error, result, fields) => {

        if (error) error;
        res.send(result);

    })

})

app.listen(3000, () => { 
    console.log("Server listening on port 3000");
});