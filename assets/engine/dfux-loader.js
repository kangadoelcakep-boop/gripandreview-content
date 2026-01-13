
(function() {
    console.log("DFUX Engine V9.1 (Diagnostic Mode): Active");

    function findData() {
        // Coba 1: Textarea ID Khusus
        let el = document.getElementById('dfux-data-storage');
        if (el && (el.value || el.textContent)) return el.value || el.textContent;

        // Coba 2: Scan semua Textarea untuk signature IDS
        const textareas = document.getElementsByTagName('textarea');
        for (let t of textareas) {
            if (t.value.includes('"ids_version"') || t.textContent.includes('"ids_version"')) {
                return t.value || t.textContent;
            }
        }
        
        // Coba 3: Script Tag (Fallback)
        el = document.getElementById('dfux-data');
        if (el) return el.textContent;

        return null;
    }

    function initDFUX() {
        const root = document.getElementById('dfux-review-widget');
        if (!root) return false;

        const rawData = findData();
        
        // JIKA DATA TIDAK DITEMUKAN, TETAP DIAM (MUNGKIN LOADING)
        if (!rawData) return false;

        // FUNGSI RENDER ERROR (DIAGNOSTIC BANNER)
        const renderError = (msg, detail) => {
            root.innerHTML = `
            <div id="dfux-scope">
                <div class="dfux-diagnostic">
                    <div class="dfux-diagnostic-title">⚡ DFUX SYSTEM ALERT</div>
                    <div><strong>STATUS:</strong> DATA CORRUPT / INVALID</div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #fca5a5;">
                        <div><strong>ERROR:</strong> ${msg}</div>
                        <div style="margin-top:5px; font-size:0.75rem; color:#be123c;"><strong>DETAIL:</strong> <code>${detail}</code></div>
                    </div>
                    <div style="margin-top:15px; font-size:0.7rem; color:#881337; font-style:italic;">
                        *Widget tidak ditampilkan ke pengunjung untuk menjaga UX. Segera perbaiki JSON di CMS.
                    </div>
                </div>
            </div>`;
            console.error("DFUX FATAL:", msg, detail);
            return true;
        };

        let ids;
        try {
            ids = JSON.parse(rawData);
        } catch (e) {
            // JIKA JSON RUSAK, TAMPILKAN BANNER
            return renderError("JSON Syntax Error", e.message.substring(0, 100));
        }

        // JIKA STRUKTUR TIDAK LENGKAP
        if (!ids.editorial_summary || !ids.trust_layer) {
            return renderError("Incomplete Data Structure", "Missing editorial_summary or trust_layer");
        }

        const es = ids.editorial_summary;
        const trust = ids.trust_layer;
        const test = ids.test_coverage;

        // --- RENDER NORMAL ---
        const sc = (s) => s >= 4.5 ? 's-high' : (s >= 4.0 ? 's-med' : 's-low');
        const vm = {
            recommended: '<span style="color:#166534">✅ Sangat Direkomendasikan</span>',
            conditionally_recommended: '<span style="color:#b45309">⚠️ Layak dengan Catatan</span>',
            not_recommended: '<span style="color:#991b1b">❌ Tidak Direkomendasikan</span>'
        };
        const biasLabel = trust.bias_indicator.affiliate ? '<span style="color:#b45309">Affiliate Link</span>' : '<span style="color:#166534">Independent</span>';

        root.innerHTML = `
        <div id="dfux-scope">
          <section class="dfux-card">
            <div class="dfux-lock">
                <span>🔒 Authority Engine v1.2</span>
                <span>IDS Verified</span>
            </div>
            <header class="dfux-header">
              <div class="dfux-score-box ${sc(es.score_total)}">
                 <div class="score-val">${es.score_total.toFixed(1)}</div>
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
                  <ul>${trust.sources.map(s => `<li><span class="src-type">${s.type}</span> ${s.reference.substring(0,40)}...</li>`).join("")}</ul>
                    <div class="trust-badge">
                        Metode: <em>${trust.methodology_note || "Tidak dijelaskan"}</em>
                    </div>

                    <div class="trust-badge">
                        Konflik Reviewer: <strong>${trust.bias_indicator.reviewer_conflict || "none"}</strong>
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
        
        return true; 
    }

    const observer = new MutationObserver(() => {
        if (initDFUX()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    if (initDFUX()) return;
})();
