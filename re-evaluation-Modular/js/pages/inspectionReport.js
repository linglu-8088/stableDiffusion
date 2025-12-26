// ================= 检验报表页面模块 =================

import { LogSystem } from '../modules/logSystem.js';

export const InspectionReportPage = {
    // 初始化检验报表页面
    init: function() {
        try {
            console.log('🚀 InspectionReportPage: 开始初始化');
            this.initEventListeners();
            this.setDefaultDateTime();
        } catch (error) {
            console.error('❌ InspectionReportPage 初始化失败:', error);
        }
    },
    
    // 页面显示时的处理
    onPageShow: function() {
        console.log('📱 InspectionReportPage: 页面显示');
        this.generateMockData();
        this.renderTable(this.mockData);
    },
    
    // 初始化事件监听器
    initEventListeners: function() {
        // 查询按钮
        const queryBtn = document.getElementById('queryBtn');
        if (queryBtn) {
            queryBtn.addEventListener('click', () => {
                this.handleQuery();
            });
        }
        
        // 清空按钮
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.handleClear();
            });
        }
        
        // 导出按钮
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.handleExport();
            });
        }
    },
    
    // 设置默认日期时间（今天）
    setDefaultDateTime: function() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const today = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        
        if (startTimeInput) {
            // 默认设置为今天早上8点
            startTimeInput.value = `${year}-${month}-${day}T08:00`;
        }
        
        if (endTimeInput) {
            // 默认设置为当前时间
            endTimeInput.value = today;
        }
    },
    
    // 生成模拟数据
    generateMockData: function() {
        const inspectors = ['张三', '李四', '王五'];
        const machines = ['AOI-01', 'AOI-02', 'AOI-03'];
        const partNumbers = ['PN-001', 'PN-002', 'PN-003', 'PN-004'];
        const lotNumbers = ['LOT-20231223-01', 'LOT-20231223-02', 'LOT-20231223-03', 'LOT-20231223-04'];
        
        const data = [];
        
        // 生成5-8条随机数据
        const count = Math.floor(Math.random() * 4) + 5;
        
        for (let i = 0; i < count; i++) {
            const totalPanels = Math.floor(Math.random() * 500) + 100;
            const ngRate = Math.random() * 10; // 0-10%的不良率
            const ngPanels = Math.floor(totalPanels * ngRate / 100);
            const okPanels = totalPanels - ngPanels;
            
            // 生成开始时间（最近7天内）
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 7));
            startDate.setHours(Math.floor(Math.random() * 8) + 8); // 8-16点
            startDate.setMinutes(Math.floor(Math.random() * 60));
            
            // 生成结束时间（开始时间后2-8小时）
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 6) + 2);
            
            data.push({
                id: i + 1,
                startTime: this.formatDateTime(startDate),
                endTime: this.formatDateTime(endDate),
                device: machines[Math.floor(Math.random() * machines.length)],
                partNo: partNumbers[Math.floor(Math.random() * partNumbers.length)],
                lotNo: lotNumbers[Math.floor(Math.random() * lotNumbers.length)],
                inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
                totalPanels: totalPanels,
                okPanels: okPanels,
                ngPanels: ngPanels,
                ngRate: ngRate.toFixed(2)
            });
        }
        
        this.mockData = data;
        return data;
    },
    
    // 格式化日期时间
    formatDateTime: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 渲染表格
    renderTable: function(data) {
        const tableBody = document.getElementById('inspectionTableBody');
        if (!tableBody) return;
        
        // 清空现有数据
        tableBody.innerHTML = '';
        
        // 如果没有数据，显示提示信息
        if (!data || data.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="10" style="text-align: center; padding: 20px; color: var(--text-secondary);">暂无数据</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // 渲染数据行
        data.forEach(item => {
            const row = document.createElement('tr');
            
            // 不良率使用红色字体高亮显示
            const ngRateClass = parseFloat(item.ngRate) > 5 ? 'ng-rate-high' : 'ng-rate-normal';
            
            row.innerHTML = `
                <td>${item.startTime}</td>
                <td>${item.endTime}</td>
                <td>${item.device}</td>
                <td>${item.partNo}</td>
                <td>${item.lotNo}</td>
                <td>${item.inspector}</td>
                <td>${item.totalPanels}</td>
                <td>${item.okPanels}</td>
                <td>${item.ngPanels}</td>
                <td class="${ngRateClass}">${item.ngRate}%</td>
            `;
            
            tableBody.appendChild(row);
        });
    },
    
    // 处理查询
    handleQuery: function() {
        try {
            // 记录日志
            if (LogSystem && LogSystem.addLog) {
                LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.OPERATION, '查询检验报表', '', 'InspectionReport');
            }
            
            // 显示加载状态
            this.showLoading(true);
            
            // 模拟查询延迟
            setTimeout(() => {
                // 获取筛选条件
                const inspector = document.getElementById('inspectorSelect').value;
                const machine = document.getElementById('machineSelect').value;
                const startTime = document.getElementById('startTime').value;
                const endTime = document.getElementById('endTime').value;
                
                // 重新生成模拟数据（模拟查询结果）
                this.generateMockData();
                
                // 随机打乱数据顺序，模拟刷新效果
                const shuffledData = [...this.mockData].sort(() => Math.random() - 0.5);
                
                // 渲染表格
                this.renderTable(shuffledData);
                
                // 隐藏加载状态
                this.showLoading(false);
                
                console.log('查询完成', { inspector, machine, startTime, endTime });
            }, 800);
        } catch (error) {
            console.error('查询失败:', error);
            this.showLoading(false);
        }
    },
    
    // 处理清空
    handleClear: function() {
        try {
            // 记录日志
            if (LogSystem && LogSystem.addLog) {
                LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.OPERATION, '清空检验报表筛选条件', '', 'InspectionReport');
            }
            
            // 重置筛选条件
            document.getElementById('inspectorSelect').value = '';
            document.getElementById('machineSelect').value = '';
            this.setDefaultDateTime();
            
            // 重新生成数据并渲染
            this.generateMockData();
            this.renderTable(this.mockData);
            
            console.log('筛选条件已清空');
        } catch (error) {
            console.error('清空失败:', error);
        }
    },
    
    // 处理导出
    handleExport: function() {
        try {
            // 记录日志
            if (LogSystem && LogSystem.addLog) {
                LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.OPERATION, '导出检验报表', '', 'InspectionReport');
            }
            
            // 模拟导出操作
            this.showLoading(true);
            
            setTimeout(() => {
                this.showLoading(false);
                alert('检验报表导出成功！模拟导出到 Excel 文件。');
                console.log('导出完成');
            }, 1000);
        } catch (error) {
            console.error('导出失败:', error);
            this.showLoading(false);
        }
    },
    
    // 显示/隐藏加载状态
    showLoading: function(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
};