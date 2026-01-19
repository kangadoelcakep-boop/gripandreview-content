
(function() {
    console.log("DFUX Engine V9.7 (Stable): Active");

    // --- HELPER: DATA FINDER ---
    function findData() {
        let el = document.getElementById('dfux-data-storage');
        if (el && (el.value || el.textContent)) return el.value || el.textContent;
        const textareas = document.getElementsByTagName('textarea');
        for (let t of textareas) {
            if (t.value.includes('"ids_version"') || t.textContent.includes('"ids_version"')) {
                return t.value || t.textContent;
            }
        }
        el = document.getElementById('dfux-data');
        if (el) return el.textContent;
        return null;
    }

    // --- MAIN EXECUTOR ---
    function initDFUX() {
        const root = document.getElementById('dfux-review-widget');
        if (!root) return false;

        const rawData = findData();
        
        // --- 1. HANDLING NO DATA ---
        if (!rawData) {
            // Opsional: Tampilkan loading atau diam
            return false; 
        }

        // --- 2. DIAGNOSTIC RENDERER (FAILURE PATH) ---
        const renderError = (title, msg, detail, action) => {
            root.innerHTML = `
            <div id="dfux-scope">
                <div class="dfux-diagnostic">
                    <div class="dfux-diagnostic-title">⚡ ${title}</div>
                    <div>${msg}</div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #fca5a5;">
                        <div style="font-size:0.75rem; color:#be123c;"><strong>LOG:</strong> <code>${detail}</code></div>
                    </div>
                    ${action ? `<div style="margin-top:10px; font-size:0.8rem; font-weight:bold; color:#be123c;">👉 ${action}</div>` : ''}
                </div>
            </div>`;
            return true;
        };

        let ids;
        try {
            ids = JSON.parse(rawData);
        } catch (e) {
            // DETEKSI SCHEMA FAIL MURNI
            if (rawData.includes("SCHEMA_FAIL") || rawData.includes("Validation Error")) {
                return renderError(
                    "SCHEMA REJECTED — FAKTA VALID", 
                    "Konten valid, namun struktur JSON ditolak oleh Schema v1.4.", 
                    rawData.substring(0, 150) + "...",
                    "NEXT: Lakukan Fact Mapping pada Transkrip."
                );
            }
            return renderError("JSON SYNTAX ERROR", "Format data rusak.", e.message.substring(0, 50));
        }

        // --- 3. WIDGET RENDERER (SUCCESS PATH - RESTORED V9.1) ---
        // Jika data valid (punya struktur wajib), render widget visual
        if (!ids.editorial_summary || !ids.trust_layer) {
            return renderError("INCOMPLETE DATA", "Missing critical sections.", "editorial_summary / trust_layer missing");
        }

        const es = ids.editorial_summary;
        const trust = ids.trust_layer;
        const test = ids.test_coverage;
        const p = ids.primary_product;

        const sc = (s) => s >= 4.5 ? 's-high' : (s >= 4.0 ? 's-med' : 's-low');
        const vm = {
            recommended: '<span style="color:#166534">✅ Sangat Direkomendasikan</span>',
            conditionally_recommended: '<span style="color:#b45309">⚠️ Layak dengan Catatan</span>',
            not_recommended: '<span style="color:#991b1b">❌ Tidak Direkomendasikan</span>'
        };
        const biasLabel = trust.bias_indicator.affiliate ? '<span style="color:#b45309">Affiliate Link</span>' : '<span style="color:#166534">Independent</span>';

        // RENDER HTML LENGKAP
        root.innerHTML = `
        <div id="dfux-scope">
          <section class="dfux-card">
            <div class="dfux-lock">
                <span>🔒 Authority Engine v1.2</span>
                <span>IDS v${ids.ids_version || '1.4'} Verified</span>
            </div>
            <header class="dfux-header">
              <div class="dfux-score-box ${sc(es.score_total)}">
                 <div class="score-val">${es.score_total}</div>
                 <div class="score-max">/5</div>
              </div>
              <div class="dfux-verdict-box">
                 <div class="verdict-label">KEPUTUSAN EDITOR</div>
                 <div class="verdict-badge">${vm[es.verdict_decision] || es.verdict_decision}</div>
                 <div class="confidence-level">Confidence: <strong>${es.confidence_level.toUpperCase()}</strong></div>
              </div>
            </header>
            <div class="dfux-body">
              <div class="dfux-cols">
                <div class="col-pros">
                  <h4>👍 Kelebihan</h4>
                  <ul>${es.pros.map(p => `<li>${p}</li>`).join("")}</ul>
                </div>
                <div class="col-cons">
                  <h4>👎 Kekurangan</h4>
                  <ul>${es.cons.length ? es.cons.map(c => `<li>${c}</li>`).join("") : '<li class="muted">Tidak ada isu mayor.</li>'}</ul>
                </div>
              </div>
              <div class="dfux-meta-grid">
                <div class="dfux-trust">
                  <h4>🔍 Sumber Data</h4>
                  <ul>${trust.sources.map(s => `<li><span class="src-type">${s.type}</span> ${s.reference.substring(0,30)}...</li>`).join("")}</ul>
                    <div class="trust-badge" style="margin-top:10px">
                        Metode: <em>${trust.methodology_note || "Automated"}</em>
                    </div>
                </div>
                <div class="dfux-test-info">
                  <h4>🧪 Cakupan Tes</h4>
                  <div class="test-row"><span class="label">UJI:</span> <span class="value">${test.performed_tests.slice(0,3).join(", ") || "-"}</span></div>
                  <div class="test-row"><span class="label">DEPTH:</span> <span class="value"><strong>${test.test_depth}</strong></span></div>
                  <div class="trust-badge" style="margin-top:8px">Bias: ${biasLabel}</div>
                </div>
              </div>
            </div>
          </section>
        </div>`;
        
        console.log("✅ DFUX Widget Rendered");
        return true; 
    }

    const observer = new MutationObserver(() => {
        if (initDFUX()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    if (initDFUX()) return;
})();
