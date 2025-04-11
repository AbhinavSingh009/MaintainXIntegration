export const  mapMaintainXToCoupa = (purchaseData: any) => {
    console.log('The prochase data is ',purchaseData);
    const po = purchaseData.purchaseOrder;
    const now = new Date().toISOString();
    const coupaOrder = {
        "acknowledged-flag": false,
        "created-at": now,
        "status": "issued",
        "transmission-status": "sent_via_email",
        "updated-at": now,
        "version": 1,
        "exported": false,
        "received": false,
        "created-by": {
            "email": "system@maintainx.com",
            "firstname": "System",
            "lastname": "Integration",
            "login": "system_integration"
        },
        "requisition-header": {
            "id": po.id || 0,
            "requester": {
                "email": po.creatorId ? `user${po.creatorId}@company.com` : "system@maintainx.com",
                "firstname": "MaintainX",
                "lastname": "User",
                "login": `mxuser${po.creatorId || 'system'}`
            }
        },
        "ship-to-address": mapShippingAddress(po.shippingAddress),
        "supplier": mapVendor(po),
        "payment-term": {
            "code": "Net 30"
        },
        "shipping-term": {
            "code": "Standard"
        },
        "order-lines": {
            "order-line": po.items.map(mapOrderLine)
        }
    };

    return coupaOrder;
}

// Helper functions
function mapShippingAddress(address: any) {
    if (!address) return null;

    return {
        "city": address.city || "",
        "postal-code": address.postalCode || "",
        "state": address.state || "",
        "street1": address.street || "",
        "country": {
            "code": address.country ? address.country.substring(0, 2).toUpperCase() : "US",
            "name": address.country || "United States"
        }
    };
}

function mapVendor(po: any) {
    return {
        "name": po.vendorId ? `Vendor ${po.vendorId}` : "Unknown Vendor",
        "number": po.vendorId || "0000",
        "primary-address": mapShippingAddress(po.billingAddress || po.shippingAddress)
    };
}

function mapOrderLine(item: any, index: any) {
    return {
        "accounting-total": item.price * (item.quantityOrdered || 1),
        "description": item.name || "MaintainX Item",
        "line-num": index + 1,
        "price": item.price || item.unitCost || 0,
        "quantity": item.quantityOrdered || 1,
        "total": item.price * (item.quantityOrdered || 1),
        "account": {
            "code": "01-100-8000", // Default account code
            "name": "Maintenance Supplies" // Default account name
        },
        "commodity": {
            "name": "Maintenance Parts" // Default commodity
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