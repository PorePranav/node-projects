require("dotenv").config();
const connectDB = require("./db/connect");
const router = require("./routes/products");
//async errors

const express = require("express");
const app = express();

const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

//middleware
app.use(express.json());

//routes
app.get("/", (req, res) => {
    res.send("<h1>Store API</h1><a href='/api/v1/products'>Products Route</a>");
});

app.use("/api/v1/products", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

//products route

const port = process.env.PORT || 3000;
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server started on 127.0.0.1:${port}`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
