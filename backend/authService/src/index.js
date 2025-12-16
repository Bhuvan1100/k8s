import express from "express";
import { signup, login } from "./router/routing.js";


const app = express();

app.use(express.json());

app.post('signup',signup);
app.post('login', login)

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
