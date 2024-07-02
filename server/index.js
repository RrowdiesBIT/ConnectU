import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
//security packages
import helmet from "helmet";
import dbConnection from "./dbConfig/index.js"
import router from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js"
dotenv.config();


const app = express();
const PORT = process.env.PORT || 4000;

//dbConnection
dbConnection();

//security and cors middleware
app.use(helmet());
app.use(cors());

//loggin middleware
app.use(morgan("dev"));

//bodyparsing middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//express body parsing
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended:true}));

//server static files from ract-app
const __dirname = path.resolve(path.dirname(""));
app.use(express.static(path.join(__dirname,"./views/build")));

// Use the router for handling routes
app.use(router);

app.use(errorMiddleware);
// Start the server
app.listen(PORT, () => {
  console.log(`SERVER is running at port: ${PORT}`);
});
