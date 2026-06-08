import { db, query } from "../db/database";
import mysql from "mysql2/promise";
import { Invoice, ParentProfile, PaymentMethod } from "../parentProfileBackend";

export class ProfileRepository {
  async createPaymentMethod(parentId: number, method: string, isActive: boolean): Promise<PaymentMethod> {
    const sql = "INSERT INTO payment_methods (parent_id, method, is_active) VALUES (?, ?, ?)";
    const [result] = await db.execute<mysql.ResultSetHeader>(sql, [parentId, method, isActive]);
    const rows = await query("SELECT * FROM payment_methods WHERE id = ?", [result.insertId]);
    return {
      id: rows[0].id,
      parentId: rows[0].parent_id,
      method: rows[0].method,
      isActive: rows[0].is_active,
      createdAt: rows[0].created_at.toISOString(),
    };
  }

  async retrievePaymentMethods(parentId: number): Promise<PaymentMethod[]> {
    const sql = "SELECT * FROM payment_methods WHERE parent_id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      method: r.method,
      isActive: r.is_active,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async retrieveInvoices(parentId: number): Promise<Invoice[]> {
    const sql = "SELECT * FROM invoices WHERE parent_id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      amount: r.amount,
      date: r.date.toLocaleString(),
    }));
  }

  async retrieveParentProfiles(parentId: number): Promise<ParentProfile[]> {
    const sql = "SELECT * FROM parents WHERE id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      name: r.name,
      child: r.child,
    }));
  }

  async updatePaymentMethods(updatedPaymentMethods: PaymentMethod[]): Promise<number[]> {
    const updatePromises = updatedPaymentMethods.map((paymentMethod) => {
      const sql = "UPDATE payment_methods SET parent_id = ?, method = ?, is_active = ? WHERE id = ?";
      return db.execute<mysql.ResultSetHeader>(sql, [
        paymentMethod.parentId,
        paymentMethod.method,
        paymentMethod.isActive,
        paymentMethod.id,
      ]);
    });
    const results = await Promise.all(updatePromises);
    return results.map(([result]) => result.affectedRows);
  }

  async deletePaymentMethod(methodId: number): Promise<boolean> {
    const sql = "DELETE FROM payment_methods WHERE id = ?";
    const [result] = await db.execute<mysql.ResultSetHeader>(sql, [methodId]);
    return result.affectedRows > 0;
  }

  async retrieveAuditLog(parentId: number): Promise<any[]> {
    const sql = "SELECT * FROM payment_method_audit_log WHERE parent_id = ? ORDER BY created_at DESC";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      paymentMethodId: r.payment_method_id,
      action: r.action,
      details: r.details,
      performedBy: r.performed_by,
      createdAt: r.created_at.toISOString(),
    }));
  }

  async createAuditLogEntry(
    parentId: number,
    paymentMethodId: number,
    action: string,
    details: string,
    performedBy: number,
  ): Promise<void> {
    const sql = "INSERT INTO payment_method_audit_log (parent_id, payment_method_id, action, details, performed_by) VALUES (?, ?, ?, ?, ?)";
    await db.execute(sql, [parentId, paymentMethodId, action, details, performedBy]);
  }
}
