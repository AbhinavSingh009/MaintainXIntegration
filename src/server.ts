import express from "express";
import * as dotenv from "dotenv";
import workorderRoute from "./routes/workOrder.route";
import purchaseOrderRoute from "./routes/purchaseOrder.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/workorder', workorderRoute);
app.use('/purchaseorder', purchaseOrderRoute);
app.get('/', (req, res) => {
    res.send('Hello from MaintainX!');  // Or send HTML/JSON
});
app.listen(3002, (): void => {
    console.log(`Server is running on port: ${port}`);
});


