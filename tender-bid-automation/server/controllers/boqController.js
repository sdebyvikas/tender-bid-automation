import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from '../config/db.js';

export async function getBOQItems(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });
    res.json({ success: true, boqItems: tender.boqItems || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function saveBOQItems(req, res) {
  try {
    const { boqItems } = req.body;
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    tender.boqItems = boqItems || [];
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, boqItems: tender.boqItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addBOQItem(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const qty = Number(req.body.quantity) || 1;
    const rate = Number(req.body.unitPrice) || 0;

    const newItem = {
      id: `boq_${uuidv4().slice(0, 6)}`,
      item: req.body.item || 'New Deliverable Item',
      category: req.body.category || 'Services',
      unit: req.body.unit || 'Nos',
      quantity: qty,
      unitPrice: rate,
      total: qty * rate
    };

    if (!tender.boqItems) tender.boqItems = [];
    tender.boqItems.push(newItem);
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.status(201).json({ success: true, item: newItem, boqItems: tender.boqItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteBOQItem(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    tender.boqItems = (tender.boqItems || []).filter(i => i.id !== req.params.itemId);
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, message: 'BOQ item deleted', boqItems: tender.boqItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
