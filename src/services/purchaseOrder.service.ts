import axios from "axios";
import dotenv from "dotenv";
import {mapMaintainXToCoupa} from '../mappings/maintainx-to-coupa';
import express from "express";
dotenv.config();

const data  = {
    "purchaseOrder": {
        "id": 135,
        "note": "Please deliver during business hours",
        "reviewNote": "Please adjust quantities and resubmit",
        "status": "APPROVED",
        "dueDate": "2022-01-01T00:00:00.000Z",
        "creatorId": 432,
        "vendorId": 432,
        "autoGeneratedNumber": 987,
        "overrideNumber": "A123",
        "approverId": 135,
        "approvalDate": "2022-01-01T00:00:00.000Z",
        "updatedAt": "2022-01-01T00:00:00.000Z",
        "items": [
            {
                "id": 23,
                "partId": 43,
                "name": "string",
                "partNumber": "string",
                "price": 25000,
                "quantityOrdered": 4,
                "quantityReceived": 3,
                "unitCost": 125000,
                "extraFields": {
                    "property1": "string",
                    "property2": "string"
                },
                "lineExtraFields": {
                    "Ordered Date": "2023-01-01"
                },
                "partExtraFields": {
                    "Part Number": "321"
                }
            }
        ],
        "costs": [
            {
                "id": 123,
                "name": "Sales Tax",
                "type": "AMOUNT_TAXABLE",
                "amount": 125000
            }
        ],
        "thumbnail": {
            "id": 12345,
            "mimeType": "image/png",
            "fileName": "image.png",
            "url": "http://example.com/image.png",
            "createdAt": "2022-01-01T00:00:00.000Z",
            "width": 220,
            "height": 100
        },
        "attachments": [
            {
                "id": 12345,
                "mimeType": "image/png",
                "fileName": "image.png",
                "url": "http://example.com/image.png",
                "createdAt": "2022-01-01T00:00:00.000Z",
                "width": 220,
                "height": 100
            }
        ],
        "vendorContactIds": [
            12
        ],
        "shippingAddress": {
            "city": "Montreal",
            "country": "Canada",
            "postalCode": "H4B 5G0",
            "state": "Quebec",
            "street": "1909 Avenue des Canadiens-de-Montréal",
            "label": "1909 Avenue des Canadiens-de-Montréal, Montreal, H4B 5G0, QC, CA "
        },
        "billingAddress": {
            "city": "Montreal",
            "country": "Canada",
            "postalCode": "H4B 5G0",
            "state": "Quebec",
            "street": "1909 Avenue des Canadiens-de-Montréal",
            "label": "1909 Avenue des Canadiens-de-Montréal, Montreal, H4B 5G0, QC, CA "
        },
        "extraFields": {
            "Ordered Date": "2023-01-01"
        }
    }
}

const getHeaders = () => {
    return {
        'Authorization': `Bearer ${process.env.COUPA}`,
        'Content-Type': 'application/json',
    }
}

export const syncFailedPurchaseOrders = (priority: string): void => {
    // This function will be executed as the might be a possibility of Copa's API not functioning properly.
}

export const syncPurchaseOrder = async (req: express.Request): Promise<void> => {
    const coupaURL = `https://merchantX.coupahost.com/api/purchase_orders`;
    const headers = getHeaders();
    const coupa_purchase_order_data = mapMaintainXToCoupa(data);

    console.log('The new data is ', coupa_purchase_order_data);

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

    const headers = getHeaders();
    let coupaURL = `https://merchantX.coupahost.com/api/purchase_orders/${req.body.purchaseOrder.purchaseOrderId}`;
    let coupa_purchase_order_data;
    try{
        if(req.body.newPurchaseOrder.status === 'CANCELED') {
            coupa_purchase_order_data = {"cancel": true};
            coupaURL = `https://merchantX.coupahost.com/api/purchase_orders/${req.body.purchaseOrder.purchaseOrderId}/cancel`;
        } else {
            coupa_purchase_order_data = mapMaintainXToCoupa(data);
        }

        await axios.post(coupaURL, coupa_purchase_order_data, {headers});

    } catch(error: any) {
        throw new Error(error);
    }
}
