import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from risk_service import load_borrowers_csv, assess_credit_risk, AssessRiskRequest

borrowers = load_borrowers_csv()
print(f"Total borrowers in CSV: {len(borrowers)}")
for b in borrowers[:10]:
    fid = b.get("farmer_id")
    res = assess_credit_risk(AssessRiskRequest(farmer_id=fid))
    risk = res["risk_assessment"]
    district = b.get("district")
    crop = b.get("crop_type")
    score = risk["climate_credit_score"]
    overall = risk["overall_risk_classification"]
    pd_val = risk["estimated_default_probability_pct"]
    print(f"Farmer: {fid:7s} | District: {district:12s} | Crop: {crop:10s} | Score: {score} | Risk: {overall:8s} | PD: {pd_val}%")
