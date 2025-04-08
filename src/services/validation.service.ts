import express from "express";
import crypto from "crypto";

export const validateMaintainXWebhook = (req: express.Request, secret: string): boolean => {
    try {

        const headerSignature = req.header('x-maintainx-webhook-body-signature');
        if (!headerSignature) {
            console.error('Missing signature header');
            return false;
        }

        const parts = headerSignature.split(',');
        let timestamp: string | null = null;
        let signature: string | null = null;

        parts.forEach(part => {
            const [prefix, value] = part.split('=');
            if (prefix === 't') timestamp = value;
            if (prefix === 'v1') signature = value;
        });

        if (!timestamp || !signature) {
            console.error('Invalid signature format');
            return false;
        }

        const signedPayload = `${timestamp}.${JSON.stringify(req.body)}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

        if (signature !== expectedSignature) {
            console.error('Signature mismatch');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
};