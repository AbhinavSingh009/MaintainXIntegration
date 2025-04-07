import axios from "axios";
import dotenv from "dotenv";
import {mapMaintainXToCoupaPO} from '../mappings/maintainx-to-coupa';
import express from "express";
dotenv.config();

const getHeaders = () => {
    return {
        'Authorization': `Bearer ${process.env.COUPA}`,
        'Content-Type': 'application/json',
    }
}

const getMXHeaders = () =>{
    return {
        'Authorization': `Bearer ${process.env.MAINTAINX}`,
        'Content-Type': 'application/json'
    }
}

export const syncFailedPurchaseOrders = (priority: string): void => {
    // This function will be executed as the might be a possibility of Copa's API not functioning properly.
}

export const syncPurchaseOrder = async (req: express.Request): Promise<void> => {
    const coupaURL = `https://merchantX.coupahost.com/api/purchase_orders`;
    const headers = getHeaders();
    const coupa_purchase_order_data = mapMaintainXToCoupaPO(req.body);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            await axios.post(coupaURL, coupa_purchase_order_data, { headers });
            return;
        } catch (error: any) {
            attempt++;
            console.error(`Attempt ${attempt} failed:`, error?.response?.status || error.message);

            if (attempt >= maxRetries) {
                throw new Error(`Failed to sync PO after ${maxRetries} attempts`);
            }

            await new Promise((res) => setTimeout(res, 1000));
        }
    }
};

export const syncExistingPurchaseOrder =  async (req: express.Request): Promise<void> => {

    const coupaURL = `https://merchantX.coupahost.com/api/purchase_orders/12345`;
    const maintainXURL = `https://api.getmaintainx.com/v1/purchaseorders/${req.body.purchaseOrderId}`
    let headers  = getMXHeaders();
    try{
        const getMainTainXOrder = await axios.get(maintainXURL, {headers});


        const coupa_purchase_order_data = mapMaintainXToCoupaPO(getMainTainXOrder.data);

        headers = getHeaders();
        await axios.post(coupaURL, coupa_purchase_order_data, {headers});

    } catch(error: any) {
        throw new Error(error);
    }
}

export const syncStatusPurchaseOrder =  async (req: express.Request): Promise<void> => {

    try {
        const headers  = getHeaders();
        let coupaURL = `https://merchantX.coupahost.com/api/purchase_orders/${req.body.purchaseOrder.overrideNumber}/cancel`;

        if(req.body.newStatus === 'CANCELED') {
            await axios.put(coupaURL, {"cancel": true}, {headers});
        } else {
            coupaURL = `https://merchantX.coupahost.com/api/purchase_orders/${req.body.purchaseOrder.overrideNumber}`;
            await axios.put(coupaURL, {status:req.body.newStatus}, {headers});
        }

    } catch(error: any) {
        console.log('Error updating work order');
        throw new Error(error);
    }

}
