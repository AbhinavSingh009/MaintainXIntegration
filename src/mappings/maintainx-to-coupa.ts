type MaintainXPurchaseOrder = {
    purchaseOrder: {
        overrideNumber: string;
        status: string;
        dueDate: string;
        note: string;
        vendorId: number;
        shippingAddress: Address;
        billingAddress: Address;
        items: MaintainXItem[];
        extraFields?: Record<string, string>;
    };
};

type Address = {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
};

type MaintainXItem = {
    name: string;
    quantityOrdered: number;
    unitCost: number;
    partExtraFields?: {
        "Part Number"?: string;
    };
};

type CoupaPurchaseOrder = {
    purchase_order: {
        po_number: string;
        status: string;
        notes: string;
        need_by_date: string;
        supplier: {
            id: number;
        };
        ship_to_address: Address;
        bill_to_address: Address;
        order_lines: CoupaOrderLine[];
    };
};

type CoupaOrderLine = {
    line_num: number;
    description: string;
    quantity: number;
    price: number;
    item: {
        number: string;
    };
};

export const mapMaintainXToCoupaPO = (mxPO: MaintainXPurchaseOrder): CoupaPurchaseOrder  => {

    const po = mxPO.purchaseOrder;

    return {
        purchase_order: {
            po_number: po.overrideNumber,
            status: mapStatus(po.status),
            notes: po.note,
            need_by_date: po.dueDate.split("T")[0], // Trim time if ISO string
            supplier: {
                id: po.vendorId
            },
            ship_to_address: {...po.shippingAddress},
            bill_to_address: {...po.billingAddress},
            order_lines: po.items.map((item, index) => ({
                line_num: index + 1,
                description: item.name,
                quantity: item.quantityOrdered,
                price: item.unitCost,
                item: {
                    number: item.partExtraFields?.["Part Number"] || "UNKNOWN"
                }
            }))
        }
    };
}

function mapStatus(mxStatus: string): string {
    switch (mxStatus.toUpperCase()) {
        case "APPROVED":
            return "issued";
        case "DRAFT":
            return "draft";
        default:
            return "draft";
    }
}
