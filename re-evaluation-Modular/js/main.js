// ================= 主入口文件 =================

// 在顶层导入模块
import { LogSystem } from './modules/logSystem.js';
import { Router } from './modules/router.js';
import { UiUtils } from './modules/ui-utils.js';
import { WarningPage } from './pages/warning.js';
import { MappingPage } from './pages/mapping.js';
import { LogsPage } from './pages/logs.js';
import { TrendsPage } from './pages/trends.js';
import { SingleImageReview } from './pages/singleImageReview.js';
import { MultiImageReview } from './pages/multiImageReview.js';
import { ProductionReportPage } from './pages/productionReport.js';
import { MachineManagement } from './pages/machineManagement.js';
import { BoardTypeManagement } from './pages/versionManagement.js';
import { ModelManagement } from './pages/modelManagement.js';
import { ParameterConfig } from './pages/parameterConfig.js';
import { UserManagement } from './pages/userManagement.js';

// 应用初始化
class App {
    constructor() {
        this.init();
    }
    
    // 初始化应用
    init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
            } else {
                this.onDOMReady();
            }
        } catch (error) {
            // 让错误显示在控制台，不再静默处理
            console.error('应用初始化失败:', error);
            this.showStartupError(error);
        }
    }
    
    // DOM准备就绪时的初始化
    onDOMReady() {
        try {
            // 检测 ECharts 库是否加载
            this.checkEChartsLibrary();
            
            // 初始化各个模块
            this.initModules();
            
            // 初始化路由
            this.initRouter();
            
            // 初始化UI组件
            this.initUI();
            
            // 初始化页面特定功能
            this.initPages();
            
            // 添加键盘快捷键支持
            this.initKeyboardShortcuts();
            
            // 设置默认页面
            Router.setDefaultPage();
        } catch (error) {
            console.error('DOM就绪初始化失败:', error);
            this.showStartupError(error);
        }
    }
    
    // 检测 ECharts 库是否加载
    checkEChartsLibrary() {
        if (typeof window.echarts === 'undefined') {
            // 在页面顶部显示醒目的红色提示框
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff4444;
                color: white;
                padding: 15px;
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            errorDiv.innerHTML = '⚠️ ECharts 库加载失败，请检查网络或 CDN 地址';
            
            // 添加到页面最前面
            document.body.insertBefore(errorDiv, document.body.firstChild);
            
            // 同时在控制台输出错误信息
            console.error('ECharts 库未加载！趋势分析页面可能无法正常工作。');
            console.error('请检查：');
            console.error('1. 网络连接是否正常');
            console.error('2. CDN 地址是否正确：https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js');
            console.error('3. 是否被广告拦截器阻止');
            
            // 记录到日志系统
            try {
                LogSystem.addLog(
                    LogSystem.levels.ERROR,
                    LogSystem.types.SYSTEM_CONFIG,
                    'ECharts 库加载失败',
                    JSON.stringify({ 
                        error: 'ECharts library not loaded',
                        cdn: 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
                        timestamp: new Date().toISOString()
                    }),
                    'Main'
                );
            } catch (logError) {
                console.error('日志记录失败:', logError);
            }
        } else {
            console.log('✅ ECharts 库加载成功，版本:', window.echarts.version);
        }
    }
    
    // 显示启动错误
    showStartupError(error) {
        console.error('系统启动失败详细信息:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <h3>系统启动失败</h3>
            <p><strong>错误:</strong> ${error.message}</p>
            <p>请查看浏览器控制台获取详细信息</p>
            <button onclick="this.parentElement.remove()" style="
                background: white;
                color: #ff4444;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                margin-top: 10px;
            ">关闭</button>
        `;
        document.body.appendChild(errorDiv);
        
        // 不再自动移除，让用户手动关闭
    }
    
    // 初始化各个模块
    initModules() {
        try {
            // 初始化日志系统
            LogSystem.loadLogs();
            LogSystem.updateStatistics();
        } catch (error) {
            throw error;
        }
    }
    
    // 初始化路由
    initRouter() {
        try {
            Router.initRouter();
        } catch (error) {
            throw error;
        }
    }
    
    // 初始化UI组件
    initUI() {
        try {
            UiUtils.initAllComponents();
        } catch (error) {
            throw error;
        }
    }
    
    // 初始化页面特定功能
    initPages() {
        try {
            // 初始化预警页面
            WarningPage.init();

            // 初始化Mapping页面
            MappingPage.init();

            // 初始化日志管理页面
            LogsPage.init();

            // 初始化趋势分析页面
            TrendsPage.init();

            // 初始化单图审图页面
            SingleImageReview.init();

            // 初始化多图审图页面
            MultiImageReview.init();

            // 初始化生产报表页面
            ProductionReportPage.init();

            // 初始化机台管理页面
            MachineManagement.init();
            
            // 初始化版类型管理页面
            BoardTypeManagement.init();
            
            // 初始化模型管理页面
            ModelManagement.init();

            // 初始化参数配置页面
            ParameterConfig.init();

            // 初始化人员管理页面
            UserManagement.init();

            // 定义全局函数供HTML onclick事件使用
            this.setupGlobalFunctions();
        } catch (error) {
            throw error;
        }
    }
    
    // 初始化键盘快捷键
    initKeyboardShortcuts() {
        try {
            document.addEventListener('keydown', (e) => {
                // Ctrl+L 快速跳转到日志管理页面
                if (e.ctrlKey && e.key === 'l') {
                    e.preventDefault();
                    Router.loadPage('log-management');
                }

                // Ctrl+S 快速保存配置（模拟）
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    LogSystem.addLog(
                        LogSystem.levels.INFO,
                        LogSystem.types.USER_ACTION,
                        '用户尝试保存配置',
                        JSON.stringify({ shortcut: 'Ctrl+S' }),
                        'System'
                    );
                }

                // Esc 关闭模态框
                if (e.key === 'Escape') {
                    UiUtils.closeModal('logModal');
                }
            });
        } catch (error) {
            throw error;
        }
    }

    // 设置全局函数供HTML onclick事件使用
    setupGlobalFunctions() {
        try {
            console.log('🔧 设置全局函数...');

            // 警告页面相关函数
            window.addNewRow = (type) => {
                if (WarningPage && WarningPage.addNewRow) {
                    WarningPage.addNewRow(type);
                } else {
                    console.error('❌ WarningPage.addNewRow 未定义');
                }
            };

            window.deleteSelected = (type) => {
                if (WarningPage && WarningPage.deleteSelected) {
                    WarningPage.deleteSelected(type);
                } else {
                    console.error('❌ WarningPage.deleteSelected 未定义');
                }
            };

            window.deleteRow = (button, type) => {
                if (WarningPage && WarningPage.deleteRow) {
                    WarningPage.deleteRow(button, type);
                } else {
                    console.error('❌ WarningPage.deleteRow 未定义');
                }
            };

            // 日志页面相关函数
            window.filterLogs = () => {
                if (LogsPage && LogsPage.filterLogs) {
                    LogsPage.filterLogs();
                } else {
                    console.error('❌ LogsPage.filterLogs 未定义');
                }
            };

            window.resetLogFilter = () => {
                if (LogsPage && LogsPage.resetLogFilter) {
                    LogsPage.resetLogFilter();
                } else {
                    console.error('❌ LogsPage.resetLogFilter 未定义');
                }
            };

            window.exportLogs = () => {
                if (LogsPage && LogsPage.exportLogs) {
                    LogsPage.exportLogs();
                } else {
                    console.error('❌ LogsPage.exportLogs 未定义');
                }
            };

            window.closeLogModal = () => {
                if (LogsPage && LogsPage.closeLogModal) {
                    LogsPage.closeLogModal();
                } else {
                    console.error('❌ LogsPage.closeLogModal 未定义');
                }
            };

            // 日志分页函数
            window.goToFirstPage = () => {
                if (LogsPage && LogsPage.goToFirstPage) {
                    LogsPage.goToFirstPage();
                } else {
                    console.error('❌ LogsPage.goToFirstPage 未定义');
                }
            };

            window.goToPrevPage = () => {
                if (LogsPage && LogsPage.goToPrevPage) {
                    LogsPage.goToPrevPage();
                } else {
                    console.error('❌ LogsPage.goToPrevPage 未定义');
                }
            };

            window.goToNextPage = () => {
                if (LogsPage && LogsPage.goToNextPage) {
                    LogsPage.goToNextPage();
                } else {
                    console.error('❌ LogsPage.goToNextPage 未定义');
                }
            };

            window.goToLastPage = () => {
                if (LogsPage && LogsPage.goToLastPage) {
                    LogsPage.goToLastPage();
                } else {
                    console.error('❌ LogsPage.goToLastPage 未定义');
                }
            };

            // Mapping页面相关函数
            window.refreshDrawingConfig = () => {
                if (MappingPage && MappingPage.refreshDrawingConfig) {
                    MappingPage.refreshDrawingConfig();
                } else {
                    console.error('❌ MappingPage.refreshDrawingConfig 未定义');
                }
            };

            window.selectAllDefects = () => {
                if (MappingPage && MappingPage.selectAllDefects) {
                    MappingPage.selectAllDefects();
                } else {
                    console.error('❌ MappingPage.selectAllDefects 未定义');
                }
            };

            // 生产报表Tab切换函数
            window.switchReportTab = (tabName) => {
                if (ProductionReportPage && ProductionReportPage.switchTab) {
                    ProductionReportPage.switchTab(tabName);
                } else {
                    console.error('❌ ProductionReportPage.switchTab 未定义');
                }
            };

            console.log('✅ 全局函数设置完成');
        } catch (error) {
            console.error('❌ 设置全局函数失败:', error);
            throw error;
        }
    }
}

// 创建应用实例
try {
    console.log('🚀 正在启动二次复盘系统...');
    const app = new App();
    console.log('✅ 二次复盘系统启动完成');
} catch (error) {
    // 如果应用创建失败，显示错误信息并让错误显示在控制台
    console.error('❌ 应用创建失败:', error);
    
    document.addEventListener('DOMContentLoaded', () => {
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="color: red;">系统启动失败</h1>
                <p><strong>错误信息:</strong> ${error.message}</p>
                <p><strong>详细错误:</strong> <pre>${error.stack}</pre></p>
                <h2>可能的解决方案:</h2>
                <ol>
                    <li>使用Live Server或其他本地服务器运行项目</li>
                    <li>确保使用现代浏览器（Chrome 61+, Firefox 60+, Safari 10.1+）</li>
                    <li>检查文件路径是否正确</li>
                    <li>检查网络连接，确保能访问CDN资源</li>
                </ol>
                <h3>如何使用Live Server:</h3>
                <p>1. 在VS Code中安装Live Server扩展</p>
                <p>2. 右键点击index.html</p>
                <p>3. 选择"Open with Live Server"</p>
                <p>4. 或者在index.html文件上右键，选择"Live Server: Open with Live Server"</p>
            </div>
        `;
    });
}

// 导出主要对象供全局使用
export { LogSystem, Router, UiUtils, WarningPage, MappingPage, LogsPage, TrendsPage, SingleImageReview, MultiImageReview, ProductionReportPage, MachineManagement, BoardTypeManagement, ModelManagement, ParameterConfig, UserManagement };
