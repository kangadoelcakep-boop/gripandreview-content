
(function() {
    console.log("DFUX Engine V9.8 (Stable + Fact Map): Active");

    // --- KNOWLEDGE BASE: MAPPING GUIDE (Static) ---
    const MAPPING_GUIDE = [
        { bad: "torque_max", good: "technical_specs.torque.max_nm", note: "Object nesting required" },
        { bad: "rpm / speed_no_load", good: "technical_specs.rpm.no_load", note: "No root keys" },
        { bad: "chuck_size_mm", good: "technical_specs.motor.chuck_size", note: "Canonical keys only" },
        { bad: "voltage", good: "technical_specs.power.voltage_v", note: "-" },
        { bad: "battery_count", good: "power_system.battery.count", note: "-" },
        { bad: "anti_kickback", good: "features.safety.anti_kickback", note: "-" }
    ];

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

    // --- RENDERER 1: FACT MAPPING UI (WARNING PATH) ---
    function renderFactMappingUI(root, rawData, errorMsg) {
        const rows = MAPPING_GUIDE.map(m => `
            <tr>
                <td><code>${m.bad}</code></td>
                <td>➜</td>
                <td><code>${m.good}</code></td>
            </tr>
        `).join('');

        root.innerHTML = `
        <div id="dfux-scope">
            <div class="dfux-diagnostic warning">
                <div class="title">⚠️ SCHEMA REJECTED — FACT MAPPING REQUIRED</div>
                
                <div style="margin-bottom: 1rem;">
                    <strong>Analisa Sistem:</strong> Data valid ditemukan (Fact-Rich), namun struktur JSON ditolak oleh Schema v1.4.
                    <br>Jangan ubah transkrip! Lakukan penataan ulang (Mapping) pada data JSON.
                </div>

                <div style="background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 1rem;">
                    <strong style="color: #b45309; font-size: 0.8rem; text-transform: uppercase;">Panduan Mapping Kanonik</strong>
                    <table class="mapping-table">
                        <thead><tr><th>Salah (Root/Raw)</th><th></th><th>Benar (Schema v1.4)</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>

                <div style="border-top: 1px dashed #fcd34d; padding-top: 10px;">
                    <div style="font-size:0.75rem; margin-bottom: 4px; font-weight:bold;">RAW ERROR LOG:</div>
                    <code class="block" style="color: #92400e; font-size: 0.75rem;">${errorMsg}</code>
                </div>

                <div style="border-top: 1px dashed #fcd34d; padding-top: 10px; margin-top: 10px;">
                    <div style="font-size:0.75rem; margin-bottom: 4px; font-weight:bold;">RAW DATA (COPY FOR MAPPING):</div>
                    <textarea style="width:100%; height:100px; font-size:0.75rem; border:1px solid #fcd34d; border-radius:4px; padding:5px; font-family:monospace;">${rawData}</textarea>
                </div>

                <div style="margin-top:15px; padding: 10px; background: #fffbeb; border-left: 4px solid #f59e0b; font-size: 0.85rem; color: #b45309;">
                    <strong>👉 NEXT ACTION:</strong> Copy Raw Data -> Perbaiki key sesuai tabel -> Submit Ulang.
                </div>
            </div>
        </div>`;
    }

    // --- RENDERER 2: FATAL ERROR ---
    function renderFatalError(root, title, msg, detail) {
        root.innerHTML = `
        <div id="dfux-scope">
            <div class="dfux-diagnostic fatal">
                <div class="title">⚡ ${title}</div>
                <div>${msg}</div>
                <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #fca5a5;">
                    <div style="font-size:0.75rem; color:#be123c;"><strong>LOG:</strong> <code class="block">${detail}</code></div>
                </div>
            </div>
        </div>`;
    }

    // --- RENDERER 3: VISUAL WIDGET (SUCCESS PATH - RESTORED) ---
    function renderWidget(root, ids) {
        const p = ids.primary_product || {};
        const es = ids.editorial_summary || {};
        const specs = ids.technical_specs || {};
        const trust = ids.trust_layer || {};
        const test = ids.test_coverage || {};

        // Verdict Logic
        let badgeClass = 'badge-yellow';
        let badgeText = '⚠️ Layak dengan Catatan';
        if (es.verdict_decision === 'recommended') {
            badgeClass = 'badge-green';
            badgeText = '✅ Sangat Direkomendasikan';
        } else if (es.verdict_decision === 'not_recommended') {
            badgeClass = 'badge-red';
            badgeText = '❌ Tidak Direkomendasikan';
        }

        // Lists
        const prosHtml = (es.pros || []).map(i => `<li>${i}</li>`).join('');
        const consHtml = (es.cons || []).map(i => `<li>${i}</li>`).join('');

        // Spec Extraction (Flattening nested specs for display)
        let specRows = '';
        const coreSpecs = { ...specs.motor, ...specs.battery, ...specs.torque, ...specs.rpm };
        Object.entries(coreSpecs).slice(0, 5).forEach(([key, val]) => {
            let displayVal = val;
            if (typeof val === 'object' && val !== null) {
                displayVal = (val.value || '') + ' ' + (val.unit || '');
            }
            specRows += `<tr><td class="spec-label">${key.replace(/_/g, ' ')}</td><td class="spec-val">${displayVal}</td></tr>`;
        });

        // Bias Label
        const biasLabel = trust.bias_indicator?.sponsored ? 'Sponsored' : 'Independent';

        root.innerHTML = `
        <div id="dfux-scope">
            <section class="dfux-card">
                <div class="dfux-lock">
                    <span>🔒 Authority Engine v1.2</span>
                    <span>IDS v${ids.ids_version || '1.4'} Verified</span>
                </div>
                <div class="dfux-header">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <div>
                            <div style="font-size:0.8rem; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">${p.brand || 'Review'}</div>
                            <h2 style="margin:0; font-size:1.5rem; color:#0f172a;">${p.name || 'Product Name'}</h2>
                        </div>
                        <span class="dfux-badge ${badgeClass}">${badgeText}</span>
                    </div>
                </div>

                <div class="dfux-grid">
                    <div>
                        <div class="score-box">
                            <div class="score-val">${es.score_total || 0}<span style="font-size:1.5rem; color:#94a3b8">/5</span></div>
                            <div class="verdict-line">"${es.verdict_line || '...'}"</div>
                        </div>
                        <div style="margin-top:2rem;">
                            <h4 style="margin-bottom:0.5rem;">Technical Specs</h4>
                            <table class="spec-table">
                                ${specRows || '<tr><td colspan="2" style="text-align:center; color:#cbd5e1;">Data spesifikasi minimal</td></tr>'}
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <div style="margin-bottom:1.5rem;">
                            <h4 style="color:#166534; margin-bottom:0.5rem;">PROS</h4>
                            <ul class="pro-con-list pros">${prosHtml}</ul>
                        </div>
                        <div>
                            <h4 style="color:#991b1b; margin-bottom:0.5rem;">CONS</h4>
                            <ul class="pro-con-list cons">${consHtml}</ul>
                        </div>
                    </div>
                </div>

                <div class="trust-footer">
                    <div>IDS v${ids.ids_version || '1.4'} • ${trust.review_freshness?.relevance_status || 'Current'}</div>
                    <div style="display:flex; gap:10px; align-items:center;">
                         <span>🛡️ Trust Verified</span>
                         <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:0.7rem;">${biasLabel}</span>
                    </div>
                </div>
            </section>
        </div>`;
    }

    // --- MAIN INITIALIZER ---
    function initDFUX() {
        const root = document.getElementById('dfux-review-widget');
        if (!root) return false;

        const rawData = findData();
        if (!rawData) return false; // Silent if no data

        let ids;
        try {
            ids = JSON.parse(rawData);
        } catch (e) {
            // ROUTING ERROR: SCHEMA FAIL vs SYNTAX FAIL
            if (rawData.includes("SCHEMA_FAIL") || rawData.includes("Validation Error") || rawData.includes("Additional properties")) {
                const errorDetail = rawData.length > 300 ? rawData.substring(0, 300) + "..." : rawData;
                renderFactMappingUI(root, rawData, errorDetail);
                return true;
            }
            renderFatalError(root, "JSON SYNTAX ERROR", "Format data rusak.", e.message);
            return true;
        }

        // ROUTING SUCCESS: CHECK INTEGRITY
        if (!ids.editorial_summary || !ids.trust_layer) {
            renderFatalError(root, "INCOMPLETE DATA", "Missing critical sections.", "editorial_summary / trust_layer missing");
            return true;
        }

        // RENDER SUCCESS WIDGET
        renderWidget(root, ids);
        return true; 
    }

    const observer = new MutationObserver(() => {
        if (initDFUX()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    if (initDFUX()) return;
})();
