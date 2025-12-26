// ================= 日志管理页面功能 =================

import { LogSystem } from '../modules/logSystem.js';
import { UiUtils } from '../modules/ui-utils.js';

export const LogsPage = {
    // 初始化日志管理页面
    init: function() {
        // 初始化日志数据
        LogSystem.loadLogs();
        LogSystem.updateStatistics();
        LogSystem.renderLogs();
        
        // 定期清理过期日志
        setInterval(() => {
            LogSystem.cleanupOldLogs(30); // 30天前
        }, 24 * 60 * 60 * 1000); // 每天检查一次
        
        // 页面卸载时保存日志
        window.addEventListener('beforeunload', () => {
            LogSystem.saveLogs();
        });
    },
    
    // 筛选日志
    filterLogs: function() {
        LogSystem.currentPage = 1; // 重置到第一页
        LogSystem.renderLogs();
        
        // 记录筛选操作日志
        const startTime = document.getElementById('logStartTime')?.value;
        const endTime = document.getElementById('logEndTime')?.value;
        const levelFilter = document.getElementById('logLevelFilter')?.value;
        const typeFilter = document.getElementById('logTypeFilter')?.value;
        
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `筛选日志`, 
            JSON.stringify({ startTime, endTime, levelFilter, typeFilter }), 
            'System'
        );
    },
    
    // 重置筛选条件
    resetLogFilter: function() {
        document.getElementById('logStartTime').value = '';
        document.getElementById('logEndTime').value = '';
        document.getElementById('logLevelFilter').value = '';
        document.getElementById('logTypeFilter').value = '';
        
        LogSystem.currentPage = 1;
        LogSystem.renderLogs();
        
        // 记录重置筛选操作日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `重置日志筛选条件`, 
            '', 
            'System'
        );
    },
    
    // 关闭日志详情模态框
    closeLogModal: function() {
        UiUtils.closeModal('logModal');
    },
    
    // 显示日志详情
    showLogDetails: function(logId) {
        LogSystem.showLogDetails(logId);
    },
    
    // 导出日志
    exportLogs: function() {
        LogSystem.exportLogs();
    },
    
    // 分页导航功能
    goToFirstPage: function() {
        if (LogSystem.currentPage > 1) {
            LogSystem.currentPage = 1;
            LogSystem.renderLogs();
        }
    },
    
    goToPrevPage: function() {
        if (LogSystem.currentPage > 1) {
            LogSystem.currentPage--;
            LogSystem.renderLogs();
        }
    },
    
    goToNextPage: function() {
        const filteredLogs = LogSystem.getFilteredLogs();
        const totalPages = Math.ceil(filteredLogs.length / LogSystem.pageSize);
        if (LogSystem.currentPage < totalPages) {
            LogSystem.currentPage++;
            LogSystem.renderLogs();
        }
    },
    
    goToLastPage: function() {
        const filteredLogs = LogSystem.getFilteredLogs();
        const totalPages = Math.ceil(filteredLogs.length / LogSystem.pageSize);
        if (LogSystem.currentPage < totalPages) {
            LogSystem.currentPage = totalPages;
            LogSystem.renderLogs();
        }
    }
};
