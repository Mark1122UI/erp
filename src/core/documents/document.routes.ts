import { Router } from 'express';
import { z } from 'zod';
import { documentService } from './document.service.js';
import { DocumentType } from './document.types.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import { BadRequestError } from '../common/errors.js';

const router = Router();

const TYPE_MAP: Record<string, DocumentType> = {
  invoice: 'INVOICE',
  invoices: 'INVOICE',
  receipt: 'RECEIPT',
  receipts: 'RECEIPT',
  quote: 'QUOTE',
  quotes: 'QUOTE',
  'purchase-order': 'PURCHASE_ORDER',
  purchaseorder: 'PURCHASE_ORDER',
  po: 'PURCHASE_ORDER',
  'supplier-bill': 'SUPPLIER_BILL',
  bill: 'SUPPLIER_BILL',
  'delivery-note': 'DELIVERY_NOTE',
  deliverynote: 'DELIVERY_NOTE',
  'credit-note': 'CREDIT_NOTE',
  creditnote: 'CREDIT_NOTE',
  'customer-statement': 'CUSTOMER_STATEMENT',
  statement: 'CUSTOMER_STATEMENT',
};

// -------------------------------------------------------------
// 1. GENERIC DOCUMENT ENDPOINT (JSON or PRINTABLE HTML)
// -------------------------------------------------------------
router.get('/:type/:id', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const rawType = req.params.type.toLowerCase().trim();
    const docType = TYPE_MAP[rawType];

    if (!docType) {
      throw new BadRequestError(
        `Invalid document type: '${req.params.type}'. Supported types: invoice, receipt, quote, purchase-order, supplier-bill, delivery-note, credit-note, customer-statement`
      );
    }

    const doc = await documentService.generateDocument(tenantId, docType, req.params.id, {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    const isHtmlRequested =
      req.query.format === 'html' ||
      (req.headers.accept && req.headers.accept.includes('text/html') && req.query.format !== 'json');

    if (isHtmlRequested) {
      const html = documentService.renderDocumentHtml(doc);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 2. CUSTOMER STATEMENT DIRECT ROUTE
// -------------------------------------------------------------
router.get('/customer-statement/:partyId', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const doc = await documentService.generateDocument(tenantId, 'CUSTOMER_STATEMENT', req.params.partyId, {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    const isHtmlRequested =
      req.query.format === 'html' ||
      (req.headers.accept && req.headers.accept.includes('text/html') && req.query.format !== 'json');

    if (isHtmlRequested) {
      const html = documentService.renderDocumentHtml(doc);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
});

export default router;
