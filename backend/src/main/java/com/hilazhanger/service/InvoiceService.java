package com.hilazhanger.service;

import com.hilazhanger.domain.entity.Order;
import com.hilazhanger.domain.entity.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    private final String storeName;
    private final String storeGstin;
    private final String storeAddress;

    public InvoiceService(
            @Value("${app.store.name:Hilaz Hanger}") String storeName,
            @Value("${app.store.gstin:}") String storeGstin,
            @Value("${app.store.address:Coimbatore, Tamil Nadu, India}") String storeAddress
    ) {
        this.storeName = storeName;
        this.storeGstin = storeGstin;
        this.storeAddress = storeAddress;
    }

    public byte[] generatePdf(Order order) {
        if (!order.isPaid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice available only for paid orders");
        }
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 48, 48);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font small = FontFactory.getFont(FontFactory.HELVETICA, 9);

            doc.add(new Paragraph(storeName, title));
            doc.add(new Paragraph(storeAddress, small));
            if (storeGstin != null && !storeGstin.isBlank()) {
                doc.add(new Paragraph("GSTIN: " + storeGstin, small));
            }
            doc.add(Chunk.NEWLINE);
            doc.add(new Paragraph("TAX INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            doc.add(new Paragraph("Invoice #: " + order.getOrderNumber(), normal));
            doc.add(new Paragraph("Date: " + DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")
                    .withZone(ZoneId.of("Asia/Kolkata"))
                    .format(order.getCreatedAt()), normal));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Bill To:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            doc.add(new Paragraph(order.getCustomerName(), normal));
            if (order.getCustomerEmail() != null) {
                doc.add(new Paragraph(order.getCustomerEmail(), small));
            }
            doc.add(new Paragraph(order.getCustomerPhone(), small));
            doc.add(new Paragraph(order.getShippingStreet() + ", " + order.getShippingCity()
                    + " — " + order.getShippingPincode(), small));
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 1f, 1.5f, 1f, 1.5f});
            addHeader(table, "Item");
            addHeader(table, "Qty");
            addHeader(table, "Rate");
            addHeader(table, "GST%");
            addHeader(table, "Amount");

            String rateStr = order.getTaxRate() != null ? order.getTaxRate().stripTrailingZeros().toPlainString() : "18";
            for (OrderItem item : order.getItems()) {
                addCell(table, item.getProductName() + " (" + item.getSize() + ")");
                addCell(table, String.valueOf(item.getQuantity()));
                addCell(table, "₹" + item.getUnitPrice());
                addCell(table, rateStr + "%");
                addCell(table, "₹" + item.getLineTotal());
            }
            doc.add(table);
            doc.add(Chunk.NEWLINE);

            doc.add(line("Subtotal", order.getSubtotal(), normal));
            if (order.getDiscount() != null && order.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
                doc.add(line("Discount", order.getDiscount().negate(), normal));
            }
            if (order.getTaxableAmount() != null) {
                doc.add(line("Taxable value", order.getTaxableAmount(), normal));
            }
            if (order.getCgstAmount() != null) {
                doc.add(line("CGST", order.getCgstAmount(), normal));
            }
            if (order.getSgstAmount() != null) {
                doc.add(line("SGST", order.getSgstAmount(), normal));
            } else if (order.getTaxAmount() != null) {
                doc.add(line("GST", order.getTaxAmount(), normal));
            }
            doc.add(line("Shipping", order.getShippingPrice(), normal));
            doc.add(line("Grand Total", order.getTotal(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));

            doc.add(Chunk.NEWLINE);
            doc.add(new Paragraph("This is a computer-generated invoice.", small));
            doc.close();
            return out.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate invoice");
        }
    }

    private Paragraph line(String label, BigDecimal amount, Font font) {
        return new Paragraph(label + ": ₹" + amount, font);
    }

    private void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9)));
        cell.setGrayFill(0.92f);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 9)));
        cell.setPadding(4);
        table.addCell(cell);
    }
}
