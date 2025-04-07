import express from 'express';
import {updateWorkOrderDueDate} from '../services/workOrder.service';
import {validateMaintainXWebhook} from '../services/validation.service';
const router = express.Router();


const handleError = (err: any, res: express.Response, status: number) => {
    console.log(err);
    res.status(status).json({"Something went wrong": err});
}

router.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
    console.log('New Order Request');
    const MAINTAINX_NEW_WORK_ORDER = process.env.MAINTAINX_NEW_WORK_ORDER_UPDATE || '';
    await processWorkOrderRequest(req, res, MAINTAINX_NEW_WORK_ORDER)

}) ;

router.post('/update', async (req: express.Request, res: express.Response): Promise<void> => {
    console.log('Order updated Method', req.body);
    const MAINTAINX_NEW_WORK_ORDER_UPDATE = process.env.MAINTAINX_NEW_WORK_ORDER_UPDATE || '';
    await processWorkOrderRequest(req, res, MAINTAINX_NEW_WORK_ORDER_UPDATE);
});

async function processWorkOrderRequest(req: express.Request, res: express.Response, secret: string): Promise<void> {
    try {

        if (!validateMaintainXWebhook(req, secret)) {
            return handleError('Invalid signature',res, 401);
        }

        const { workOrderId, newWorkOrder, orgId } = req.body;
        if(!workOrderId || !newWorkOrder || !orgId) {
            handleError('Missing Information', res, 400);
        }

        await updateWorkOrderDueDate(workOrderId, newWorkOrder.priority, orgId);

        res.status(200).json({ message: "Work order updated successfully" });
    } catch(error: any) {
        handleError('This is failed',res, error.status);
    }
}

export default router;