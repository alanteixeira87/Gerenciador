const DB = {
    marcas: ["ABC","Accreditto","Ailos","Ame Digital","Asaas","Azimut","Banco do Brasil","Banco do Nordeste","Banrisul","Bari","BMG","Bradesco","BRB","BTG Banking","BV","C6","Caixa","Celcoin","Cielo","Cora","Digio","Efí","Genial","Geru","Getnet","Hyundai","Infinite Pay","Inter","Itaú","Iti","Iugu","Listo","Master","Mei Fácil","Mercado Pago","Mercantil","Midway","Modal","Méliuz","Neon","Next","Nubank","Original","PagBank","Pan","Pic Pay","PlayersBank","Quero Quero Pag","Randon","RecargaPay","Rico","Safra","Santander","Sicoob","Sicredi","Sofisa","Stone","Super Digital","Uber Conta","Up.P","Volvo","WillBank","XP","Ágora Investimentos","Íon","BTG Investimentos","Santander Cartões","Santander Financiamentos","Santander Crédito Imob","Empréstimo Sim","Santander Corretora","Bradescard","Investimentos BB","Toro","Ourocard","BTG Empresas","Iniciador.com","Google Pay","Lina Openx","Banco Industrial","Pernambucanas","Rede","Porto Bank","WHG","MagaluPay","Monte Bravo","Klavi","Mobilize Financial","CrediNissan","Belvo","Àgora Investimento","Crefisa"],
    testes: [
        "JO Automatic Pix","JO Payments","JO Sweeping Payments Balances","JO Sweeping Revoked Consent","JO Sweeping Revoked Recurring","JO Sweeping Invalid Par","JO Sweeping Invalid Request","JO Enrollments Balances","JO Enrollments Revoked Consent","JO Enrollments Revoked Enrollment","JO Enrollments Invalid Request","JO Enrollments Invalid Par","Customer Data Happy Path", "Pix Scheduling 1-2", "JSR Pix Verification 1-2", "Pix Retry 1-3", "Consents V3", "Accounts V3", "Debtor V4", "Not Cancelled V4", "Resources", "Unique", "Custom Core V4", "Real Email Invalid V4", "Fake Email Proxy V4", "SWP Total Allowed", "SWP Accounts Core", "Payments Core V2.2", "Invalid Challenge V2.2", "Invalid Origin V2.2", "Invalid Public Key V2.2", "Invalid RPID V2.2", "Pre-Enrollment V2.2", "Invalid Status V2.2", "Keys Swap V2.2", "Unmatching Fields V2.2", "APX Semanal", "APX Scheduled", "Authorised Executed", "Limits Negative", "Limits", "Not Authorised",
        "Pix Verification 1-2", "JSR Pix Schedulling 1-2",
    ]
};

const REPORT_TEMPLATES = {
    "1": `Prezados,

O teste foi executado, porém apresentou erro durante a geração do QR Code, conforme evidenciado no log.

As informações correspondentes ao teste constam na evidência anexa.

Atenciosamente,`,
    "2": `Prezados,

O teste seguiu a jornada esperada, com saída da FVP após a leitura do QR Code. No entanto, antes da realização do login junto à instituição financeira solicitante, foi apresentado erro e a execução foi interrompida, conforme evidenciado no log.

As demais informações correspondentes ao teste constam nas evidências anexas, juntamente com os prints relacionados à execução.

Atenciosamente,`,
    "3": `Prezados,

O teste seguiu a jornada esperada, com saída da FVP após a leitura do QR Code. No entanto, após a realização do login junto à instituição financeira solicitante, foi apresentado erro e a execução foi interrompida, conforme evidenciado no log.

As demais informações correspondentes ao teste constam nas evidências anexas, juntamente com os prints relacionados à execução.

Atenciosamente,`,
    "4": `Prezados,

O teste seguiu a jornada esperada, com saída da FVP após a leitura do QR Code, login realizado junto à marca e preenchimento dos parâmetros esperados, conforme orientação do teste.

No entanto, foi apresentado erro no momento do retorno à Ferramenta de Validação em Produção.

As demais informações correspondentes ao teste constam nas evidências anexas, juntamente com os prints relacionados à execução.

Atenciosamente,`,
    "5": `Prezados,

O teste seguiu a jornada esperada, com saída da FVP após a leitura do QR Code, login realizado junto à marca e preenchimento dos parâmetros esperados, conforme orientação do teste.

O teste foi concluído com sucesso.

As demais informações correspondentes ao teste constam nas evidências anexas, juntamente com os prints relacionados à execução.

Atenciosamente,`,
    "6": `Prezados,

O teste seguiu a jornada esperada, com saída da FVP após a leitura do QR Code, login realizado junto à marca e preenchimento dos parâmetros esperados, conforme orientação do teste.

Segue anexa a evidência correspondente à execução, contendo o log e o print de saldo disponível para a realização do teste solicitado.

Atenciosamente,`,
    "7": `Prezados,

O teste seguiu a jornada esperada, com saída da FVP após a leitura do QR Code, login realizado junto à marca e preenchimento dos parâmetros esperados, conforme orientação do teste.

Seguem anexas as evidências correspondentes à execução, contendo o log, o print de saldo zerado e o print do agendamento realizado, conforme pré-requisito do teste.

Atenciosamente,`
};

const app = {
    init: function() {
        this.verifyAuthStatus();
        this.populateLists();
        chicago.populateBrandDropdown();
        if(document.getElementById('logData')) document.getElementById('logData').valueAsDate = new Date();
        this.renderTable();
        this.setupListeners();
        lucide.createIcons();
        this.syncEvidences();
        this.updateErrorReport();

        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        this.switchTab('chicago'); 
        chicago.loadSession();
        chicago.toggleSdTicket();
        this.updateTestGuide(false);
    },

    openGuideModal: function() {
        if (!this.updateTestGuide(false)) {
            this.showToast("Não há orientação específica para o teste selecionado.", "error");
            return;
        }
        const m = document.getElementById('guideModal');
        m.classList.remove('hidden');
        setTimeout(() => { 
            m.classList.remove('opacity-0'); 
            m.querySelector('div').classList.remove('scale-95'); 
            m.querySelector('div').classList.add('scale-100'); 
        }, 10);
    },

    updateTestGuide: function(shouldHighlight = true) {
        const select = document.getElementById('chi_select_test');
        const button = document.getElementById('testGuideButton');
        if (!select || !button) return false;

        const testValue = select.value;
        const testLabel = select.options[select.selectedIndex]?.textContent.trim() || "";
        const sections = [...document.querySelectorAll('.guide-card[data-guide-tests]')];
        const relevantSections = sections.filter(section => {
            const supportedTests = section.dataset.guideTests.split(',').map(item => item.trim());
            return supportedTests.includes(testValue);
        });

        const selectedTest = document.getElementById('guideSelectedTest');
        if (selectedTest) selectedTest.textContent = testLabel;

        const scopeSelect = document.getElementById('guideScopeSelect');
        const scopeField = document.getElementById('guideScopeField');
        if (scopeSelect) {
            scopeSelect.innerHTML = '';
            relevantSections.forEach(section => {
                const option = document.createElement('option');
                option.value = section.dataset.guideKey;
                option.textContent = section.dataset.guideLabel;
                scopeSelect.appendChild(option);
            });
        }
        if (scopeField) scopeField.classList.toggle('hidden', relevantSections.length === 0);

        const hasGuide = relevantSections.length > 0;
        if (hasGuide) this.selectGuideScope(relevantSections[0].dataset.guideKey);
        else sections.forEach(section => section.classList.add('hidden'));

        button.classList.toggle('guide-button-available', hasGuide);
        button.setAttribute('aria-label', hasGuide
            ? `Há orientações de execução para ${testLabel}`
            : `Não há orientações específicas para ${testLabel}`);

        button.classList.remove('guide-button-pulse');
        if (hasGuide && shouldHighlight) {
            void button.offsetWidth;
            button.classList.add('guide-button-pulse');
            clearTimeout(this.guidePulseTimer);
            this.guidePulseTimer = setTimeout(() => {
                button.classList.remove('guide-button-pulse');
            }, 4200);
        }
        return hasGuide;
    },

    selectGuideScope: function(guideKey) {
        document.querySelectorAll('.guide-card[data-guide-key]').forEach(section => {
            section.classList.toggle('hidden', section.dataset.guideKey !== guideKey);
        });
        const scopeSelect = document.getElementById('guideScopeSelect');
        if (scopeSelect && scopeSelect.value !== guideKey) scopeSelect.value = guideKey;
    },

    onTestGuideChange: function() {
        this.updateTestGuide(true);
    },

    closeGuideModal: function() {
        const m = document.getElementById('guideModal');
        m.classList.add('opacity-0');
        m.querySelector('div').classList.remove('scale-100');
        m.querySelector('div').classList.add('scale-95');
        setTimeout(() => { m.classList.add('hidden'); }, 300);
    },

    openImageModal: function() {
        const m = document.getElementById('imageModal');
        m.classList.remove('hidden');
        setTimeout(() => { m.classList.remove('opacity-0'); }, 10);
    },

    closeImageModal: function() {
        const m = document.getElementById('imageModal');
        m.classList.add('opacity-0');
        setTimeout(() => { m.classList.add('hidden'); }, 300);
    },

    checkLogin: function() {
        const input = document.getElementById('passInput').value;
        const error = document.getElementById('loginError');
        
        const SENHA_B64 = window.QA_LOCAL_CONFIG?.passwordBase64;

        if (!SENHA_B64) {
            error.textContent = "Configuração local de acesso não encontrada.";
            error.classList.remove('hidden');
            return;
        }

        if (btoa(input) === SENHA_B64) {
            sessionStorage.setItem('qa_auth', 'true');
            sessionStorage.setItem('qa_last_activity', Date.now());
            
            document.getElementById('loginOverlay').classList.add('opacity-0');
            setTimeout(() => { document.getElementById('loginOverlay').style.display = 'none'; }, 300);
            
            this.iniciarMonitoramentoInatividade();
        } else {
            error.classList.remove('hidden');
            document.getElementById('passInput').value = '';
            document.getElementById('passInput').focus();
        }
    },

    verifyAuthStatus: function() {
        const TEMPO_LIMITE_MINUTOS = 15;
        if (sessionStorage.getItem('qa_auth') === 'true') {
            const ultimaAtividade = parseInt(sessionStorage.getItem('qa_last_activity') || '0');
            const tempoOcioso = (Date.now() - ultimaAtividade) / 1000 / 60;
            
            if (tempoOcioso > TEMPO_LIMITE_MINUTOS) {
                this.logoutPorInatividade();
            } else {
                document.getElementById('loginOverlay').style.display = 'none';
                this.iniciarMonitoramentoInatividade();
            }
        }
    },

    iniciarMonitoramentoInatividade: function() {
        document.onmousemove = () => this.resetarTempo();
        document.onkeypress = () => this.resetarTempo();
        document.ontouchstart = () => this.resetarTempo();
        this.resetarTempo();
    },

    resetarTempo: function() {
        const TEMPO_LIMITE_MINUTOS = 15;
        if (sessionStorage.getItem('qa_auth') === 'true') {
            sessionStorage.setItem('qa_last_activity', Date.now());
            clearTimeout(window.timeoutInatividade);
            window.timeoutInatividade = setTimeout(() => app.logoutPorInatividade(), TEMPO_LIMITE_MINUTOS * 60000);
        }
    },

    logoutPorInatividade: function() {
        sessionStorage.removeItem('qa_auth');
        const overlay = document.getElementById('loginOverlay');
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        this.showToast("Sessão expirada por inatividade.", "error");
    },

    populateLists: function() {
        const createOptions = (arr, elId) => {
            const el = document.getElementById(elId);
            if(!el) return;
            arr.forEach(i => { const opt = document.createElement('option'); opt.value = i; el.appendChild(opt); });
        };
        createOptions(DB.marcas, 'listMarcas');
        createOptions(DB.testes, 'listTestes');
    },
    setupListeners: function() {
        ['agendaTipo', 'agendaInicio', 'agendaMarca', 'agendaSegmento'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => this.calculateAgenda());
        });
    },
    
    switchTab: function(tabName) {
        const activeClasses = "bg-primary-600 text-white shadow-lg shadow-primary-500/20";
        const inactiveClasses = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50";
        const tabs = ['nomenclatura', 'agendamentos', 'relatorios', 'chicago'];
        tabs.forEach(t => {
            const btn = document.getElementById(`nav-${t}`);
            const view = document.getElementById(`view-${t}`);
            if(!btn || !view) return;
            if(t === tabName) {
                view.classList.remove('hidden');
                btn.className = `group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeClasses}`;
            } else {
                view.classList.add('hidden');
                btn.className = `group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${inactiveClasses}`;
            }
        });
    },
    
    toggleTheme: function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    },
    showToast: function(msg, type = 'success') {
        const t = document.getElementById('toast');
        const m = document.getElementById('toast-msg');
        const title = document.getElementById('toast-title');
        const iconBg = document.getElementById('toast-icon-bg');
        m.textContent = msg;
        if (type === 'error') {
            t.classList.remove('border-green-500'); t.classList.add('border-red-500');
            iconBg.className = 'inline-flex items-center justify-center flex-shrink-0 w-9 h-9 text-red-500 bg-red-100 rounded-lg dark:bg-red-500/20 dark:text-red-400';
            title.textContent = 'Atenção';
            document.getElementById('toast-icon').setAttribute('data-lucide', 'alert-circle');
        } else {
            t.classList.remove('border-red-500'); t.classList.add('border-green-500');
            iconBg.className = 'inline-flex items-center justify-center flex-shrink-0 w-9 h-9 text-green-500 bg-green-100 rounded-lg dark:bg-green-500/20 dark:text-green-400';
            title.textContent = 'Sucesso!';
            document.getElementById('toast-icon').setAttribute('data-lucide', 'check-circle-2');
        }
        lucide.createIcons();
        t.classList.remove('translate-x-[120%]', 'opacity-0');
        setTimeout(() => t.classList.add('translate-x-[120%]', 'opacity-0'), 3500);
    },
    generateLog: function() {
        const f = { teste: document.getElementById('logTeste').value, so: document.getElementById('logSO').value, marca: document.getElementById('logMarca').value, seg: document.getElementById('logSegmento').value, status: document.getElementById('logStatus').value, data: document.getElementById('logData').value };
        if(!f.teste || !f.marca) { this.showToast("Preencha Marca e Teste!", "error"); return; }
        const str = `${f.status} - ${f.marca} - ${f.seg} - ${f.teste} - ${f.data.split('-').reverse().join('-')} - ${f.so}`;
        document.getElementById('logResult').textContent = str;
        document.getElementById('logGroup').classList.remove('hidden');
        this.copyText('logResult');
    },
    syncEvidences: function() { 
        const marca = document.getElementById('logMarca').value || "...";
        const seg = document.getElementById('logSegmento').value;
        document.getElementById('evResult1').textContent = `Evidência - ${marca} - ${seg} - Saldo`;
        document.getElementById('evResult2').textContent = `Evidência - ${marca} - ${seg} - Versão app`;
        document.getElementById('evResult3').textContent = `Evidência - ${marca} - ${seg} - Mensagem de erro`;
        const evResult4 = document.getElementById('evResult4');
        if(evResult4) evResult4.textContent = `Evidência - ${marca} - ${seg} - Saldo zerado`;
    },
    copyText: function(id) {
        const el = document.getElementById(id);
        const txt = el.value !== undefined ? el.value : el.textContent;
        navigator.clipboard.writeText(txt).then(() => this.showToast('Copiado para a área de transferência!'));
    },
    checkSync: function() { 
        const f = { teste: document.getElementById('logTeste').value, marca: document.getElementById('logMarca').value, seg: document.getElementById('logSegmento').value, status: document.getElementById('logStatus').value, data: document.getElementById('logData').value };
        const triggers = ["Pix Scheduling 1-2", "JSR Pix Verification 1-2", "Pix Retry 1-3"];
        if (!triggers.includes(f.teste) || !f.marca || !f.data || f.status !== 'OK') return;

        const existing = this.getStored().some(item =>
            item.brand === f.marca && item.seg === f.seg &&
            item.type === f.teste && item.start === f.data
        );
        if (existing) return;

        document.getElementById('agendaMarca').value = f.marca;
        document.getElementById('agendaSegmento').value = f.seg;
        document.getElementById('agendaTipo').value = f.teste;
        document.getElementById('agendaInicio').value = f.data;
        this.calculateAgenda();

        const schedule = {
            id: Date.now(), brand: f.marca, seg: f.seg, type: f.teste, start: f.data,
            end: document.getElementById('agendaFim').value,
            desc: document.getElementById('agendaInstrucoes').value
        };
        const data = this.getStored();
        data.push(schedule);
        localStorage.setItem('qa_scheduler_v2', JSON.stringify(data));
        this.renderTable();
        this.openApprovedTestModal(schedule);
    },
    openApprovedTestModal: function(schedule) {
        const modal = document.getElementById('approvedTestModal');
        document.getElementById('approvedTestName').textContent = schedule.type;
        const start = schedule.start.split('-').reverse().join('/');
        const end = schedule.end.split('-').reverse().join('/');
        document.getElementById('approvedScheduleDetails').textContent = `${schedule.brand} • ${schedule.seg} • ${start} até ${end}`;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.firstElementChild.classList.remove('scale-95');
        }, 10);
    },
    closeApprovedTestModal: function() {
        const modal = document.getElementById('approvedTestModal');
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    },
    openApprovedSchedule: function() {
        this.closeApprovedTestModal();
        this.switchTab('agendamentos');
    },
    calculateAgenda: function() { 
        const type = document.getElementById('agendaTipo').value;
        const startStr = document.getElementById('agendaInicio').value;
        const brand = document.getElementById('agendaMarca').value || "MARCA";
        const seg = document.getElementById('agendaSegmento').value;
        if (!type || !startStr) return;
        const isSuccessfulRetry = type.includes("Successful Retry");
        const isRetry = type.includes("Retry") && !isSuccessfulRetry;
        const isSingleDebit = type === "Pix Scheduling 1-2" || type === "JSR Automatic Pix Scheduling 1-2";
        const days = 3;
        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(start);
        end.setDate(start.getDate() + days);
        document.getElementById('agendaFim').value = end.toISOString().split('T')[0];
        document.getElementById('btnGoogle').disabled = false;
        const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        const add = (d, n) => { const x = new Date(d); x.setDate(d.getDate()+n); return x; };
        let txt = `=== 📋 GUIA: ${brand.toUpperCase()} [${seg}] ===\nTeste: ${type}\n\n`;
        if (isSuccessfulRetry) {
            txt += `💰 SALDO: R$ 0,00 até D+2; disponibilizar R$ 1,00 antes da tentativa de D+3.\n🚫 Cheque especial e limites devem estar desabilitados.\n📅 CRONOGRAMA:\n`;
            txt += `[ ] ${fmt(add(start,0))} (D+0): Conta sem saldo\n[ ] ${fmt(add(start,1))} (D+1): Conta sem saldo\n[ ] ${fmt(add(start,2))} (D+2): Conta sem saldo\n[👉] ${fmt(add(start,3))} (D+3): Disponibilização e liquidação de R$ 1,00\n\n📎 Anexar a evidência do crédito previamente agendado em outra instituição.`;
        } else if (isRetry) {
            txt += `💰 SALDO: R$ 0,00 de D+0 até D+2.\n🚫 Cheque especial e limites devem estar desabilitados.\n📅 CRONOGRAMA:\n`;
            txt += `[ ] ${fmt(add(start,0))} (D+0): Conta sem saldo\n[ ] ${fmt(add(start,1))} (D+1): Conta sem saldo\n[ ] ${fmt(add(start,2))} (D+2): Conta sem saldo\n[ ] ${fmt(add(start,3))} (D+3): Saldo indiferente; sem débito esperado`;
        } else if (isSingleDebit) {
            txt += `💰 SALDO: R$ 1,00 disponível antes da liquidação em D+2.\n📅 CRONOGRAMA:\n`;
            txt += `[ ] ${fmt(add(start,0))} (D+0): Sem débito\n[ ] ${fmt(add(start,1))} (D+1): Sem débito\n[👉] ${fmt(add(start,2))} (D+2): Liquidação de R$ 1,00\n[ ] ${fmt(add(start,3))} (D+3): Apenas validação; sem novo débito`;
        } else {
            txt += `💰 SALDO: Mínimo R$ 2,00 antes de D+1.\n📅 CRONOGRAMA:\n`;
            txt += `[ ] ${fmt(add(start,0))} (D+0): Sem débito\n[👉] ${fmt(add(start,1))} (D+1): Liquidação de R$ 1,00\n[👉] ${fmt(add(start,2))} (D+2): Liquidação de R$ 1,00\n[ ] ${fmt(add(start,3))} (D+3): Apenas validação; sem novo débito`;
        }
        document.getElementById('agendaInstrucoes').value = txt;
    },
    updateErrorReport: function() { 
        const stage = document.getElementById('errorStage').value;
        document.getElementById('errorResult').value = REPORT_TEMPLATES[stage] || "";
    },
    insertRaidiamText: function() { this.updateErrorReport(); },
    getStored: () => JSON.parse(localStorage.getItem('qa_scheduler_v2') || '[]'),
    saveTest: function() { 
        const d = { id: Date.now(), brand: document.getElementById('agendaMarca').value, seg: document.getElementById('agendaSegmento').value, type: document.getElementById('agendaTipo').value, start: document.getElementById('agendaInicio').value, end: document.getElementById('agendaFim').value, desc: document.getElementById('agendaInstrucoes').value };
        if(!d.brand || !d.type || !d.start) { this.showToast("Preencha os campos!", "error"); return; }
        const data = this.getStored(); data.push(d); localStorage.setItem('qa_scheduler_v2', JSON.stringify(data)); this.renderTable(); this.showToast('Salvo!');
    },
    deleteTest: function(id) { if(confirm("Remover?")) { const data = this.getStored().filter(t => t.id !== id); localStorage.setItem('qa_scheduler_v2', JSON.stringify(data)); this.renderTable(); } },
    renderTable: function() { 
        const data = this.getStored().sort((a,b) => new Date(a.start) - new Date(b.start));
        const tbody = document.getElementById('scheduleTable'); tbody.innerHTML = '';
        if(data.length===0) { tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">Vazio.</td></tr>`; return; }
        data.forEach(t => {
            const badge = t.seg==='PF' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
            const fmt = s => s.split('-').reverse().slice(0,2).join('/');
            tbody.innerHTML += `<tr class="bg-white border-b border-gray-100 dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"><td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">${t.brand}</td><td class="px-6 py-4"><span class="${badge} text-xs font-bold px-3 py-1 rounded-full">${t.seg}</span></td><td class="px-6 py-4 text-gray-600 dark:text-gray-300">${t.type}</td><td class="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">${fmt(t.start)}</td><td class="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">${fmt(t.end)}</td><td class="px-6 py-4 text-right"><button onclick="app.deleteTest(${t.id})" class="text-gray-400 hover:text-red-500 p-2"><i data-lucide="trash-2" size="18"></i></button></td></tr>`;
        });
        lucide.createIcons();
    },
    openGoogleCalendar: function() { 
        const m = document.getElementById('agendaMarca').value; const t = document.getElementById('agendaTipo').value; const f = document.getElementById('agendaFim').value; const d = document.getElementById('agendaInstrucoes').value;
        if (!f) return this.showToast("Data final não definida!", "error");
        const endObj = new Date(f + 'T12:00:00'); const startStr = endObj.toISOString().slice(0,10).replace(/-/g, ''); endObj.setDate(endObj.getDate() + 1); const endStr = endObj.toISOString().slice(0,10).replace(/-/g, '');
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`FINALIZAR: ${m} - ${t}`)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(d)}`, '_blank');
    },
    exportData: function() { 
        const d = localStorage.getItem('qa_scheduler_v2'); if(!d || d==='[]') return this.showToast("Nada.", "error");
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([d], {type:'application/json'})); a.download = `backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
    },
    exportExcel: function() { 
        const d = this.getStored(); if(!d.length) return this.showToast("Nada.", "error");
        let csv = "\uFEFFMarca;Segmento;Teste;Inicio;Fim;Detalhes\n"; d.forEach(t => csv += `${t.brand};${t.seg};${t.type};${t.start};${t.end};"${t.desc.replace(/\n/g,' ')}"\n`);
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'})); a.download = `relatorio.csv`; a.click();
    },
    importData: function(inp) { 
        const f = inp.files[0]; if(!f) return;
        const r = new FileReader();
        r.onload = e => { try { localStorage.setItem('qa_scheduler_v2', JSON.stringify(JSON.parse(e.target.result))); this.renderTable(); this.showToast("Restaurado!"); } catch(err) { this.showToast("Inválido", "error"); } };
        r.readAsText(f);
    }
};

// ==========================================
// MÓDULO: JSON CHICAGO (API PAYLOADS)
// ==========================================
const chicago = {
    validaCPF: function(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    },
    validaCNPJ: function(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) return false;
        return true;
    },

    getCampos: function() {
        return {
            usuario: document.getElementById('chi_usuario').value,
            cpf: document.getElementById('chi_cpf').value,
            cnpj: document.getElementById('chi_cnpj').value,
            empresa: document.getElementById('chi_empresa').value,
            ispb: document.getElementById('chi_ispb').value,
            ispbpj: document.getElementById('chi_ispbpj').value,
            issuer: document.getElementById('chi_issuer').value,
            issuerpj: document.getElementById('chi_issuerpj').value,
            conta: document.getElementById('chi_conta').value,
            contapj: document.getElementById('chi_contapj').value,
            tipo: document.getElementById('chi_tipo').value.toUpperCase(),
            tipopj: document.getElementById('chi_tipopj').value.toUpperCase(),
            executionType: document.getElementById('chi_execution_type')?.value || "Test",
            cycle: document.getElementById('chi_cycle')?.value || "",
            sdTicket: document.getElementById('chi_sd_ticket')?.value || ""
        };
    },

    saveSession: function(silent = false) {
        const dados = this.getCampos();
        if(!silent) {
            if(dados.cpf && !this.validaCPF(dados.cpf)) { app.showToast("CPF Inválido!", "error"); return false; }
            if(dados.cnpj && !this.validaCNPJ(dados.cnpj)) { app.showToast("CNPJ Inválido!", "error"); return false; }
            app.showToast("Dados salvos no navegador!");
        }
        localStorage.setItem('chicago_session', JSON.stringify(dados));
        return true;
    },

    loadSession: function() {
        const s = JSON.parse(localStorage.getItem('chicago_session') || '{}');
        if(Object.keys(s).length === 0) return;
        
        document.getElementById('chi_usuario').value = s.usuario || "";
        document.getElementById('chi_cpf').value = s.cpf || "";
        document.getElementById('chi_cnpj').value = s.cnpj || "";
        document.getElementById('chi_empresa').value = s.empresa || "";
        document.getElementById('chi_ispb').value = s.ispb || "";
        document.getElementById('chi_ispbpj').value = s.ispbpj || "";
        document.getElementById('chi_issuer').value = s.issuer || "";
        document.getElementById('chi_issuerpj').value = s.issuerpj || "";
        document.getElementById('chi_conta').value = s.conta || "";
        document.getElementById('chi_contapj').value = s.contapj || "";
        document.getElementById('chi_tipo').value = s.tipo || "";
        document.getElementById('chi_tipopj').value = s.tipopj || "";
        if(document.getElementById('chi_execution_type')) document.getElementById('chi_execution_type').value = s.executionType || "Test";
        const cycleSelect = document.getElementById('chi_cycle');
        if(cycleSelect) {
            const savedCycle = s.cycle || "Julho-26";
            const hasSavedCycle = Array.from(cycleSelect.options).some(option => option.value === savedCycle);
            cycleSelect.value = hasSavedCycle ? savedCycle : "Julho-26";
        }
        if(document.getElementById('chi_sd_ticket')) document.getElementById('chi_sd_ticket').value = s.sdTicket || "";
        this.toggleSdTicket();
    },

    toggleSdTicket: function() {
        const executionType = document.getElementById('chi_execution_type')?.value || "Test";
        const sdTicketGroup = document.getElementById('chi_sd_ticket_group');
        if(!sdTicketGroup) return;
        sdTicketGroup.classList.toggle('hidden', executionType !== "Retest");
    },

    appendRunMetadata: function(payload) {
        const executionType = document.getElementById('chi_execution_type')?.value || "Test";
        const cycle = document.getElementById('chi_cycle')?.value || "";
        payload.runMetadata = {
            type: executionType,
            cycle: cycle
        };
        if(executionType === "Retest") {
            payload.runMetadata.sdTicket = document.getElementById('chi_sd_ticket')?.value || "";
        }
        return payload;
    },

    populateBrandDropdown: function() {
        const datalist = document.getElementById('chi_brand_list');
        if(!datalist) return;
        datalist.innerHTML = '';
        Object.keys(BRAND_MAPPING).sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            datalist.appendChild(option);
        });
    },

    getSelectedBrandSegment: function() {
        const segment = document.getElementById('chi_select_segment');
        if(!segment) return 'PF';
        return segment.value.toUpperCase() === 'PJ' ? 'PJ' : 'PF';
    },

    normalizeBrandName: function(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[\uFFFD?]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase()
            .trim();
    },

    isSimilarNormalized: function(a, b) {
        if (a === b) return true;
        if (a.includes(b) || b.includes(a)) return true;
        return this.getEditDistance(a, b) <= 2;
    },

    getEditDistance: function(a, b) {
        const matrix = Array.from({ length: a.length + 1 }, () => []);
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[a.length][b.length];
    },

    findBrandKey: function(brand) {
        const normalizedInput = this.normalizeBrandName(brand);
        if (!normalizedInput) return null;
        const keys = Object.keys(BRAND_MAPPING);
        const exact = keys.find(key => this.normalizeBrandName(key) === normalizedInput);
        if (exact) return exact;
        return keys.find(key => this.isSimilarNormalized(this.normalizeBrandName(key), normalizedInput)) || null;
    },

    onBrandSelect: function() {
        const brandInput = document.getElementById('chi_brand').value;
        const brandKey = this.findBrandKey(brandInput);
        const selectedBrand = brandKey || brandInput;
        const asIdInput = document.getElementById('chi_as_id');
        if(!selectedBrand) {
            asIdInput.value = '';
            return;
        }

        const segment = this.getSelectedBrandSegment();
        const config = BRAND_MAPPING[brandKey];
        if(config) {
            asIdInput.value = (config.asId && config.asId[segment]) || config.asId?.PF || config.asId?.PJ || '';
        } else {
            asIdInput.value = '';
        }

        const nomenMarca = document.getElementById('logMarca');
        const agendaMarca = document.getElementById('agendaMarca');
        if(nomenMarca) nomenMarca.value = selectedBrand;
        if(agendaMarca) agendaMarca.value = selectedBrand;
        if(typeof app !== 'undefined') {
            if(nomenMarca) app.syncEvidences();
            if(agendaMarca) app.checkSync();
        }
    },

    exportSession: function() {
        this.saveSession(true);
        const d = localStorage.getItem('chicago_session');
        if(!d || d === '{}') return app.showToast("Nada para exportar", "error");
        const b = new Blob([d], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `chicago_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    },

    importSession: function(inp) {
        const f = inp.files[0];
        if(!f) return;
        const r = new FileReader();
        r.onload = e => {
            try {
                const j = JSON.parse(e.target.result);
                if(confirm("Substituir dados atuais pelo backup importado?")) {
                    localStorage.setItem('chicago_session', JSON.stringify(j));
                    this.loadSession();
                    app.showToast("Backup restaurado!");
                }
            } catch(err) { app.showToast("Arquivo inválido", "error"); }
            inp.value = ""; 
        };
        r.readAsText(f);
    },

    outputJson: function(obj) {
        const str = JSON.stringify(obj, null, 4);
        document.getElementById('chi_result').value = str;
    },

    generateFromSelect: function() {
        const segment = document.getElementById('chi_select_segment').value; 
        const test = document.getElementById('chi_select_test').value; 
        const typeToGenerate = `${test}_${segment}`; 
        this.generate(typeToGenerate);
    },

    generate: function(type) {
        if(!this.saveSession(true)) return; 
        
        const d = this.getCampos();
        const asIdVal = document.getElementById('chi_as_id').value;
        
        if(!d.cpf) { app.showToast("O campo CPF é obrigatório na Configuração.", "error"); return; }
        if(type.includes('pj') && !d.cnpj) { app.showToast("O campo CNPJ é obrigatório para payloads PJ.", "error"); return; }

        let payload = {
            "server": {
                "authorisationServerId": asIdVal
            },
            "resource": {},
            "directory": {}
        };

        switch(type) {
            
            // ==============================
            // PESSOA FÍSICA (PF)
            // ==============================
            case 'customer_data_v3_pf':
                payload.resource = {
                    brazilCpf: d.cpf
                };
                break;

            case 'sweeping_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispb,
                    creditorAccountIssuer: d.issuer,
                    creditorAccountNumber: d.conta,
                    creditorAccountAccountType: d.tipo,
                    creditorName: d.usuario,
                    brazilCpf: d.cpf
                };
                break;

            case 'payments_pf': 
            case 'scheduling_pf': 
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    brazilCpf: d.cpf
                };
                break;

            case 'redirect_pf': 
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc",
                    brazilCpf: d.cpf
                };
                break;

            case 'e2e_pf':
            case 'payments_v5_open_pf':
            case 'payments_v4_scheduling_pf':
            case 'payments_v5_scheduling_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc",
                    brazilCpf: d.cpf
                };
                break;
            case 'e2e_name_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc",
                    name: d.usuario,
                    brazilCpf: d.cpf
                };
                break;

            // --- NOVOS PF ---
            case 'no_redirect_auto_sched_novo_pf':
            case 'no_redirect_auto_novo_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    brazilCpf: d.cpf
                };
                break;

            case 'no_redirect_pix_novo_pf':
                payload = {
                    "server": {
                        "authorisationServerId": asIdVal
                    },
                    "resource": {
                        loggedUserIdentification: d.cpf,
                        creditorAccountIspb: "22896431",
                        creditorAccountIssuer: "0001",
                        creditorAccountNumber: "1350122360",
                        creditorAccountAccountType: "TRAN",
                        creditorName: "JSR SERVICE LTDA",
                        creditorCpfCnpj: "63602987000134",
                        brazilCpf: d.cpf
                    }
                };
                break;

            case 'no_redirect_sched_novo_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc",
                    brazilCpf: d.cpf
                };
                break;
                
            // ==============================
            // OPTIMISED JOURNEY (PF) - DADOS DO USUÁRIO
            // ==============================
            
            case 'opt_core_v1_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispbpj,
                    creditorAccountIssuer: d.issuerpj,
                    creditorAccountNumber: d.contapj,
                    creditorAccountAccountType: d.tipopj,
                    creditorName: d.empresa,
                    brazilCpf: d.cpf,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorCpfCnpj: d.cnpj
                };
                break;
                
            case 'opt_auto_v1_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispb,
                    creditorAccountIssuer: d.issuer,
                    creditorAccountNumber: d.conta,
                    creditorAccountAccountType: d.tipo,
                    creditorName: d.usuario,
                    brazilCpf: d.cpf
                };
                break;
                
            case 'opt_noredirect_v1_pf':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispbpj,
                    creditorAccountIssuer: d.issuerpj,
                    creditorAccountNumber: d.contapj,
                    creditorAccountAccountType: d.tipopj,
                    creditorName: d.empresa,
                    creditorCpfCnpj: d.cnpj,
                    brazilCpf: d.cpf
                };
                break;
            
            // ==============================
            // PESSOA JURÍDICA (PJ)
            // ==============================

            case 'customer_data_v3_pj':
                payload.resource = {
                    brazilCpf: d.cpf,
                    brazilCnpj: d.cnpj
                };
                break;
            case 'sweeping_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    creditorAccountIspb: d.ispbpj,
                    creditorAccountIssuer: d.issuerpj,
                    creditorAccountNumber: d.contapj,
                    creditorAccountAccountType: d.tipopj,
                    creditorName: d.empresa,
                    brazilCpf: d.cpf,
                    brazilCnpj: d.cnpj
                };
                break;

            case 'payments_pj': 
            case 'scheduling_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    brazilCpf: d.cpf,
                    brazilCnpj: d.cnpj
                };
                break;

            case 'redirect_pj': 
            case 'e2e_pj':
            case 'payments_v5_open_pj':
            case 'payments_v4_scheduling_pj':
            case 'payments_v5_scheduling_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc",
                    brazilCpf: d.cpf,
                    brazilCnpj: d.cnpj
                };
                break;
            case 'e2e_name_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc",
                    name: d.usuario,
                    brazilCpf: d.cpf,
                    brazilCnpj: d.cnpj
                };
                break;

            // --- NOVOS PJ ---
            case 'no_redirect_auto_sched_novo_pj':
            case 'no_redirect_auto_novo_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    brazilCpf: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    brazilCnpj: d.cnpj
                };
                break;

            case 'no_redirect_pix_novo_pj':
                payload = {
                    "server": {
                        "authorisationServerId": asIdVal
                    },
                    "resource": {
                        loggedUserIdentification: d.cpf,
                        creditorAccountIspb: "22896431",
                        creditorAccountIssuer: "0001",
                        creditorAccountNumber: "1350122360",
                        creditorAccountAccountType: "TRAN",
                        creditorName: "JSR SERVICE LTDA",
                        creditorCpfCnpj: "63602987000134",
                        brazilCpf: d.cpf,
                        businessEntityIdentification: d.cnpj,
                        brazilCnpj: d.cnpj
                    }
                };
                break;

            case 'no_redirect_sched_novo_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorAccountIspb: "22896431",
                    creditorAccountIssuer: "0001",
                    creditorAccountNumber: "1350122360",
                    creditorAccountAccountType: "TRAN",
                    creditorName: "JSR SERVICE LTDA",
                    creditorCpfCnpj: "63602987000134",
                    creditorProxy: "0d44e14e-23eb-4073-bc61-e8def759d8cc", 
                    brazilCpf: d.cpf,
                    brazilCnpj: d.cnpj
                };
                break;
                
            // ==============================
            // OPTIMISED JOURNEY (PJ) - DADOS DO USUÁRIO
            // ==============================
            
            case 'opt_core_v1_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispbpj,
                    creditorAccountIssuer: d.issuerpj,
                    creditorAccountNumber: d.contapj,
                    creditorAccountAccountType: d.tipopj,
                    creditorName: d.empresa,
                    brazilCpf: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    brazilCnpj: d.cnpj,
                    contractDebtorName: d.usuario,
                    contractDebtorIdentification: d.cpf,
                    creditorCpfCnpj: d.cnpj
                };
                break;

            case 'opt_auto_v1_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispbpj,
                    creditorAccountIssuer: d.issuerpj,
                    creditorAccountNumber: d.contapj,
                    creditorAccountAccountType: d.tipopj,
                    creditorName: d.empresa,
                    brazilCpf: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    brazilCnpj: d.cnpj
                };
                break;
                
            case 'opt_noredirect_v1_pj':
                payload.resource = {
                    loggedUserIdentification: d.cpf,
                    creditorAccountIspb: d.ispbpj,
                    creditorAccountIssuer: d.issuerpj,
                    creditorAccountNumber: d.contapj,
                    creditorAccountAccountType: d.tipopj,
                    creditorName: d.empresa,
                    creditorCpfCnpj: d.cnpj,
                    brazilCpf: d.cpf,
                    businessEntityIdentification: d.cnpj,
                    brazilCnpj: d.cnpj
                };
                break;
        }

        this.appendRunMetadata(payload);
        this.outputJson(payload);
        app.showToast("JSON gerado com sucesso!");
    }
};

// NOVA FUNÇÃO: COPY & GO (FVP)
function enviarParaFVP() {
    const jsonGerado = document.getElementById('chi_result').value;
    
    if(!jsonGerado || jsonGerado.trim() === '' || jsonGerado.includes('// Preencha os campos')) {
        app.showToast("Gere um JSON primeiro antes de executar!", "error");
        return;
    }

    navigator.clipboard.writeText(jsonGerado).then(() => {
        app.showToast("JSON copiado! Cole na plataforma FVP.");
        const urlFVP = "https://web.fvp.directory.openbankingbrasil.org.br/schedule-test.html"; 
        window.open(urlFVP, '_blank');
    }).catch(err => {
        console.error("Falha ao copiar:", err);
        alert("⚠️ O navegador bloqueou a cópia automática. Copie o JSON manualmente.");
    });
}

// INICIALIZAR SISTEMA GERAL
document.addEventListener('DOMContentLoaded', () => app.init());
