import express from 'express';
import {validateMaintainXWebhook} from '../services/validation.service';
import {syncPurchaseOrder, syncExistingPurchaseOrder} from '../services/purchaseOrder.service';
const router = express.Router();

interface workOrderRequest  {
    workOrderId: number;
    newWorkOrder: { priority: string };
    orgId: number;
}

const handleError = (err: any, res: express.Response, status: any) => {
    console.log(err);
}

router.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
    const MAINTAINX_NEW_PURCHASE_ORDER = process.env.MAINTAINX_NEW_PURCHASE_ORDER || '';
    await processPurchaseOrderRequest(req, res, MAINTAINX_NEW_PURCHASE_ORDER, syncPurchaseOrder);
}) ;

router.post('/update', async (req: express.Request, res: express.Response): Promise<void> => {
    const MAINTAINX_NEW_PURCHASE_ORDER_CHANGE = process.env.MAINTAINX_NEW_PURCHASE_ORDER_CHANGE || '';
    await processPurchaseOrderRequest(req, res, MAINTAINX_NEW_PURCHASE_ORDER_CHANGE, syncExistingPurchaseOrder);
});

// router.post('/status', async (req: express.Request, res: express.Response): Promise<void> => {
//     console.log('Purchase order status method');
//     const MAINTAINX_NEW_PURCHASE_ORDER_STATUS = process.env.MAINTAINX_NEW_PURCHASE_ORDER_STATUS || '';
//     await processPurchaseOrderRequest(req, res, MAINTAINX_NEW_PURCHASE_ORDER_STATUS, syncStatusPurchaseOrder );
// });

async function processPurchaseOrderRequest(req: express.Request, res: express.Response, secret: string, callFunction: any): Promise<void> {
    try {

        if (!validateMaintainXWebhook(req, secret)) {
            return handleError('Invalid signature', res, 401);
        }

        await callFunction(req);

        res.status(200).json({ message: "Work order updated successfully" });
    } catch(error: any) {
        console.error(error);
        handleError(error,res, 400);
    }
}

export default router;