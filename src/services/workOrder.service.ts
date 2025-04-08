import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const priority_list: Record<string, number> = {
    none: 15,
    low: 10,
    medium: 5,
    high: 1
}

export const calculateDueDate = (priority: string): string => {

    const currentDate = new Date();
    const priorityDate = priority_list[priority.toLowerCase()];
    if (!priorityDate) {
        throw new Error(`Invalid priority: ${priority}`);
    }

    currentDate.setDate(currentDate.getDate() + priorityDate);

    return  currentDate.toISOString();
}

export const updateWorkOrderDueDate =  async (workOrderID:number, priority: string, orgID: number): Promise<void> => {

    const maintainXURL = `https://api.getmaintainx.com/v1/workorders/${workOrderID}`;
    const body = { dueDate: calculateDueDate(priority) };
    const headers = {
        'Authorization': `Bearer ${process.env.MAINTAINX}`,
        'x-organization-id': orgID.toString(),
        'Content-Type': 'application/json',
    };
        try {
            await axios.patch(maintainXURL, body, {headers});
        } catch (error: any) {

            throw new Error('Error updating work order');
        }
}