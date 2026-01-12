
(function() {
    console.log("DFUX Engine v1.2 (Trust-Aware): Loaded");

    function initDFUX() {
        const root = document.getElementById('dfux-review-widget');
        const storage = document.getElementById('dfux-data-storage');
        
        if (!root) return false;
        
        if (!storage || !storage.value) {
            // Fallback check
            const old = document.getElementById('dfux-data');
            if(old && old.textContent) return render(root, old.textContent);
            return false; 
        }
        return render(root, storage.value);
    }

    function render(root, jsonString) {
        let ids;
        try { ids = JSON.parse(jsonString); } catch (e) { return true; }

        const es = ids.editorial_summary;
        const trust = ids.trust_layer;
        const test = ids.test_coverage;
        
        // Colors & Mappings
        const sc = (s) => s >= 4.5 ? 's-high' : (s >= 4.0 ? 's-med' : 's-low');
        const vm = {
            recommended: '<span style="color:#166534">✅ Sangat Direkomendasikan</span>',
            conditionally_recommended: '<span style="color:#b45309">⚠️ Layak dengan Catatan</span>',
            not_recommended: '<span style="color:#991b1b">❌ Tidak Direkomendasikan</span>'
        };
        
        // Logic Trust
        const biasLabel = trust.bias_indicator.affiliate ? 
            '<span style="color:#b45309">Affiliate Link</span>' : 
            '<span style="color:#166534">Independent</span>';

        root.innerHTML = `
        <div id="dfux-scope">
          <section class="dfux-card">
            
            <div class="dfux-lock">
                <span>🔒 DFUX Authority Engine v1.2</span>
                <span>IDS Verified</span>
            </div>

            <header class="dfux-header">
              <div class="dfux-score-box ${sc(es.score_total)}">
                 <div class="score-val">${es.score_total.toFixed(1)}</div>
                 <div class="score-max">SKOR DARI 5</div>
              </div>
              <div class="dfux-verdict-box">
                 <div class="verdict-label">KEPUTUSAN EDITOR</div>
                 <div class="verdict-badge">${vm[es.verdict_decision] || es.verdict_decision}</div>
                 <div class="confidence-level">Kepercayaan Data: <strong>${es.confidence_level.toUpperCase()}</strong></div>
              </div>
            </header>

            <div class="dfux-body">
              <div class="dfux-cols">
                <div class="col-pros">
                  <h4>👍 Kelebihan Utama</h4>
                  <ul>${es.pros.map(p => `<li>${p}</li>`).join("")}</ul>
                </div>
                <div class="col-cons">
                  <h4>👎 Kekurangan / Isu</h4>
                  <ul>
                    ${es.cons.length ? es.cons.map(c => `<li>${c}</li>`).join("") : '<li class="muted">Tidak ada isu mayor.</li>'}
                  </ul>
                </div>
              </div>
            </div>

            <div class="dfux-meta-grid">
                <div class="dfux-test-info">
                  <h4>🧪 Cakupan Pengujian</h4>
                  <div class="test-row">
                    <div class="label">DIUJI:</div>
                    <div class="value">${test.performed_tests.slice(0,4).join(", ")}${test.performed_tests.length > 4 ? ', dll' : ''}</div>
                  </div>
                  <div class="test-row">
                    <div class="label">LEWAT:</div>
                    <div class="value not-tested">${test.not_tested.length ? test.not_tested.join(", ") : "Semua Sektor Diuji"}</div>
                  </div>
                  <div class="test-row" style="margin-top:10px">
                    <div class="label">DEPTH:</div>
                    <div class="value"><strong>${test.test_depth.toUpperCase().replace("_", " ")}</strong></div>
                  </div>
                </div>

                <div class="dfux-trust">
                  <h4>🔍 Sumber & Transparansi</h4>
                  <div class="trust-badge">Status Bias: <strong>${biasLabel}</strong></div>
                  <ul>${trust.sources.map(s => `<li><span class="src-type">${s.type}</span> ${s.reference.substring(0, 40)}${s.reference.length>40?'...':''}</li>`).join("")}</ul>
                </div>
            </div>

          </section>
        </div>`;
        return true;
    }

    const observer = new MutationObserver(() => { if (initDFUX()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    if (initDFUX()) return;
})();
