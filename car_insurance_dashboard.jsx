import { useState } from "react";

const FIELDS = [
  { key: "age", label: "Age", type: "number", placeholder: "e.g. 35", group: "personal" },
  { key: "income", label: "Annual Income ($)", type: "number", placeholder: "e.g. 55000", group: "personal" },
  { key: "gender", label: "Gender", type: "select", options: ["M", "F"], group: "personal" },
  { key: "married", label: "Married", type: "select", options: ["Yes", "No"], group: "personal" },
  { key: "single_parent", label: "Single Parent", type: "select", options: ["Yes", "No"], group: "personal" },
  { key: "num_of_children", label: "Number of Children", type: "number", placeholder: "e.g. 2", group: "personal" },
  { key: "highest_education", label: "Education", type: "select", options: ["<High School", "High School", "Bachelors", "Masters", "PhD"], group: "personal" },
  { key: "occupation", label: "Occupation", type: "select", options: ["Blue Collar", "Clerical", "Doctor", "Home Maker", "Lawyer", "Manager", "Professional", "Student"], group: "personal" },
  { key: "value_of_home", label: "Home Value ($)", type: "number", placeholder: "e.g. 200000", group: "financial" },
  { key: "years_job_held_for", label: "Years at Current Job", type: "number", placeholder: "e.g. 5", group: "financial" },
  { key: "num_young_drivers", label: "Young Drivers in Household", type: "number", placeholder: "e.g. 0", group: "financial" },
  { key: "commute_dist", label: "Commute Distance (miles)", type: "number", placeholder: "e.g. 15", group: "vehicle" },
  { key: "type_of_use", label: "Vehicle Use", type: "select", options: ["Commercial", "Private"], group: "vehicle" },
  { key: "vehicle_value", label: "Vehicle Value ($)", type: "number", placeholder: "e.g. 15000", group: "vehicle" },
  { key: "vehicle_type", label: "Vehicle Type", type: "select", options: ["Minivan", "Panel Truck", "Pickup", "Sports Car", "SUV", "Van"], group: "vehicle" },
  { key: "vehicle_age", label: "Vehicle Age (years)", type: "number", placeholder: "e.g. 4", group: "vehicle" },
  { key: "address_type", label: "Address Type", type: "select", options: ["Highly Urban/ Urban", "z_Highly Rural/ Rural"], group: "vehicle" },
  { key: "policy_tenure", label: "Policy Tenure (years)", type: "number", placeholder: "e.g. 3", group: "history" },
  { key: "5_year_num_of_claims", label: "Claims in Last 5 Years", type: "number", placeholder: "e.g. 1", group: "history" },
  { key: "5_year_total_claims_value", label: "Total Claims Value (5yr) ($)", type: "number", placeholder: "e.g. 2000", group: "history" },
  { key: "licence_revoked", label: "License Ever Revoked", type: "select", options: ["Yes", "No"], group: "history" },
  { key: "license_points", label: "License Points", type: "number", placeholder: "e.g. 2", group: "history" },
];

const GROUPS = [
  { id: "personal", label: "Personal Info", icon: "👤" },
  { id: "financial", label: "Financial", icon: "💰" },
  { id: "vehicle", label: "Vehicle", icon: "🚗" },
  { id: "history", label: "Claims History", icon: "📋" },
];

const RISK_CONFIG = {
  low: { color: "#22c55e", bg: "#052e16", label: "LOW RISK", bar: 25 },
  medium: { color: "#f59e0b", bg: "#1c1400", label: "MEDIUM RISK", bar: 60 },
  high: { color: "#ef4444", bg: "#1f0000", label: "HIGH RISK", bar: 90 },
};

export default function App() {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState("personal");
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const prompt = `You are a car insurance risk analyst AI. Given the following customer data, predict:
1. Whether the customer is likely to make a claim (YES or NO)
2. The probability of a claim (0–100%)
3. If a claim is likely, estimate the probable claim value in USD
4. Risk level: LOW, MEDIUM, or HIGH
5. Top 3 risk factors for this customer
6. A brief 2-sentence recommendation for the insurer

Customer data:
${JSON.stringify(formData, null, 2)}

Respond ONLY with a JSON object, no markdown or backticks, in this exact format:
{
  "claim_likely": "YES" or "NO",
  "claim_probability": <number 0-100>,
  "estimated_claim_value": <number or null if no claim likely>,
  "risk_level": "LOW" or "MEDIUM" or "HIGH",
  "risk_factors": ["factor1", "factor2", "factor3"],
  "recommendation": "Two sentence recommendation here."
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Analysis failed. Please check your inputs and try again.");
    }
    setLoading(false);
  };

  const groupFields = (gid) => FIELDS.filter((f) => f.group === gid);
  const filledCount = Object.keys(formData).filter((k) => formData[k] !== "" && formData[k] !== undefined).length;
  const progress = Math.round((filledCount / FIELDS.length) * 100);
  const risk = result ? RISK_CONFIG[result.risk_level.toLowerCase()] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        background: "linear-gradient(135deg, #0f172a 0%, #0a0a0f 100%)",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>🛡️</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: "#f1f5f9" }}>
              INSURISK ANALYTICS
            </div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>CAR INSURANCE RISK ASSESSMENT SYSTEM</div>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "#111827", border: "1px solid #1e293b",
          borderRadius: "8px", padding: "8px 16px",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>AI MODEL ONLINE</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 0, minHeight: "calc(100vh - 93px)" }}>
        {/* Left: Form */}
        <div style={{ padding: "32px", borderRight: "1px solid #1e293b", overflowY: "auto" }}>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, color: "#64748b", letterSpacing: 1 }}>
              <span>FORM COMPLETION</span>
              <span style={{ color: "#94a3b8" }}>{filledCount} / {FIELDS.length} FIELDS</span>
            </div>
            <div style={{ height: 3, background: "#1e293b", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${progress}%`,
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Group Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
            {GROUPS.map((g) => {
              const filled = groupFields(g.id).filter((f) => formData[f.key] !== undefined && formData[f.key] !== "").length;
              const total = groupFields(g.id).length;
              const active = activeGroup === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: active ? "1px solid #3b82f6" : "1px solid #1e293b",
                    background: active ? "#172554" : "#111827",
                    color: active ? "#93c5fd" : "#64748b",
                    cursor: "pointer",
                    fontSize: 12,
                    letterSpacing: 1,
                    display: "flex", alignItems: "center", gap: "8px",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                  <span style={{
                    background: filled === total ? "#15803d" : "#1e293b",
                    color: filled === total ? "#4ade80" : "#475569",
                    padding: "1px 6px", borderRadius: "4px", fontSize: 10,
                  }}>{filled}/{total}</span>
                </button>
              );
            })}
          </div>

          {/* Fields Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {groupFields(activeGroup).map((field) => (
              <div key={field.key} style={{
                background: "#0f172a",
                border: `1px solid ${formData[field.key] ? "#1e3a5f" : "#1e293b"}`,
                borderRadius: "8px",
                padding: "14px 16px",
                transition: "border-color 0.2s",
              }}>
                <label style={{ display: "block", fontSize: 10, color: "#64748b", letterSpacing: 1.5, marginBottom: "8px", textTransform: "uppercase" }}>
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      color: formData[field.key] ? "#e2e8f0" : "#475569",
                      fontSize: 13, outline: "none", cursor: "pointer",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    <option value="">— select —</option>
                    {field.options.map((o) => <option key={o} value={o} style={{ background: "#0f172a" }}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      color: "#e2e8f0", fontSize: 13, outline: "none",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || filledCount < 5}
            style={{
              marginTop: "28px",
              width: "100%",
              padding: "16px",
              background: loading ? "#1e293b" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: 14,
              letterSpacing: 2,
              fontFamily: "'Bebas Neue', sans-serif",
              cursor: loading || filledCount < 5 ? "not-allowed" : "pointer",
              opacity: filledCount < 5 ? 0.5 : 1,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                ANALYZING RISK PROFILE...
              </>
            ) : (
              <>⚡ RUN RISK ANALYSIS</>
            )}
          </button>
          {filledCount < 5 && (
            <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginTop: 8 }}>
              Fill in at least 5 fields to run analysis
            </p>
          )}
        </div>

        {/* Right: Results Panel */}
        <div style={{ background: "#080810", padding: "32px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 24 }}>ANALYSIS RESULTS</div>

          {!result && !loading && !error && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "60%", gap: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 48 }}>📊</div>
              <div style={{ color: "#334155", fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
                Fill in customer details and click <strong style={{ color: "#475569" }}>Run Risk Analysis</strong> to see predictions
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "#1f0000", border: "1px solid #7f1d1d",
              borderRadius: 8, padding: 16, color: "#fca5a5", fontSize: 12,
            }}>{error}</div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["PROCESSING CUSTOMER PROFILE", "EVALUATING RISK FACTORS", "COMPUTING PREDICTIONS"].map((t, i) => (
                <div key={i} style={{
                  background: "#0f172a", border: "1px solid #1e293b",
                  borderRadius: 8, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  animation: `fadeIn 0.3s ease ${i * 0.15}s both`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          )}

          {result && risk && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Risk Badge */}
              <div style={{
                background: risk.bg,
                border: `1px solid ${risk.color}33`,
                borderRadius: 10,
                padding: "20px",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: risk.color, letterSpacing: 4 }}>
                  {risk.label}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginTop: 4 }}>OVERALL ASSESSMENT</div>
              </div>

              {/* Claim Probability */}
              <div style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 8, padding: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5 }}>CLAIM PROBABILITY</span>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
                    color: risk.color, letterSpacing: 2,
                  }}>{result.claim_probability}%</span>
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3 }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${result.claim_probability}%`,
                    background: `linear-gradient(90deg, ${risk.color}88, ${risk.color})`,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>

              {/* Claim Decision */}
              <div style={{
                background: result.claim_likely === "YES" ? "#1f0000" : "#052e16",
                border: `1px solid ${result.claim_likely === "YES" ? "#ef444433" : "#22c55e33"}`,
                borderRadius: 8, padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5 }}>CLAIM PREDICTED</span>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2,
                  color: result.claim_likely === "YES" ? "#ef4444" : "#22c55e",
                }}>{result.claim_likely}</span>
              </div>

              {/* Estimated Value */}
              {result.estimated_claim_value && (
                <div style={{
                  background: "#0f172a", border: "1px solid #1e293b",
                  borderRadius: 8, padding: "14px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5 }}>EST. CLAIM VALUE</span>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: "#f59e0b",
                  }}>${result.estimated_claim_value.toLocaleString()}</span>
                </div>
              )}

              {/* Risk Factors */}
              <div style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 8, padding: "16px",
              }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5, marginBottom: 12 }}>TOP RISK FACTORS</div>
                {result.risk_factors.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    marginBottom: i < result.risk_factors.length - 1 ? 10 : 0,
                  }}>
                    <span style={{
                      background: "#1e293b", color: "#94a3b8",
                      width: 20, height: 20, borderRadius: 4,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, flexShrink: 0, fontFamily: "'Bebas Neue', sans-serif",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div style={{
                background: "#0c1220",
                border: "1px solid #1e3a5f",
                borderRadius: 8, padding: "16px",
              }}>
                <div style={{ fontSize: 10, color: "#3b82f6", letterSpacing: 1.5, marginBottom: 10 }}>💡 INSURER RECOMMENDATION</div>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                  {result.recommendation}
                </p>
              </div>

              {/* Re-analyze */}
              <button
                onClick={() => setResult(null)}
                style={{
                  padding: "10px", background: "transparent",
                  border: "1px solid #1e293b", borderRadius: 8,
                  color: "#475569", fontSize: 11, letterSpacing: 1.5,
                  cursor: "pointer", fontFamily: "'DM Mono', monospace",
                }}
              >
                ↺ CLEAR RESULTS
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        select option { background: #0f172a; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>
    </div>
  );
}
