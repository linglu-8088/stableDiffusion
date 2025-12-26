// ================= 趋势分析页面 =================

// 导入必要的模块
import { LogSystem } from '../modules/logSystem.js';
import { UiUtils } from '../modules/ui-utils.js';

// 趋势分析页面对象
const TrendsPage = {
    // ECharts实例存储
    chartInstances: {},
    
    // 页面是否已初始化
    isInitialized: false,
    
    // 模拟数据
    mockData: {
        // Yield数据
        yieldData: {
            '1stYield': 67.58,
            '2ndYield': 98.2,
            'totalYield': 66.5,
            'aosShapeOk': 95.8,
            'defectRate': 33.5,
            'efficiency': 89.2
        },
        
        // 汇总数据
        yieldViews: [
            {
                itemNumber: 'ITEM001',
                total: 1250,
                firstDefected: 405,
                firstNonDefected: 845,
                firstYield: '67.58%',
                aosShapeOk: 1198,
                secondYield: '98.20%'
            },
            {
                itemNumber: 'ITEM002',
                total: 1180,
                firstDefected: 389,
                firstNonDefected: 791,
                firstYield: '67.05%',
                aosShapeOk: 1131,
                secondYield: '97.85%'
            },
            {
                itemNumber: 'ITEM003',
                total: 1320,
                firstDefected: 428,
                firstNonDefected: 892,
                firstYield: '67.58%',
                aosShapeOk: 1265,
                secondYield: '98.15%'
            },
            {
                itemNumber: 'ITEM004',
                total: 980,
                firstDefected: 318,
                firstNonDefected: 662,
                firstYield: '67.55%',
                aosShapeOk: 939,
                secondYield: '98.10%'
            },
            {
                itemNumber: 'ITEM005',
                total: 1450,
                firstDefected: 470,
                firstNonDefected: 980,
                firstYield: '67.59%',
                aosShapeOk: 1391,
                secondYield: '98.05%'
            }
        ],
        
        // Top 10缺陷数据
        topDefects: [
            {
                defectType: 'Open/Cut',
                openCut: 379,
                short: 0,
                missing: 0,
                threshold: 350,
                affectedUnits: 379
            },
            {
                defectType: 'Short',
                openCut: 0,
                short: 162,
                missing: 0,
                threshold: 150,
                affectedUnits: 162
            },
            {
                defectType: 'Missing',
                openCut: 0,
                short: 0,
                missing: 89,
                threshold: 80,
                affectedUnits: 89
            },
            {
                defectType: 'Pin Hole',
                openCut: 45,
                short: 0,
                missing: 0,
                threshold: 50,
                affectedUnits: 45
            },
            {
                defectType: 'Scratch',
                openCut: 0,
                short: 0,
                missing: 0,
                threshold: 30,
                affectedUnits: 28
            },
            {
                defectType: 'Chip',
                openCut: 0,
                short: 0,
                missing: 0,
                threshold: 25,
                affectedUnits: 23
            },
            {
                defectType: 'Crack',
                openCut: 12,
                short: 0,
                missing: 0,
                threshold: 20,
                affectedUnits: 12
            },
            {
                defectType: 'Stain',
                openCut: 0,
                short: 0,
                missing: 0,
                threshold: 15,
                affectedUnits: 14
            },
            {
                defectType: 'Particle',
                openCut: 0,
                short: 0,
                missing: 0,
                threshold: 10,
                affectedUnits: 8
            },
            {
                defectType: 'Void',
                openCut: 0,
                short: 0,
                missing: 0,
                threshold: 8,
                affectedUnits: 6
            }
        ]
    },

    // 初始化页面
    init() {
        try {
            console.log('🚀 TrendsPage.init() 开始初始化');
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initPage());
            } else {
                this.initPage();
            }
        } catch (error) {
            console.error('TrendsPage initialization failed:', error);
            LogSystem.addLog(
                LogSystem.levels.ERROR,
                LogSystem.types.SYSTEM_CONFIG,
                '趋势分析页面初始化失败',
                JSON.stringify({ error: error.message }),
                'TrendsPage'
            );
        }
    },

    // 初始化页面内容
    initPage() {
        console.log('📋 TrendsPage.initPage() 开始初始化页面内容');
        
        // 记录页面访问日志
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.PAGE_ACCESS,
            '访问趋势分析页面',
            '',
            'TrendsPage'
        );

        // 不在init中直接画图，延迟到onPageShow中执行
        console.log('⏳ 图表初始化将延迟到 onPageShow 中执行');
        
        // 渲染表格（不受display:none影响）
        this.renderTables();
        
        // 绑定筛选事件
        this.bindFilterEvents();
        
        // 绑定窗口resize事件
        this.bindResizeEvents();
        
        // 标记为已初始化
        this.isInitialized = true;
        console.log('✅ TrendsPage 初始化完成');
    },

    // 初始化图表（延迟执行）
    initCharts() {
        console.log('📊 TrendsPage.initCharts() 开始初始化图表');
        
        // 安全检查：检查ECharts是否存在
        if (typeof window.echarts === 'undefined') {
            console.error('❌ ECharts 库未加载，无法初始化图表');
            
            // 在界面显示错误信息
            this.showChartLoadError('图表加载失败：ECharts 库未加载');
            return false;
        }
        
        console.log('✅ ECharts 库已加载，版本:', window.echarts.version);
        
        try {
            // 初始化6个仪表盘
            this.createGaugeChart('gauge1stYield', '1st Yield', this.mockData.yieldData['1stYield'], '#52c41a');
            this.createGaugeChart('gauge2ndYield', '2nd Yield', this.mockData.yieldData['2ndYield'], '#52c41a');
            this.createGaugeChart('gaugeTotalYield', 'Total Yield', this.mockData.yieldData['totalYield'], '#1890ff');
            this.createGaugeChart('gaugeAosShape', 'AOS Shape OK', this.mockData.yieldData['aosShapeOk'], '#52c41a');
            this.createGaugeChart('gaugeDefectRate', 'Defect Rate', this.mockData.yieldData['defectRate'], '#faad14');
            this.createGaugeChart('gaugeEfficiency', 'Efficiency', this.mockData.yieldData['efficiency'], '#13c2c2');
            
            console.log(`✅ 成功初始化 ${Object.keys(this.chartInstances).length} 个图表`);
            return true;
        } catch (error) {
            console.error('❌ 图表初始化失败:', error);
            this.showChartLoadError('图表初始化失败: ' + error.message);
            return false;
        }
    },

    // 创建仪表盘图表
    createGaugeChart(containerId, title, value, color) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const chart = echarts.init(container);
        
        // 根据值确定颜色
        let gaugeColor = color;
        if (value >= 90) {
            gaugeColor = '#52c41a'; // 绿色
        } else if (value >= 75) {
            gaugeColor = '#faad14'; // 黄色
        } else {
            gaugeColor = '#ff4d4f'; // 红色
        }

        const option = {
            title: {
                text: title,
                left: 'center',
                bottom: '5%',
                textStyle: {
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#262626'
                }
            },
            series: [
                {
                    type: 'gauge',
                    center: ['50%', '70%'],
                    radius: '100%',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    itemStyle: {
                        color: gaugeColor,
                        shadowColor: 'rgba(0,0,0,0.3)',
                        shadowBlur: 10,
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    progress: {
                        show: true,
                        roundCap: true,
                        width: 15
                    },
                    pointer: {
                        show: false // 移除指针
                    },
                    axisLine: {
                        roundCap: true,
                        lineStyle: {
                            width: 15,
                            color: '#e8e8e8'
                        }
                    },
                    axisTick: {
                        show: true,
                        splitNumber: 5,
                        lineStyle: {
                            color: '#ccc',
                            width: 1
                        },
                        distance: -5
                    },
                    splitLine: {
                        show: true,
                        length: 8,
                        lineStyle: {
                            color: '#999',
                            width: 2
                        },
                        distance: -8
                    },
                    axisLabel: {
                        show: true,
                        fontSize: 8,
                        color: '#666',
                        distance: -15,
                        formatter: function(value) {
                            return value % 20 === 0 ? value : '';
                        }
                    },
                    detail: {
                        valueFormatter: function(value) {
                            return value.toFixed(1) + '%';
                        },
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: gaugeColor,
                        offsetCenter: [0, '20%']
                    },
                    data: [
                        {
                            value: value
                        }
                    ]
                }
            ]
        };

        chart.setOption(option);
        this.chartInstances[containerId] = chart;

        // 添加鼠标悬停效果
        chart.on('mouseover', function(params) {
            container.style.transform = 'scale(1.02)';
            container.style.transition = 'transform 0.3s';
        });

        chart.on('mouseout', function(params) {
            container.style.transform = 'scale(1)';
        });
    },

    // 渲染表格
    renderTables() {
        console.log('📊 正在渲染表格，数据量:', this.mockData.yieldViews.length);
        this.renderYieldTable();
        this.renderDefectStatsTable();
        console.log('✅ 表格渲染完成');
    },

    // 渲染Yield汇总表
    renderYieldTable() {
        const tbody = document.getElementById('yieldTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.mockData.yieldViews.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemNumber}</td>
                <td>${item.total}</td>
                <td class="yield-danger">${item.firstDefected}</td>
                <td class="yield-good">${item.firstNonDefected}</td>
                <td class="${this.getYieldClass(item.firstYield)}">${item.firstYield}</td>
                <td class="yield-good">${item.aosShapeOk}</td>
                <td class="${this.getYieldClass(item.secondYield)}">${item.secondYield}</td>
            `;
            tbody.appendChild(row);
        });
    },

    // 渲染缺陷统计表
    renderDefectStatsTable() {
        const tbody = document.getElementById('defectStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // 创建转置表格结构：4行数据（Defect count, Panel average, Threshold, Affected Units）
        const metrics = [
            {
                name: 'Defect count',
                className: 'defect-count'
            },
            {
                name: 'Panel average',
                className: 'highlight-cell'
            },
            {
                name: 'Threshold',
                className: 'yield-warning'
            },
            {
                name: 'Affected Units',
                className: 'yield-good'
            }
        ];

        metrics.forEach((metric, rowIndex) => {
            const row = document.createElement('tr');
            let rowHTML = `<td class="metric-name">${metric.name}</td>`;
            
            // 为每个缺陷类型添加数据列
            this.mockData.topDefects.forEach((defect, defectIndex) => {
                let value = '';
                let valueClass = metric.className;
                
                switch(metric.name) {
                    case 'Defect count':
                        value = defect.openCut || defect.short || defect.missing || 0;
                        break;
                    case 'Panel average':
                        // 计算平均值（模拟数据）
                        const totalCount = defect.openCut || defect.short || defect.missing || 0;
                        value = (totalCount / 2).toFixed(1);
                        break;
                    case 'Threshold':
                        value = defect.threshold;
                        // 根据是否超阈值设置样式
                        if (defect.affectedUnits > defect.threshold) {
                            valueClass = 'yield-danger';
                        }
                        break;
                    case 'Affected Units':
                        value = defect.affectedUnits;
                        // 根据是否超阈值设置样式
                        if (defect.affectedUnits > defect.threshold) {
                            valueClass = 'yield-danger';
                        }
                        break;
                }
                
                rowHTML += `<td class="${valueClass}">${value}</td>`;
            });
            
            row.innerHTML = rowHTML;
            tbody.appendChild(row);
        });
    },

    // 获取Yield数值样式类
    getYieldClass(yieldStr) {
        const yieldValue = parseFloat(yieldStr);
        if (yieldValue >= 90) return 'yield-good';
        if (yieldValue >= 75) return 'yield-warning';
        return 'yield-danger';
    },

    // 绑定筛选事件
    bindFilterEvents() {
        const applyBtn = document.querySelector('[onclick="TrendsPage.applyFilter()"]');
        const resetBtn = document.querySelector('[onclick="TrendsPage.resetFilter()"]');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilter());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilter());
        }

        // 绑定输入框变化事件
        const filterInputs = ['trendsFromDate', 'trendsToDate', 'jobName', 'lotName', 'layerName', 'barcode'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.onFilterChange());
            }
        });
    },

    // 应用筛选
    applyFilter() {
        const filterData = {
            fromDate: document.getElementById('trendsFromDate').value,
            toDate: document.getElementById('trendsToDate').value,
            jobName: document.getElementById('jobName').value,
            lotName: document.getElementById('lotName').value,
            layerName: document.getElementById('layerName').value,
            barcode: document.getElementById('barcode').value
        };

        // 记录筛选操作
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '应用趋势分析筛选条件',
            JSON.stringify(filterData),
            'TrendsPage'
        );

        // 这里可以添加实际的数据筛选逻辑
        // 现在使用模拟数据，所以只显示提示
        this.showFilterResult('筛选条件已应用');
    },

    // 重置筛选
    resetFilter() {
        // 重置所有筛选条件
        document.getElementById('trendsFromDate').value = '2025-12-01';
        document.getElementById('trendsToDate').value = '2025-12-31';
        document.getElementById('jobName').value = '';
        document.getElementById('lotName').value = '';
        document.getElementById('layerName').value = '';
        document.getElementById('barcode').value = '';

        // 记录重置操作
        LogSystem.addLog(
            LogSystem.levels.INFO,
            LogSystem.types.USER_ACTION,
            '重置趋势分析筛选条件',
            '',
            'TrendsPage'
        );

        // 刷新数据
        this.refreshData();
        this.showFilterResult('筛选条件已重置');
    },

    // 筛选条件变化
    onFilterChange() {
        // 可以在这里添加实时筛选逻辑
        // 目前不实现，等待用户点击Apply按钮
    },

    // 显示筛选结果提示
    showFilterResult(message) {
        // 创建临时提示元素
        const toast = document.createElement('div');
        toast.className = 'filter-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--brand-color);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    },

    // 刷新数据
    refreshData() {
        // 重新渲染表格
        this.renderTables();
        
        // 重新渲染图表（带动画效果）
        Object.keys(this.chartInstances).forEach(chartId => {
            const chart = this.chartInstances[chartId];
            if (chart) {
                // 添加刷新动画
                chart.showLoading();
                setTimeout(() => {
                    this.updateChart(chartId);
                    chart.hideLoading();
                }, 500);
            }
        });
    },

    // 更新图表数据
    updateChart(chartId) {
        const chart = this.chartInstances[chartId];
        if (!chart) return;

        // 根据图表ID获取新的模拟数据
        let newValue, title;
        switch(chartId) {
            case 'gauge1stYield':
                title = '1st Yield';
                newValue = 65 + Math.random() * 10; // 65-75之间随机
                break;
            case 'gauge2ndYield':
                title = '2nd Yield';
                newValue = 95 + Math.random() * 5; // 95-100之间随机
                break;
            case 'gaugeTotalYield':
                title = 'Total Yield';
                newValue = 60 + Math.random() * 15; // 60-75之间随机
                break;
            case 'gaugeAosShape':
                title = 'AOS Shape OK';
                newValue = 90 + Math.random() * 10; // 90-100之间随机
                break;
            case 'gaugeDefectRate':
                title = 'Defect Rate';
                newValue = 20 + Math.random() * 20; // 20-40之间随机
                break;
            case 'gaugeEfficiency':
                title = 'Efficiency';
                newValue = 80 + Math.random() * 15; // 80-95之间随机
                break;
        }

        // 更新图表选项
        const option = chart.getOption();
        option.series[0].data[0].value = newValue;
        
        // 更新颜色
        let gaugeColor;
        if (newValue >= 90) {
            gaugeColor = '#52c41a';
        } else if (newValue >= 75) {
            gaugeColor = '#faad14';
        } else {
            gaugeColor = '#ff4d4f';
        }
        
        option.series[0].itemStyle.color = gaugeColor;
        option.series[0].detail.color = gaugeColor;
        option.title.text = title;
        
        chart.setOption(option);
    },

    // 绑定窗口resize事件
    bindResizeEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                Object.values(this.chartInstances).forEach(chart => {
                    if (chart) {
                        chart.resize();
                    }
                });
            }, 300);
        });
    },

    // 显示图表加载错误
    showChartLoadError(errorMessage) {
        // 在图表容器区域显示错误信息
        const chartsSection = document.querySelector('.charts-section');
        if (chartsSection) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chart-error-message';
            errorDiv.style.cssText = `
                background: #ff4d4f;
                color: white;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                text-align: center;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(255,77,79,0.3);
            `;
            errorDiv.innerHTML = `⚠️ ${errorMessage}`;
            
            // 插入到图表区域前面
            chartsSection.parentNode.insertBefore(errorDiv, chartsSection);
        }
        
        console.error('图表加载错误:', errorMessage);
    },

    // 页面显示时调用
    onPageShow() {
        console.log('📱 TrendsPage.onPageShow() 开始执行');
        
        // 如果页面未初始化，先初始化
        if (!this.isInitialized) {
            console.log('🔄 页面未初始化，先执行初始化');
            this.initPage();
        }
        
        // 如果图表还未创建，先创建图表
        if (Object.keys(this.chartInstances).length === 0) {
            console.log('🔄 图表未创建，先执行图表初始化');
            this.initCharts();
        }
        
        // 强制resize所有图表实例 - 这是解决白屏的关键
        setTimeout(() => {
            console.log('🔧 开始强制resize所有图表实例');
            let resizeCount = 0;
            
            Object.values(this.chartInstances).forEach((chart, index) => {
                if (chart) {
                    try {
                        chart.resize();
                        resizeCount++;
                        console.log(`✅ 图表 ${index + 1} resize 成功`);
                    } catch (error) {
                        console.error(`❌ 图表 ${index + 1} resize 失败:`, error);
                    }
                }
            });
            
            console.log(`📊 总共 resize 了 ${resizeCount} 个图表实例`);
        }, 50); // 减少延时，让图表更快响应
    },

    // 页面隐藏时调用
    onPageHide() {
        console.log('👋 TrendsPage.onPageShow() 页面隐藏');
        // 可以在这里清理资源
    }
};

// 添加CSS动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .filter-toast {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// 导出页面对象
export { TrendsPage };
