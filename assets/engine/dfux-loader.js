
(function() {
    console.log("DFUX Engine V9.0 (Hunter Mode): Active");

    // Fungsi Mencari Data JSON dimanapun ia bersembunyi
    function findData() {
        // Coba 1: Cari ID Textarea (Standar)
        let el = document.getElementById('dfux-data-storage');
        if (el && (el.value || el.textContent)) return el.value || el.textContent;

        // Coba 2: Cari Textarea apapun yang punya ciri-ciri IDS
        const textareas = document.getElementsByTagName('textarea');
        for (let t of textareas) {
            if (t.value.includes('"ids_version": "1.2"') || t.textContent.includes('"ids_version": "1.2"')) {
                return t.value || t.textContent;
            }
        }

        // Coba 3: Cari Script Tag lama (Fallback)
        el = document.getElementById('dfux-data');
        if (el) return el.textContent;

        return null;
    }

    function initDFUX() {
        const root = document.getElementById('dfux-review-widget');
        if (!root) return false;

        const rawData = findData();
        if (!rawData) {
            // Jangan spam console, tunggu dengan tenang
            return false;
        }

        let ids;
        try {
            ids = JSON.parse(rawData);
        } catch (e) {
            console.error("DFUX: Data found but corrupt", e);
            return true; // Stop trying
        }

        const es = ids.editorial_summary;
        const trust = ids.trust_layer;
        const test = ids.test_coverage;

        // Visual Logic
        const sc = (s) => s >= 4.5 ? 's-high' : (s >= 4.0 ? 's-med' : 's-low');
        const vm = {
            recommended: '<span style="color:#166534">✅ Sangat Direkomendasikan</span>',
            conditionally_recommended: '<span style="color:#b45309">⚠️ Layak dengan Catatan</span>',
            not_recommended: '<span style="color:#991b1b">❌ Tidak Direkomendasikan</span>'
        };
        const biasLabel = trust.bias_indicator.affiliate ? '<span style="color:#b45309">Affiliate</span>' : '<span style="color:#166534">Independent</span>';

        // Render Widget Keren
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
                </div>
                <div class="dfux-test-info">
                  <h4>🧪 Cakupan Tes</h4>
                  <div>Diuji: <strong>${test.performed_tests.slice(0,3).join(", ")}...</strong></div>
                  <div>Bias: <strong>${biasLabel}</strong></div>
                </div>
              </div>
            </div>
          </section>
        </div>`;
        
        return true; // Berhenti mengawasi, widget sudah jadi
    }

    // Jalankan Observer (Agar tahan terhadap lazy load CMS)
    const observer = new MutationObserver(() => {
        if (initDFUX()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Coba jalan langsung
    if (initDFUX()) return;
})();
