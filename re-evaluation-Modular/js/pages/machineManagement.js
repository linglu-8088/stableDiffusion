// ================= 机台管理页面 =================

import { LogSystem } from '../modules/logSystem.js';

export const MachineManagement = {
    machines: [], // 存储所有机台数据

    // 初始化机台管理页面
    init: function() {
        try {
            console.log('🏭 初始化机台管理页面');

            // 生成模拟机台数据
            this.generateMockMachines();

            // 渲染机台卡片
            this.renderMachineGrid();

            // 绑定事件
            this.bindEvents();

            // 记录日志
            LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.PAGE_ACCESS, '访问机台管理页面', '', 'MachineManagement');
        } catch (error) {
            console.error('❌ 机台管理页面初始化失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.SYSTEM_CONFIG, '机台管理页面初始化失败', error.message, 'MachineManagement');
        }
    },

    // 生成模拟机台数据
    generateMockMachines: function() {
        const machineNames = [
            'AOI-L1-01', 'AOI-L1-02', 'AOI-L1-03', 'AOI-L2-01',
            'AOI-L2-02', 'AOI-L2-03', 'VRS-R1-01', 'VRS-R1-02',
            'VRS-R2-01', 'VRS-R2-02', 'AOI-T1-01', 'AOI-T1-02'
        ];

        const vendors = ['Omron', 'Keyence', 'Cognex', 'Other'];
        const models = ['FH-5050', 'XG-8500', 'In-Sight 7800', 'VS-8800'];
        const locations = ['生产车间A区', '生产车间B区', '测试车间', '质检车间'];

        this.machines = machineNames.map((name, index) => {
            // 随机状态分布：70%运行中，15%待机，10%故障，5%离线
            let status;
            const rand = Math.random();
            if (rand < 0.7) status = 'running';
            else if (rand < 0.85) status = 'idle';
            else if (rand < 0.95) status = 'error';
            else status = 'offline';

            return {
                id: `machine-${index + 1}`,
                name: name,
                vendor: vendors[Math.floor(Math.random() * vendors.length)],
                model: models[Math.floor(Math.random() * models.length)],
                serialNumber: `SN${String(100000 + index).padStart(6, '0')}`,
                ipAddress: `192.168.1.${100 + index}`,
                port: 8080 + index,
                protocol: 'TCP/IP',
                location: locations[Math.floor(Math.random() * locations.length)],
                status: status,
                currentPart: `820-${String(100 + index).padStart(3, '0')}-A`,
                modelVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
                thresholdTemplate: `Template-${Math.floor(Math.random() * 5) + 1}`,
                progress: Math.floor(Math.random() * 500) + 1, // 1-500
                totalProgress: 500,
                lastSeen: new Date(Date.now() - Math.random() * 3600000), // 最近1小时内
                alarms: this.generateMockAlarms()
            };
        });

        console.log(`✅ 生成 ${this.machines.length} 台模拟机台数据`);
    },

    // 生成模拟报警数据
    generateMockAlarms: function() {
        const alarmTypes = [
            '连接超时',
            '检测异常',
            '温度过高',
            '电源异常',
            '通信错误',
            '硬件故障'
        ];

        const alarmCount = Math.floor(Math.random() * 4); // 0-3条报警
        const alarms = [];

        for (let i = 0; i < alarmCount; i++) {
            alarms.push({
                id: `alarm-${Date.now()}-${i}`,
                type: alarmTypes[Math.floor(Math.random() * alarmTypes.length)],
                message: `机台出现${alarmTypes[Math.floor(Math.random() * alarmTypes.length)]}报警`,
                timestamp: new Date(Date.now() - Math.random() * 86400000), // 最近24小时
                severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
            });
        }

        return alarms;
    },

    // 渲染机台网格
    renderMachineGrid: function() {
        const grid = document.getElementById('machineGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.machines.forEach(machine => {
            const card = this.createMachineCard(machine);
            grid.appendChild(card);
        });

        console.log(`✅ 渲染 ${this.machines.length} 个机台卡片`);
    },

    // 创建机台卡片
    createMachineCard: function(machine) {
        const card = document.createElement('div');
        card.className = 'machine-card';
        card.dataset.machineId = machine.id;

        // 状态指示灯
        const statusIndicator = this.getStatusIndicator(machine.status);

        // 进度条
        const progressPercent = Math.round((machine.progress / machine.totalProgress) * 100);

        card.innerHTML = `
            <div class="machine-card-header">
                <div class="status-indicator ${machine.status}">
                    ${statusIndicator}
                </div>
                <div class="machine-actions">
                    <button class="action-btn" onclick="MachineManagement.editMachine('${machine.id}')">✏️</button>
                    <button class="action-btn" onclick="MachineManagement.showLogs('${machine.id}')">📋</button>
                    <button class="action-btn" onclick="MachineManagement.restartMachine('${machine.id}')">🔄</button>
                </div>
            </div>
            <div class="machine-card-body">
                <div class="machine-name">${machine.name}</div>
                <div class="machine-info">
                    <div class="info-item">
                        <span class="info-label">当前料号:</span>
                        <span class="info-value">${machine.currentPart}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">IP地址:</span>
                        <span class="info-value">${machine.ipAddress}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">复判进度:</span>
                        <span class="info-value">${machine.progress}/${machine.totalProgress}</span>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${progressPercent}%</div>
                </div>
            </div>
        `;

        // 绑定点击事件
        card.addEventListener('click', (e) => {
            // 避免点击操作按钮时触发详情
            if (!e.target.classList.contains('action-btn')) {
                this.showMachineDetail(machine.id);
            }
        });

        return card;
    },

    // 获取状态指示灯
    getStatusIndicator: function(status) {
        const indicators = {
            running: '🟢',
            idle: '🟡',
            error: '🔴',
            offline: '⚪'
        };
        return indicators[status] || '⚪';
    },

    // 绑定事件
    bindEvents: function() {
        // 搜索框事件已在HTML中绑定
        // 其他事件已在相应按钮上绑定
    },

    // 打开添加机台模态框
    openAddMachineModal: function() {
        const modal = document.getElementById('addMachineModal');
        if (modal) {
            modal.style.display = 'flex';
            this.clearAddMachineForm();
        }
    },

    // 关闭添加机台模态框
    closeAddMachineModal: function() {
        const modal = document.getElementById('addMachineModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // 清空添加机台表单
    clearAddMachineForm: function() {
        const inputs = [
            'machineNameInput', 'modelInput', 'serialNumberInput',
            'ipAddressInput', 'portInput', 'locationInput'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        // 重置下拉框
        const selects = ['vendorSelect', 'protocolSelect'];
        selects.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.selectedIndex = 0;
        });
    },

    // 保存机台
    saveMachine: function() {
        try {
            const machineData = this.getFormData();

            if (!machineData.name || !machineData.ipAddress) {
                alert('机台名称和IP地址为必填项！');
                return;
            }

            // 验证IP地址格式
            if (!this.isValidIP(machineData.ipAddress)) {
                alert('请输入有效的IP地址！');
                return;
            }

            // 创建新机台
            const newMachine = {
                id: `machine-${Date.now()}`,
                ...machineData,
                status: 'offline', // 新机台默认离线状态
                progress: 0,
                totalProgress: 500,
                lastSeen: new Date(),
                alarms: []
            };

            this.machines.push(newMachine);
            this.renderMachineGrid();
            this.closeAddMachineModal();

            LogSystem.addLog(LogSystem.levels.SUCCESS, LogSystem.types.USER_ACTION, '添加新机台', `机台: ${newMachine.name}`, 'MachineManagement');

        } catch (error) {
            console.error('❌ 保存机台失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.USER_ACTION, '添加机台失败', error.message, 'MachineManagement');
        }
    },

    // 获取表单数据
    getFormData: function() {
        return {
            name: document.getElementById('machineNameInput')?.value || '',
            vendor: document.getElementById('vendorSelect')?.value || '',
            model: document.getElementById('modelInput')?.value || '',
            serialNumber: document.getElementById('serialNumberInput')?.value || '',
            ipAddress: document.getElementById('ipAddressInput')?.value || '',
            port: parseInt(document.getElementById('portInput')?.value) || 8080,
            protocol: document.getElementById('protocolSelect')?.value || 'TCP/IP',
            location: document.getElementById('locationInput')?.value || '',
            currentPart: '820-001-A', // 默认料号
            modelVersion: 'v1.0', // 默认版本
            thresholdTemplate: 'Template-1' // 默认模板
        };
    },

    // 验证IP地址
    isValidIP: function(ip) {
        const ipRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
        return ipRegex.test(ip);
    },

    // 批量配置
    batchConfigure: function() {
        alert('批量配置功能正在开发中...');
        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '点击批量配置按钮', '', 'MachineManagement');
    },

    // 刷新状态
    refreshStatus: function() {
        // 随机更新机台状态
        this.machines.forEach(machine => {
            if (Math.random() < 0.3) { // 30%概率改变状态
                const statuses = ['running', 'idle', 'error', 'offline'];
                const currentIndex = statuses.indexOf(machine.status);
                const newIndex = (currentIndex + Math.floor(Math.random() * 3) + 1) % 4;
                machine.status = statuses[newIndex];
                machine.lastSeen = new Date();
            }
        });

        this.renderMachineGrid();

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '刷新机台状态', '', 'MachineManagement');
    },

    // 编辑机台
    editMachine: function(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return;

        alert(`编辑机台: ${machine.name}\n此功能正在开发中...`);
        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '编辑机台', `机台ID: ${machineId}`, 'MachineManagement');
    },

    // 显示日志
    showLogs: function(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return;

        alert(`查看机台日志: ${machine.name}\n此功能正在开发中...`);
        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '查看机台日志', `机台ID: ${machineId}`, 'MachineManagement');
    },

    // 重启机台
    restartMachine: function(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return;

        // 模拟重启过程
        machine.status = 'offline';
        this.renderMachineGrid();

        setTimeout(() => {
            machine.status = 'running';
            machine.lastSeen = new Date();
            this.renderMachineGrid();
        }, 3000);

        LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.USER_ACTION, '重启机台', `机台ID: ${machineId}`, 'MachineManagement');
    },

    // 显示机台详情
    showMachineDetail: function(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return;

        // 填充详情数据
        this.fillDetailData(machine);

        // 显示抽屉
        const drawer = document.getElementById('machineDetailDrawer');
        if (drawer) {
            drawer.style.right = '0';
        }

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '查看机台详情', `机台ID: ${machineId}`, 'MachineManagement');
    },

    // 关闭详情抽屉
    closeDetailDrawer: function() {
        const drawer = document.getElementById('machineDetailDrawer');
        if (drawer) {
            drawer.style.right = '-400px';
        }
    },

    // 填充详情数据
    fillDetailData: function(machine) {
        // 基础信息
        this.setDetailValue('detailMachineName', machine.name);
        this.setDetailValue('detailVendor', machine.vendor);
        this.setDetailValue('detailModel', machine.model);
        this.setDetailValue('detailSerialNumber', machine.serialNumber);
        this.setDetailValue('detailLocation', machine.location);

        // 连接配置
        this.setDetailValue('detailIpAddress', machine.ipAddress);
        this.setDetailValue('detailPort', machine.port);
        this.setDetailValue('detailProtocol', machine.protocol);
        this.setDetailValue('detailConnectionStatus', this.getStatusText(machine.status));

        // 关联配置
        this.setDetailValue('detailModelVersion', machine.modelVersion);
        this.setDetailValue('detailThresholdTemplate', machine.thresholdTemplate);
        this.setDetailValue('detailCurrentPart', machine.currentPart);

        // 报警列表
        this.renderAlarmList(machine.alarms);
    },

    // 设置详情值
    setDetailValue: function(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value || '-';
        }
    },

    // 获取状态文本
    getStatusText: function(status) {
        const statusTexts = {
            running: '运行中',
            idle: '待机',
            error: '故障',
            offline: '离线'
        };
        return statusTexts[status] || '未知';
    },

    // 渲染报警列表
    renderAlarmList: function(alarms) {
        const alarmList = document.getElementById('alarmList');
        if (!alarmList) return;

        if (alarms.length === 0) {
            alarmList.innerHTML = '<div class="no-alarms">暂无报警记录</div>';
            return;
        }

        alarmList.innerHTML = alarms.map(alarm => `
            <div class="alarm-item ${alarm.severity}">
                <div class="alarm-header">
                    <span class="alarm-type">${alarm.type}</span>
                    <span class="alarm-time">${this.formatDate(alarm.timestamp)}</span>
                </div>
                <div class="alarm-message">${alarm.message}</div>
            </div>
        `).join('');
    },

    // 格式化日期
    formatDate: function(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // 过滤机台
    filterMachines: function() {
        const searchTerm = document.getElementById('machineSearch')?.value.toLowerCase() || '';

        this.machines.forEach(machine => {
            const card = document.querySelector(`[data-machine-id="${machine.id}"]`);
            if (!card) return;

            const matchName = machine.name.toLowerCase().includes(searchTerm);
            const matchIP = machine.ipAddress.includes(searchTerm);

            card.style.display = (matchName || matchIP) ? 'block' : 'none';
        });

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '搜索机台', `搜索词: ${searchTerm}`, 'MachineManagement');
    },

    // 页面显示时的处理
    onPageShow: function() {
        // 可以在这里添加页面显示时的逻辑
        console.log('📱 机台管理页面显示');
    }
};