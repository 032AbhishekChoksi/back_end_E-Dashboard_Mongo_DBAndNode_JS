const express = require("express");
const cors = require("cors")
require("./db/config");
const User = require("./model/User");
const Product = require("./model/Product");
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';
const { response } = require("express");
const app = express();

app.use(express.json());
app.use(cors());

// Register User
app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send("Something went wrong")
        }
        resp.send({ result, auth: token })
    })
})

// Login User
app.post("/login", async (req, resp) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send("Something went wrong")
                }
                resp.send({ user, auth: token })
            })
        }
        else {
            resp.send({ result: 'No User Found' })
        }
    } else {
        resp.send({ result: 'No User Found' })
    }
})

// Add Product
app.post("/add-product", verifyToken, async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
})

// Get All Products
app.get("/products", verifyToken, async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: 'No Products Found' })
    }
})

// Delete Product
app.delete("/product/:id", verifyToken, async (req, resp) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result)
})

// Get One Product
app.get("/product/:id", verifyToken, async (req, resp) => {
    // resp.send(req.params.id)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        let product = await Product.findOne({ _id: req.params.id });
        if (product) {
            resp.send(product)
        } else {
            resp.send({ result: 'No Products Found' })
        }
    } else {
        resp.send({ result: 'No Products Found' })
    }
})

// Update Product
app.put("/product/:id", verifyToken, async (req, resp) => {
    // resp.send(req.params.id) 
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})

// Search Product
app.get("/search/:key", verifyToken, async (req, resp) => {
    // resp.send(req.params.id) 
    let result = await Product.find(
        {
            "$or": [
                { name: { $regex: req.params.key } },
                { price: { $regex: req.params.key } },
                { category: { $regex: req.params.key } },
                { company: { $regex: req.params.key } }
            ]
        }
    );
    resp.send(result)
});

// Middleware
function verifyToken(req, resp, next) {
    let token = req.headers['authorization']
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                resp.status(401).send({ result: 'Please Provide Valid Token!' })
            } else {
                next();
            }
        })
    } else {
        resp.status(403).send({ result: 'Please add Token with header!' })
    }
}

app.listen(5000)