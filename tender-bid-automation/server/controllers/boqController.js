import { v4 as uuidv4 } from "uuid";
import Tender from "../models/Tender.js";
import { readDB, writeDB } from "../config/db.js";

export async function getBOQItems(req, res) {
  try {
    const tender = await Tender.findOne({ id: req.params.tenderId }).lean();
    if (tender) {
      return res.json({
        success: true,
        source: "MongoDB",
        boqItems: tender.boqItems || [],
      });
    }

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (!localTender)
      return res.status(404).json({ success: false, error: "Tender not found" });
    res.json({
      success: true,
      source: "Local",
      boqItems: localTender.boqItems || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function saveBOQItems(req, res) {
  try {
    const { boqItems } = req.body;

    const tender = await Tender.findOneAndUpdate(
      { id: req.params.tenderId },
      {
        $set: {
          boqItems: boqItems || [],
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true }
    ).lean();

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (localTender) {
      localTender.boqItems = boqItems || [];
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.json({
      success: true,
      source: "MongoDB",
      boqItems: tender ? tender.boqItems : boqItems || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addBOQItem(req, res) {
  try {
    const qty = Number(req.body.quantity) || 1;
    const rate = Number(req.body.unitPrice) || 0;

    const newItem = {
      id: `boq_${uuidv4().slice(0, 6)}`,
      item: req.body.item || "New Deliverable Item",
      category: req.body.category || "Services",
      unit: req.body.unit || "Nos",
      quantity: qty,
      unitPrice: rate,
      total: qty * rate,
    };

    const tender = await Tender.findOneAndUpdate(
      { id: req.params.tenderId },
      {
        $push: { boqItems: newItem },
        $set: { updatedAt: new Date().toISOString() },
      },
      { new: true }
    ).lean();

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (localTender) {
      if (!localTender.boqItems) localTender.boqItems = [];
      localTender.boqItems.push(newItem);
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.status(201).json({
      success: true,
      source: "MongoDB",
      item: newItem,
      boqItems: tender ? tender.boqItems : localTender?.boqItems || [newItem],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteBOQItem(req, res) {
  try {
    const { tenderId, itemId } = req.params;

    const tender = await Tender.findOneAndUpdate(
      { id: tenderId },
      {
        $pull: { boqItems: { id: itemId } },
        $set: { updatedAt: new Date().toISOString() },
      },
      { new: true }
    ).lean();

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === tenderId);
    if (localTender) {
      localTender.boqItems = (localTender.boqItems || []).filter(
        (i) => i.id !== itemId
      );
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.json({
      success: true,
      source: "MongoDB",
      message: "BOQ item deleted",
      boqItems: tender ? tender.boqItems : localTender?.boqItems || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
