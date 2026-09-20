// Mirrors the labels already created in WhatsApp Business (Chats > Labels).
// `label` must match the existing WhatsApp label text exactly (incl. casing) so
// labelApplier.js finds and checks it instead of creating a duplicate.
export const CATEGORIES = [
  { id: 'supplier_pending_payment', label: '[Supplier] Pending payment', description: 'We owe a supplier a payment that is pending.' },
  { id: 'supplier_pending_quotation', label: '[Supplier] Pending Quotation', description: 'Waiting on a supplier to send a price quotation.' },
  { id: 'internal_reply', label: 'Internal reply', description: 'Internal team communication, not with a client or supplier.' },
  { id: 'follow_up', label: 'Follow up', description: 'General reminder to follow up, does not fit a more specific label.' },
  { id: 'client_need_reply', label: '[Client] Need reply', description: 'A client message that still needs a reply from us.' },
  { id: 'supplier_pending_design', label: '[Supplier] Pending design', description: 'Waiting on a supplier to deliver a design.' },
  { id: 'client_pending_reply', label: '[Client] Pending reply', description: 'Waiting on a client to reply to us.' },
  { id: 'client_pending_payment', label: '[Client] Pending payment', description: 'Waiting on a client to make a payment.' },
  { id: 'client_pending_design', label: '[Client] Pending Design', description: 'Waiting to deliver or finalize a design for a client.' },
  { id: 'client_pending_quotation', label: '[Client] Pending Quotation', description: 'Waiting to send, or waiting on approval of, a quotation for a client.' },
  { id: 'client_pending_invoice', label: '[Client] Pending invoice', description: 'Waiting to send or receive an invoice for a client.' },
  { id: 'supplier_need_reply', label: '[Supplier] Need reply', description: 'A supplier message that still needs a reply from us.' },
  { id: 'supplier_pending_reply', label: '[Supplier] Pending reply', description: 'Waiting on a supplier to reply to us.' },
  { id: 'client_pending_stock', label: '[Client] pending stock', description: 'Waiting on stock/inventory availability for a client order.' },
  { id: 'supplier_pending_stock', label: '[supplier] pending stock', description: 'Waiting on a supplier to confirm or send stock.' },
  { id: 'new_job', label: 'new job', description: 'A new job or project inquiry that has just come in.' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
