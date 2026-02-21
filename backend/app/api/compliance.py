"""
API routes for compliance scanning and violation retrieval.
"""
from typing import List, Literal, Optional
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Query
from app.core.violation_engine import (
    get_dataset_stats, load_violations, run_scan, DATA_FILE
)
from app.core.scheduler import get_scheduler_status
from app.core.rule_engine import get_rules
from app.models.violation import Violation

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])


@router.post("/scan", summary="Run a compliance scan on the IBM AML dataset")
def trigger_scan():
    """
    Runs all approved rules against the IBM AML transaction dataset.
    Returns a summary of violations found.
    """
    try:
        violations = run_scan()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {e}")

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    rule_counts: dict = {}

    for v in violations:
        severity_counts[v.severity] = severity_counts.get(v.severity, 0) + 1
        rule_counts[v.rule_id] = rule_counts.get(v.rule_id, 0) + 1

    return {
        "total_violations": len(violations),
        "severity_breakdown": severity_counts,
        "violations_by_rule": rule_counts,
        "message": f"Scan complete. {len(violations)} violation(s) detected and saved.",
    }


@router.get("/violations", summary="List all compliance violations")
def list_violations(
    status: Optional[Literal["open", "reviewed", "resolved", "false_positive"]] = None,
    severity: Optional[Literal["critical", "high", "medium", "low"]] = None,
    rule_id: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
):
    violations = load_violations()

    if status:
        violations = [v for v in violations if v.status == status]
    if severity:
        violations = [v for v in violations if v.severity == severity]
    if rule_id:
        violations = [v for v in violations if v.rule_id == rule_id]

    total = len(violations)
    paginated = violations[offset: offset + limit]

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "violations": [v.model_dump() for v in paginated],
    }


@router.get("/violations/{violation_id}", summary="Get a single violation by ID")
def get_violation(violation_id: str):
    violations = load_violations()
    match = next((v for v in violations if v.id == violation_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Violation not found")
    return match


@router.get("/summary", summary="Centralized compliance dashboard summary")
def compliance_summary():
    """
    Single source of truth for all dashboard metrics.
    Returns comprehensive scan results, statistics, and trend data.
    """
    violations = load_violations()
    stats = get_dataset_stats()
    rules = get_rules(approved_only=True)

    total_txns = stats.get("total_transactions", 0)
    
    # Violation status breakdown
    open_v = [v for v in violations if v.status == "open"]
    resolved_v = [v for v in violations if v.status == "resolved"]
    false_pos = [v for v in violations if v.status == "false_positive"]
    reviewed_v = [v for v in violations if v.status == "reviewed"]

    # Severity breakdown (only open violations)
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for v in open_v:
        severity_counts[v.severity] = severity_counts.get(v.severity, 0) + 1

    # Compliance rate calculation
    if total_txns > 0:
        compliance_rate = round((1 - len(open_v) / total_txns) * 100, 2)
    else:
        compliance_rate = None  # No data scanned yet

    # Most violated rules
    rule_violation_counts = defaultdict(int)
    for v in violations:
        rule_violation_counts[v.rule_id] += 1
    
    most_violated_rules = []
    for rule_id, count in sorted(rule_violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        rule = next((r for r in rules if r.id == rule_id), None)
        most_violated_rules.append({
            "rule_id": rule_id,
            "rule_name": rule.description if rule else rule_id,
            "violation_count": count
        })

    # Trend data (group violations by date)
    trend_data = []
    if violations:
        from datetime import datetime
        date_groups = defaultdict(lambda: {"violations": 0, "resolved": 0})
        
        for v in violations:
            try:
                date = datetime.fromisoformat(v.detected_at.replace('Z', '+00:00')).date().isoformat()
                date_groups[date]["violations"] += 1
                if v.status in ["resolved", "false_positive"]:
                    date_groups[date]["resolved"] += 1
            except:
                pass
        
        # Sort by date and calculate compliance rate for each day
        for date in sorted(date_groups.keys()):
            data = date_groups[date]
            day_compliance = round((1 - data["violations"] / max(total_txns, 1)) * 100, 2) if total_txns > 0 else 100
            trend_data.append({
                "date": date,
                "violations": data["violations"],
                "compliance_rate": day_compliance
            })

    # Last scan time
    last_scan_time = None
    if violations:
        try:
            last_scan_time = max(v.detected_at for v in violations)
        except:
            pass

    return {
        "total_transactions": total_txns,
        "total_scanned": total_txns,
        "total_violations": len(violations),
        "open_violations": len(open_v),
        "resolved_violations": len(resolved_v),
        "reviewed_violations": len(reviewed_v),
        "false_positives": len(false_pos),
        "compliance_rate": compliance_rate,
        "active_rules": len(rules),
        "severity_breakdown": severity_counts,
        "most_violated_rules": most_violated_rules,
        "trend_data": trend_data,
        "last_scan_time": last_scan_time,
        "dataset_connected": DATA_FILE.exists(),
        "dataset_laundering_rate": stats.get("laundering_percentage", 0),
    }


@router.get("/activity", summary="Recent compliance activity log")
def compliance_activity(limit: int = Query(default=10, ge=1, le=50)):
    """
    Returns recent compliance activity events (violations detected, reviews, etc.)
    Sorted by timestamp, most recent first.
    """
    violations = load_violations()
    
    activity_items = []
    
    # Add violation detection events
    for v in violations:
        activity_items.append({
            "type": "violation_detected",
            "severity": v.severity,
            "transaction_id": v.transaction_id,
            "rule_name": v.rule_name,
            "timestamp": v.detected_at,
            "status": v.status
        })
    
    # Add review events
    for v in violations:
        if v.reviewed_at:
            activity_items.append({
                "type": "violation_reviewed",
                "severity": v.severity,
                "transaction_id": v.transaction_id,
                "rule_name": v.rule_name,
                "timestamp": v.reviewed_at,
                "status": v.status,
                "comment": v.reviewer_comment
            })
    
    # Sort by timestamp descending
    activity_items.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "total": len(activity_items),
        "items": activity_items[:limit]
    }


@router.get("/scheduler", summary="Get periodic scan scheduler status")
def scheduler_status():
    return get_scheduler_status()
