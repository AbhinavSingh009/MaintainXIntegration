import request from 'supertest';
import express from 'express';
import router from '../routes/workOrder.route';
import * as validationService from '../services/validation.service';

jest.mock('../services/workorder.service', () => ({
    updateWorkOrderDueDate: jest.fn()
}));

jest.mock('../services/validation.service', () => ({
    validateMaintainXWebhook: jest.fn(() => true)
}));

const app = express();
app.use(express.json());
app.use('/workorder', router);

describe('POST /workorder/update', () => {
    it('should return 200 for valid request', async () => {
        const response = await request(app)
            .post('/workorder/update')
            .send({
                workOrderId: 123,
                newWorkOrder: { priority: 'high' },
                orgId: 456
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Work order updated successfully' });
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/workorder/update')
            .send({
                newWorkOrder: { priority: 'high' }
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('Something went wrong');
    });

    describe('POST /workorder/update', () => {
        it('should return 401 if signature is invalid', async () => {
            (validationService.validateMaintainXWebhook as jest.Mock).mockReturnValueOnce(false);

            const response = await request(app).post('/workorder/update').send({
                workOrderId: 123,
                newWorkOrder: { priority: 'low' },
                orgId: 456
            });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ "Something went wrong": "Invalid signature" });
        });
    });
});
