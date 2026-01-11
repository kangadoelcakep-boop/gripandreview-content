
(function() {
    console.log("DFUX Engine V8.0: Loaded via CDN");
    function initDFUX() {
        const root = document.getElementById('dfux-review-widget');
        const storage = document.getElementById('dfux-data-storage');
        if (!root) return false;
        
        if (!storage || !storage.value) {
            console.warn("DFUX: Data not found in textarea.");
            // Fallback for old script tag
            const old = document.getElementById('dfux-data');
            if(old && old.textContent) {
                 return render(root, old.textContent);
            }
            return false;
        }
        return render(root, storage.value);
    }

    function render(root, jsonString) {
        let ids;
        try { ids = JSON.parse(jsonString); } catch (e) { 
            console.error(e); 
            root.innerHTML = "<div style='color:red;padding:10px;text-align:center;'>Data Error</div>"; 
            return true; 
        }

        const es = ids.editorial_summary;
        const trust = ids.trust_layer;
        const test = ids.test_coverage;
        
        // Colors & Icons
        const sc = (s) => s >= 4.5 ? 's-high' : (s >= 4.0 ? 's-med' : 's-low');
        const vm = {
            recommended: '<span style="color:#166534">✅ Direkomendasikan</span>',
            conditionally_recommended: '<span style="color:#854d0e">⚠️ Layak dengan Catatan</span>',
            not_recommended: '<span style="color:#991b1b">❌ Tidak Direkomendasikan</span>'
        };

        root.innerHTML = `
        <div id="dfux-scope">
          <section class="dfux-card">
            <header class="dfux-header">
              <div class="dfux-score-box ${sc(es.score_total)}">
                 <div class="score-val">${es.score_total.toFixed(1)}</div>
                 <div class="score-max">/5</div>
              </div>
              <div class="dfux-verdict-box">
                 <div class="verdict-label">Grip & Review Verdict</div>
                 <div class="verdict-badge">${vm[es.verdict_decision] || es.verdict_decision}</div>
                 <div class="confidence-level">Confidence: <strong>${es.confidence_level}</strong></div>
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
                  <ul>${es.cons.length ? es.cons.map(c => `<li>${c}</li>`).join("") : '<li class="muted">None</li>'}</ul>
                </div>
              </div>
              <div class="dfux-meta-grid">
                <div class="dfux-trust">
                  <h4>🔍 Sumber Data</h4>
                  <ul>${trust.sources.map(s => `<li>${s.type}</li>`).join("")}</ul>
                </div>
                <div class="dfux-test-info">
                  <h4>🧪 Cakupan Tes</h4>
                  <div>Depth: <strong>${test.test_depth}</strong></div>
                  <div>Affiliate: <strong>${trust.bias_indicator.affiliate ? 'Yes' : 'No'}</strong></div>
                </div>
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
