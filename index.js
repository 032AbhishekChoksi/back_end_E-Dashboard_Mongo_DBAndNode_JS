const express = require("express");
const cors = require("cors")
require("./db/config");
const User = require("./model/User");
const Product = require("./model/Product");
const app = express();

app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    resp.send(result);
})

app.post("/login", async (req, resp) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            resp.send(user)
        }
        else {
            resp.send({ result: 'No User Found' })
        }
    } else {
        resp.send({ result: 'No User Found' })
    }
})

app.post("/add-product", async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
})

app.get("/products", async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: 'No Products Found' })
    }
})

app.delete("/product/:id", async (req, resp) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result)
})

app.get("/product/:id", async (req, resp) => {
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

app.listen(5000)