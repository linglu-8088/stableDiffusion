// ================= 日志记录系统 =================

export const LogSystem = {
    logs: [],
    currentPage: 1,
    pageSize: 20,
    logIdCounter: 1,
    storageEnabled: true, // 是否启用本地存储

    // 日志级别
    levels: {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error',
        SUCCESS: 'success'
    },

    // 操作类型
    types: {
        PAGE_ACCESS: 'page_access',
        DATA_CHANGE: 'data_change',
        SYSTEM_CONFIG: 'system_config',
        USER_ACTION: 'user_action'
    },
    
    // 添加日志记录
    addLog: function(level, type, description, details = '', user = 'System', ip = '127.0.0.1') {
        const log = {
            id: this.logIdCounter++,
            timestamp: new Date().toISOString(),
            level: level,
            type: type,
            user: user,
            description: description,
            details: details,
            ip: ip
        };
        
        this.logs.unshift(log); // 最新的日志在前面
        this.saveLogs();
        this.updateStatistics();
    },
    
    // 检查本地存储是否可用
    checkStorageAvailability: function() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },

    // 初始化存储状态
    initStorage: function() {
        this.storageEnabled = this.checkStorageAvailability();

        if (!this.storageEnabled) {
            console.warn('⚠️ 本地存储不可用，日志将仅保存在内存中。建议使用HTTP服务器运行以获得完整功能。');
            console.warn('💡 解决方案：使用Live Server扩展或Python HTTP服务器运行项目');
            console.warn('   - VS Code: 右键 index.html -> "Open with Live Server"');
            console.warn('   - 命令行: python -m http.server 8000');

            // 显示用户友好的警告信息
            this.showStorageWarning();
        }
    },

    // 显示存储警告
    showStorageWarning: function() {
        // 延迟显示，确保页面已加载
        setTimeout(() => {
            const warningDiv = document.createElement('div');
            warningDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff9800;
                color: white;
                padding: 15px;
                border-radius: 5px;
                z-index: 10000;
                max-width: 350px;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                cursor: pointer;
            `;
            warningDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px;">⚠️ 存储功能受限</div>
                <div style="margin-bottom: 8px;">本地存储不可用，日志将仅保存在内存中。</div>
                <div style="font-size: 12px; color: #fff8e1;">
                    建议：使用HTTP服务器运行以获得完整功能
                </div>
                <div style="position: absolute; top: 5px; right: 8px; font-size: 18px;">&times;</div>
            `;

            // 点击关闭
            warningDiv.onclick = () => warningDiv.remove();

            // 自动隐藏（可选）
            setTimeout(() => {
                if (warningDiv.parentNode) {
                    warningDiv.remove();
                }
            }, 10000);

            document.body.appendChild(warningDiv);
        }, 2000);
    },

    // 保存日志到本地存储
    saveLogs: function() {
        if (!this.storageEnabled) {
            return; // 不尝试保存到不可用的存储
        }

        try {
            localStorage.setItem('system_logs', JSON.stringify(this.logs.slice(0, 1000))); // 最多保存1000条日志
        } catch (e) {
            console.error('保存日志失败:', e);
            // 如果保存失败，禁用存储功能
            this.storageEnabled = false;
        }
    },
    
    // 获取日志统计
    getLogStatistics: function() {
        const totalLogs = this.logs.length;
        const today = new Date().toDateString();
        const todayLogs = this.logs.filter(log => new Date(log.timestamp).toDateString() === today);
        const errorLogs = this.logs.filter(log => log.level === this.levels.ERROR);
        const warningLogs = this.logs.filter(log => log.level === this.levels.WARNING);
        const infoLogs = this.logs.filter(log => log.level === this.levels.INFO);
        const successLogs = this.logs.filter(log => log.level === this.levels.SUCCESS);
        const systemLogs = this.logs.filter(log => log.type === this.types.SYSTEM_CONFIG);
        const pageAccessLogs = this.logs.filter(log => log.type === this.types.PAGE_ACCESS);
        const dataChangeLogs = this.logs.filter(log => log.type === this.types.DATA_CHANGE);
        const userActionLogs = this.logs.filter(log => log.type === this.types.USER_ACTION);
        
        return {
            total: totalLogs,
            today: todayLogs.length,
            error: errorLogs.length,
            warning: warningLogs.length,
            info: infoLogs.length,
            success: successLogs.length,
            systemConfig: systemLogs.length,
            pageAccess: pageAccessLogs.length,
            dataChange: dataChangeLogs.length,
            userAction: userActionLogs.length
        };
    },
    
    // 清理过期日志
    cleanupOldLogs: function(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const originalCount = this.logs.length;
        this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate);
        
        if (this.logs.length < originalCount) {
            this.saveLogs();
            this.addLog(
                this.levels.INFO,
                this.types.SYSTEM_CONFIG,
                `清理过期日志: 删除了 ${originalCount - this.logs.length} 条超过 ${daysToKeep} 天的日志`,
                JSON.stringify({ 
                    originalCount: originalCount, 
                    remainingCount: this.logs.length,
                    daysToKeep: daysToKeep 
                }),
                'System'
            );
        }
    },
    
    // 从本地存储加载日志
    loadLogs: function() {
        // 首先检查存储是否可用
        this.initStorage();

        if (!this.storageEnabled) {
            console.log('📝 日志将仅保存在内存中');
            return;
        }

        try {
            const savedLogs = localStorage.getItem('system_logs');
            if (savedLogs) {
                this.logs = JSON.parse(savedLogs);
                if (this.logs.length > 0) {
                    this.logIdCounter = Math.max(...this.logs.map(log => log.id)) + 1;
                }
                console.log(`✅ 已从本地存储加载 ${this.logs.length} 条日志`);
            }
        } catch (e) {
            console.error('加载日志失败:', e);
            this.logs = [];
            // 如果加载失败，禁用存储功能
            this.storageEnabled = false;
        }
    },
    
    // 清空日志
    clearLogs: function() {
        this.logs = [];
        this.logIdCounter = 1;
        this.saveLogs();
        this.updateStatistics();
    },
    
    // 更新统计信息
    updateStatistics: function() {
        const totalLogs = this.logs.length;
        const today = new Date().toDateString();
        const todayLogs = this.logs.filter(log => new Date(log.timestamp).toDateString() === today);
        const errorLogs = this.logs.filter(log => log.level === this.levels.ERROR);
        const systemLogs = this.logs.filter(log => log.type === this.types.SYSTEM_CONFIG);
        
        const totalLogCountEl = document.getElementById('totalLogCount');
        const todayLogCountEl = document.getElementById('todayLogCount');
        const errorLogCountEl = document.getElementById('errorLogCount');
        const systemLogCountEl = document.getElementById('systemLogCount');
        
        if (totalLogCountEl) totalLogCountEl.textContent = totalLogs;
        if (todayLogCountEl) todayLogCountEl.textContent = todayLogs.length;
        if (errorLogCountEl) errorLogCountEl.textContent = errorLogs.length;
        if (systemLogCountEl) systemLogCountEl.textContent = systemLogs.length;
    },
    
    // 获取筛选后的日志
    getFilteredLogs: function() {
        let filteredLogs = [...this.logs];
        
        // 时间筛选
        const startTime = document.getElementById('logStartTime')?.value;
        const endTime = document.getElementById('logEndTime')?.value;
        if (startTime) {
            const startDate = new Date(startTime);
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
        }
        if (endTime) {
            const endDate = new Date(endTime);
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
        }
        
        // 级别筛选
        const levelFilter = document.getElementById('logLevelFilter')?.value;
        if (levelFilter) {
            filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
        }
        
        // 类型筛选
        const typeFilter = document.getElementById('logTypeFilter')?.value;
        if (typeFilter) {
            filteredLogs = filteredLogs.filter(log => log.type === typeFilter);
        }
        
        return filteredLogs;
    },
    
    // 渲染日志表格
    renderLogs: function() {
        const filteredLogs = this.getFilteredLogs();
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, filteredLogs.length);
        const pageLogs = filteredLogs.slice(startIndex, endIndex);
        
        const tbody = document.getElementById('logTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        pageLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="log-level-badge log-level-${log.level}">${this.getLevelText(log.level)}</span>
                </td>
                <td>${this.formatTime(log.timestamp)}</td>
                <td>${this.getTypeText(log.type)}</td>
                <td>${log.user}</td>
                <td>${log.description}</td>
                <td>${log.details ? '有详细信息' : '-'}</td>
                <td>${log.ip}</td>
                <td>
                    <button class="btn btn-primary" onclick="showLogDetails(${log.id})">查看</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.updatePagination(filteredLogs.length);
    },
    
    // 更新分页信息
    updatePagination: function(totalLogs) {
        const totalPages = Math.ceil(totalLogs / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, totalLogs);
        
        const currentStartEl = document.getElementById('currentStart');
        const currentEndEl = document.getElementById('currentEnd');
        const totalLogsEl = document.getElementById('totalLogs');
        const currentPageEl = document.getElementById('currentPage');
        const totalPagesEl = document.getElementById('totalPages');
        
        if (currentStartEl) currentStartEl.textContent = startIndex + 1;
        if (currentEndEl) currentEndEl.textContent = endIndex;
        if (totalLogsEl) totalLogsEl.textContent = totalLogs;
        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
    },
    
    // 获取级别文本
    getLevelText: function(level) {
        const levelTexts = {
            'info': '信息',
            'warning': '警告',
            'error': '错误',
            'success': '成功'
        };
        return levelTexts[level] || level;
    },
    
    // 获取类型文本
    getTypeText: function(type) {
        const typeTexts = {
            'page_access': '页面访问',
            'data_change': '数据变更',
            'system_config': '系统配置',
            'user_action': '用户操作'
        };
        return typeTexts[type] || type;
    },
    
    // 格式化时间
    formatTime: function(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    },
    
    // 显示日志详情
    showLogDetails: function(logId) {
        const log = this.logs.find(l => l.id === logId);
        if (log) {
            const modalLogId = document.getElementById('modalLogId');
            const modalLogTime = document.getElementById('modalLogTime');
            const modalLogLevel = document.getElementById('modalLogLevel');
            const modalLogType = document.getElementById('modalLogType');
            const modalLogUser = document.getElementById('modalLogUser');
            const modalLogDescription = document.getElementById('modalLogDescription');
            const modalLogDetails = document.getElementById('modalLogDetails');
            const modalLogIp = document.getElementById('modalLogIp');
            const logModal = document.getElementById('logModal');
            
            if (modalLogId) modalLogId.textContent = log.id;
            if (modalLogTime) modalLogTime.textContent = this.formatTime(log.timestamp);
            if (modalLogLevel) modalLogLevel.textContent = this.getLevelText(log.level);
            if (modalLogType) modalLogType.textContent = this.getTypeText(log.type);
            if (modalLogUser) modalLogUser.textContent = log.user;
            if (modalLogDescription) modalLogDescription.textContent = log.description;
            if (modalLogDetails) modalLogDetails.textContent = log.details || '无详细信息';
            if (modalLogIp) modalLogIp.textContent = log.ip;
            if (logModal) logModal.style.display = 'flex';
        }
    },
    
    // 导出日志
    exportLogs: function() {
        const filteredLogs = this.getFilteredLogs();
        const csvContent = this.convertToCSV(filteredLogs);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    },
    
    // 转换为CSV格式
    convertToCSV: function(logs) {
        const headers = ['ID', '时间', '级别', '类型', '用户', '描述', '详细信息', 'IP地址'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.id,
                this.formatTime(log.timestamp),
                this.getLevelText(log.level),
                this.getTypeText(log.type),
                log.user,
                `"${log.description}"`,
                `"${log.details || ''}"`,
                log.ip
            ].join(','))
        ].join('\n');
        
        return '\ufeff' + csvContent; // 添加BOM以支持中文
    }
};
