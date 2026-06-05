"""
Data Cleanup Script: Fix prediction_histories consistency.

1. Delete pre-fix records (IDs 1-11) — produced during feature mismatch bug
2. Update risk_level on all remaining records to match prediction_result:
   - Positive -> "High Risk"
   - Negative -> "Low Risk"
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database.db import engine
import sqlalchemy as sa

PRE_FIX_IDS = list(range(1, 12))

print("Connecting to database...")
conn = engine.connect()
print("Connected.")

# Step 1: Show pre-fix records
pre_fix = conn.execute(
    sa.text("SELECT id, prediction_result, risk_level, probability, created_at FROM prediction_histories WHERE id = ANY(:ids) ORDER BY id"),
    {"ids": PRE_FIX_IDS}
).fetchall()

print(f"\n=== PRE-FIX RECORDS TO DELETE ({len(pre_fix)}) ===")
print(f"{'ID':>4} {'prediction_result':<20} {'risk_level':<15} {'probability':>8} {'created_at'}")
print("-" * 70)
for r in pre_fix:
    prob = f"{float(r.probability):.4f}" if r.probability is not None else "NULL"
    print(f"{r.id:>4} {str(r.prediction_result):<20} {str(r.risk_level):<15} {prob:>8} {r.created_at}")

# Step 2: Show inconsistent post-fix records
post_fix_inconsistent = conn.execute(
    sa.text("""
        SELECT id, prediction_result, risk_level, probability, created_at
        FROM prediction_histories
        WHERE id != ALL(:ids)
          AND NOT (
            (prediction_result = 'Positive' AND risk_level = 'High Risk')
            OR
            (prediction_result = 'Negative' AND risk_level = 'Low Risk')
          )
        ORDER BY id
    """),
    {"ids": PRE_FIX_IDS}
).fetchall()

print(f"\n=== POST-FIX RECORDS WITH INCONSISTENT risk_level ({len(post_fix_inconsistent)}) ===")
print(f"{'ID':>4} {'prediction_result':<20} {'risk_level':<15} {'probability':>8} {'new_risk_level':<15}")
print("-" * 85)
for r in post_fix_inconsistent:
    prob = f"{float(r.probability):.4f}" if r.probability is not None else "NULL"
    new_risk = "High Risk" if str(r.prediction_result).strip() == "Positive" else "Low Risk"
    print(f"{r.id:>4} {str(r.prediction_result):<20} {str(r.risk_level):<15} {prob:>8} {new_risk:<15}")

# Step 3: Show consistent records
consistent = conn.execute(
    sa.text("""
        SELECT COUNT(*) FROM prediction_histories
        WHERE id != ALL(:ids)
          AND (
            (prediction_result = 'Positive' AND risk_level = 'High Risk')
            OR
            (prediction_result = 'Negative' AND risk_level = 'Low Risk')
          )
    """),
    {"ids": PRE_FIX_IDS}
).scalar()
print(f"\nAlready consistent (no change): {consistent}")

total = conn.execute(sa.text("SELECT COUNT(*) FROM prediction_histories")).scalar()
print(f"Total records before: {total}")
print(f"Estimated after: {total - len(pre_fix)}")

# Execute cleanup
print("\nExecuting DELETE...")
conn.execute(
    sa.text("DELETE FROM prediction_histories WHERE id = ANY(:ids)"),
    {"ids": PRE_FIX_IDS}
)
print(f"Deleted {len(pre_fix)} pre-fix records")

if post_fix_inconsistent:
    print("Executing UPDATE...")
    for r in post_fix_inconsistent:
        new_risk = "High Risk" if str(r.prediction_result).strip() == "Positive" else "Low Risk"
        conn.execute(
            sa.text("UPDATE prediction_histories SET risk_level = :new_risk WHERE id = :rid"),
            {"new_risk": new_risk, "rid": r.id}
        )
    print(f"Updated {len(post_fix_inconsistent)} records")

conn.commit()
print("Transaction committed.")

remaining = engine.connect().execute(sa.text("SELECT COUNT(*) FROM prediction_histories")).scalar()
still_inconsistent = engine.connect().execute(
    sa.text("""
        SELECT COUNT(*) FROM prediction_histories
        WHERE NOT (
            (prediction_result = 'Positive' AND risk_level = 'High Risk')
            OR
            (prediction_result = 'Negative' AND risk_level = 'Low Risk')
        )
    """)
).scalar()

print(f"\n=== RESULTS ===")
print(f"Remaining records: {remaining}")
print(f"Still inconsistent: {still_inconsistent}")
print("Cleanup complete.")
