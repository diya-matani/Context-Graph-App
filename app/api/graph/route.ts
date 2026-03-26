import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'o2c_graph.db');

function queryDb(query: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function GET() {
  const nodes: any[] = [];
  const links: any[] = [];
  const addedNodes = new Set<string>();

  const addNode = (id: string, label: string, group: string, _type?: string) => {
    if (!addedNodes.has(id)) {
      nodes.push({ id, label, group });
      addedNodes.add(id);
    }
  };

  try {
    const customers = await queryDb('SELECT businessPartner FROM business_partners LIMIT 50');
    customers.forEach(c => addNode(`CUST_${c.businessPartner}`, `Customer ${c.businessPartner}`, 'Customer'));

    const orders = await queryDb('SELECT salesOrder, soldToParty FROM sales_order_headers LIMIT 150');
    orders.forEach(o => {
      addNode(`SO_${o.salesOrder}`, `Order ${o.salesOrder}`, 'SalesOrder');
      if (o.soldToParty) {
        addNode(`CUST_${o.soldToParty}`, `Customer ${o.soldToParty}`, 'Customer');
        links.push({ source: `CUST_${o.soldToParty}`, target: `SO_${o.salesOrder}`, type: 'PLACED' });
      }
    });

    const billings = await queryDb('SELECT billingDocument, soldToParty FROM billing_document_headers LIMIT 150');
    billings.forEach(b => {
      addNode(`BILL_${b.billingDocument}`, `Billing ${b.billingDocument}`, 'Billing');
      if (b.soldToParty) {
        addNode(`CUST_${b.soldToParty}`, `Customer ${b.soldToParty}`, 'Customer');
        links.push({ source: `CUST_${b.soldToParty}`, target: `BILL_${b.billingDocument}`, type: 'BILLED_TO' });
      }
    });

    /* 
    const deliveries = await queryDb('SELECT outboundDelivery, soldToParty FROM outbound_delivery_headers LIMIT 150');
    deliveries.forEach(d => {
      addNode(`DEL_${d.outboundDelivery}`, `Delivery ${d.outboundDelivery}`, 'Delivery');
      if (d.soldToParty) {
        links.push({ source: `CUST_${d.soldToParty}`, target: `DEL_${d.outboundDelivery}`, type: 'DELIVERED_TO' });
      }
    }); 
    */

    return NextResponse.json({ nodes, links });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
