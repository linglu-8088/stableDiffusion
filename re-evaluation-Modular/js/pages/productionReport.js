// ================= 生产报表页面模块 =================

import { LogSystem } from '../modules/logSystem.js';

export const ProductionReportPage = {
    currentTab: 'realtime',
    chartInstances: {},
    
    // 初始化生产报表页面
    init: function() {
        try {
            console.log('🚀 ProductionReportPage: 开始初始化');
            this.initTabs();
            this.initResizeHandler();
        } catch (error) {
            console.error('❌ ProductionReportPage 初始化失败:', error);
        }
    },
    
    // 页面显示时的处理
    onPageShow: function() {
        console.log('📱 ProductionReportPage: 页面显示');
        this.switchTab('realtime');
    },
    
    // 初始化Tab切换
    initTabs: function() {
        // 事件绑定已在全局函数 switchReportTab 中处理，这里只需保留逻辑框架
    },

    // 初始化窗口resize处理器
    initResizeHandler: function() {
        window.addEventListener('resize', () => {
            // 延迟执行resize，确保性能
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.resizeAllCharts();
            }, 200);
        });
    },

    // 调整所有图表尺寸
    resizeAllCharts: function() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && !chart.isDisposed()) {
                chart.resize();
            }
        });
    },
    
    // 切换Tab并初始化对应图表
    switchTab: function(tabName) {
        try {
            console.log(`📊 切换Tab至: ${tabName}`);

            // 1. UI状态更新
            document.querySelectorAll('.production-tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

            document.querySelectorAll('.production-tab-content').forEach(c => c.classList.remove('active'));

            // Tab名称到DOM ID的映射
            const tabIdMap = {
                'realtime': 'realtimeTab',
                'capacity': 'capacityTab',
                'filter-rate': 'filterRateTab',
                'leakage-rate': 'leakageRateTab',
                'detection-rate': 'detectionRateTab'
            };

            const targetTabId = tabIdMap[tabName];
            const targetTabContent = targetTabId ? document.getElementById(targetTabId) : null;

            if (targetTabContent) {
                targetTabContent.classList.add('active');
                // 强制浏览器重新计算布局
                targetTabContent.offsetHeight; // 触发reflow
                console.log(`✅ Tab内容激活成功: ${targetTabId}`);
            } else {
                console.error(`❌ 找不到Tab内容元素: ${targetTabId}`);
                return;
            }

            this.currentTab = tabName;

            // 2. 延迟初始化图表（等待DOM完全渲染和CSS过渡完成）
            setTimeout(() => {
                // 再次确认Tab是激活状态
                if (targetTabContent && targetTabContent.classList.contains('active')) {
                    console.log(`📈 开始初始化 ${tabName} 图表`);
                    if (tabName === 'realtime') {
                        this.initRealtimeCharts();
                    } else if (tabName === 'capacity') {
                        this.initCapacityCharts();
                    } else if (tabName === 'filter-rate') {
                        this.initRateChart('chart-rate-filter', '筛选率', '#1890ff', 15);
                    } else if (tabName === 'leakage-rate') {
                        this.initRateChart('chart-rate-leakage', '漏出率', '#faad14', 5);
                    } else if (tabName === 'detection-rate') {
                        this.initRateChart('chart-rate-detection', '检出率', '#52c41a', 95);
                    }
                } else {
                    console.warn(`⚠️ Tab内容未正确激活: ${tabName} (ID: ${targetTabId})`);
                }
            }, 400);

        } catch (error) {
            console.error('❌ switchTab 失败:', error);
        }
    },

    // ================== 图表初始化函数 ==================

    // 1. 初始化实时看板的4个图表
    initRealtimeCharts: function() {
        console.log('📈 初始化实时看板图表');
        
        // Chart 1: 设备时段产能 (折线)
        this.renderChart('chart-rt-device', {
            title: { text: '设备时段产能 Trend', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00'] },
            yAxis: { type: 'value' },
            series: [{ 
                type: 'line', 
                data: [1200, 1320, 1010, 1340, 900, 2300, 2100, 2000, 1800], 
                smooth: true, 
                itemStyle: { color: '#1890ff' } 
            }]
        });

        // Chart 2: 人员时段产能 (折线)
        this.renderChart('chart-rt-person', {
            title: { text: '人员时段产能 Trend', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00'] },
            yAxis: { type: 'value' },
            series: [{ 
                type: 'line', 
                data: [800, 900, 850, 920, 880, 950, 1000, 980, 960], 
                smooth: true, 
                itemStyle: { color: '#52c41a' } 
            }]
        });

        // Chart 3: AI过滤 Trend (柱状+折线)
        this.renderChart('chart-rt-ai', {
            title: { text: 'AI过滤 Trend', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['总数', '过滤率'], bottom: 0 },
            xAxis: { type: 'category', data: ['0:00','2:00','4:00','6:00','8:00'] },
            yAxis: [
                { type: 'value', name: '数量' },
                { type: 'value', name: '比率', max: 100, axisLabel: { formatter: '{value} %' } }
            ],
            series: [
                { name: '总数', type: 'bar', data: [500, 600, 550, 700, 650], itemStyle: { color: '#faad14' } },
                { name: '过滤率', type: 'line', yAxisIndex: 1, data: [85, 88, 82, 90, 87], itemStyle: { color: '#1890ff' } }
            ]
        });

        // Chart 4: 缺陷分布 (柱状)
        this.renderChart('chart-rt-defect', {
            title: { text: '缺陷分布', left: 'center' },
            tooltip: { trigger: 'item' },
            xAxis: { type: 'category', data: ['划痕', '氧化', '异物', '短路', '开路'] },
            yAxis: { type: 'value' },
            series: [{ 
                type: 'bar', 
                data: [120, 200, 150, 80, 70], 
                itemStyle: { color: '#13c2c2' } 
            }]
        });
    },

    // 2. 初始化产能页面的2个图表
    initCapacityCharts: function() {
        console.log('📈 初始化产能图表');

        // AVI 设备产能 Trend (双Y轴组合图)
        this.renderChart('chart-cap-avi', {
            title: { text: 'AVI 设备产能 Trend', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['日班', '晚班', '打标数'], bottom: 0 },
            xAxis: { type: 'category', data: ['5/15','5/16','5/17','5/18','5/19','5/20'] },
            yAxis: [
                { type: 'value', name: '产量' },
                { type: 'value', name: '打标数' }
            ],
            series: [
                { name: '日班', type: 'bar', stack: 'total', data: [3000, 3200, 3100, 3400, 3300, 3500], itemStyle: { color: '#ff4d4f' } },
                { name: '晚班', type: 'bar', stack: 'total', data: [2800, 2900, 3000, 3100, 3200, 3100], itemStyle: { color: '#faad14' } },
                { name: '打标数', type: 'line', yAxisIndex: 1, data: [150, 180, 160, 200, 190, 210], itemStyle: { color: '#1890ff' } }
            ]
        });

        // VRS 产能 Trend (双Y轴组合图)
        this.renderChart('chart-cap-vrs', {
            title: { text: 'VRS 产能 Trend', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['日班', '晚班', '打标数'], bottom: 0 },
            xAxis: { type: 'category', data: ['5/15','5/16','5/17','5/18','5/19','5/20'] },
            yAxis: [
                { type: 'value', name: '产量' },
                { type: 'value', name: '打标数' }
            ],
            series: [
                { name: '日班', type: 'bar', stack: 'total', data: [2500, 2600, 2700, 2800, 2600, 2900], itemStyle: { color: '#52c41a' } },
                { name: '晚班', type: 'bar', stack: 'total', data: [2300, 2400, 2500, 2600, 2400, 2500], itemStyle: { color: '#1890ff' } },
                { name: '打标数', type: 'line', yAxisIndex: 1, data: [120, 140, 130, 150, 180, 170], itemStyle: { color: '#faad14' } }
            ]
        });
    },

    // 3. 初始化通用的率图表 (筛选率/漏出率/检出率)
    initRateChart: function(containerId, title, color, targetValue) {
        console.log(`📈 初始化${title}图表`);

        const hours = Array.from({length: 12}, (_, i) => `${i+8}:00`); // 8:00 - 19:00
        const data = hours.map(() => {
            if (targetValue > 80) return 90 + Math.random() * 8; // 高位数据 (检出率: 90-98%)
            if (targetValue < 20) return Math.random() * 10 + 5; // 低位数据 (漏出率: 5-15%)
            return 40 + Math.random() * 20; // 中位数据 (筛选率: 40-60%)
        });

        this.renderChart(containerId, {
            title: { text: `${title}走势图`, left: 'center' },
            tooltip: { 
                trigger: 'axis',
                formatter: function(params) {
                    return `时间: ${params[0].axisValueLabel}<br/>${params[0].seriesName}: ${params[0].value}%`;
                }
            },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { 
                type: 'category', 
                data: hours,
                name: '时间点',
                axisLabel: { formatter: '{value}时' }
            },
            yAxis: { 
                type: 'value', 
                name: '百分比', 
                min: 0, 
                max: 100,
                axisLabel: { formatter: '{value}%' }
            },
            series: [{
                name: title,
                type: 'line',
                data: data,
                smooth: true,
                lineStyle: { color, width: 3 },
                itemStyle: { color },
                markLine: {
                    data: [{ yAxis: targetValue, name: 'Target' }],
                    lineStyle: { color: '#ff4d4f', type: 'dashed', width: 2 },
                    label: { 
                        formatter: `Target ${targetValue}%`, 
                        position: 'end', 
                        color: '#ff4d4f', 
                        fontWeight: 'bold' 
                    }
                }
            }]
        });
    },

    // ================== 通用渲染函数 ==================
    
    // 通用渲染函数：负责 echarts.init, setOption 和 resize
    renderChart: function(id, option, retryCount = 0) {
        const container = document.getElementById(id);
        if (!container) {
            console.warn(`⚠️ 找不到图表容器: #${id}`);
            return;
        }

        // 检查容器是否可见和有尺寸
        const rect = container.getBoundingClientRect();
        const isVisible = container.offsetWidth > 0 && container.offsetHeight > 0;

        // 也检查父容器是否有尺寸
        const parent = container.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : null;
        const parentVisible = parent && parent.offsetWidth > 0 && parent.offsetHeight > 0;

        if (!isVisible || rect.width === 0 || rect.height === 0 || !parentVisible || (parentRect && parentRect.width === 0)) {
            if (retryCount < 10) { // 最多重试10次
                console.warn(`⚠️ 图表容器尺寸为0，延迟渲染: #${id} (${rect.width}x${rect.height}), 重试 ${retryCount + 1}/10`);
                // 使用requestAnimationFrame确保DOM更新完成
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.renderChart(id, option, retryCount + 1);
                    }, 50);
                });
                return;
            } else {
                console.error(`❌ 图表容器渲染失败，已达到最大重试次数: #${id}`);
                return;
            }
        }

        // 如果实例已存在，先销毁（防止内存泄漏）
        if (this.chartInstances[id]) {
            this.chartInstances[id].dispose();
        }

        // 初始化新实例
        const chart = echarts.init(container);
        chart.setOption(option);

        // 强制 resize 确保宽度正确（解决 display:none 导致的宽度为0问题）
        chart.resize();

        // 保存实例引用
        this.chartInstances[id] = chart;

        console.log(`✅ 图表渲染成功: #${id} (${rect.width}x${rect.height})`);
    }
};
