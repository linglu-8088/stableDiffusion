// ================= 路由系统 =================

import { LogSystem } from './logSystem.js';
import { TrendsPage } from '../pages/trends.js';
import { ProductionReportPage } from '../pages/productionReport.js';
import { InspectionReportPage } from '../pages/inspectionReport.js';

export const Router = {
    currentPage: 'high-risk-warning',
    
    // 页面名称映射
    pageNames: {
        'high-risk-warning': '高危缺陷预警',
        'defect-excess-warning': '缺陷超限预警',
        'single-image-review': '单图审图',
        'multi-image-review': '多图审图',
        'mapping': 'Mapping',
        'trends': '趋势分析',
        'production-report': '生产报表',
        'inspection-report': '检验报表',
        'parameter-config': '参数配置',
        'machine-management': '机台管理',
        'version-management': '版类型管理',
        'material-management': '料号管理',
        'model-management': '模型管理',
        'label-management': '标签管理',
        'dataset-management': '数据集管理',
        'data-annotation': '数据标注',
        'project-settings': '项目设置',
        'template-config': '模版配置',
        'user-management': '人员管理',
        'log-management': '日志管理'
    },
    
    // 加载页面
    loadPage: function(pageId) {
        try {
            // 记录页面访问日志
            if (LogSystem && LogSystem.addLog) {
                LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.PAGE_ACCESS, `访问页面: ${pageId}`, '', 'System');
            }

            // 在切换页面前调用当前页面的onPageHide方法
            this.callPageHide(this.currentPage);

            // 隐藏所有页面内容
            const allPages = document.querySelectorAll('.page-content');

            allPages.forEach(page => {
                page.classList.remove('active');
            });
            
            // 将 kebab-case 转换为 camelCase 来匹配 HTML ID
            const camelCasePageId = pageId.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
            const targetPageId = camelCasePageId + 'Page';
            
            const targetPage = document.getElementById(targetPageId);
            if (targetPage) {
                targetPage.classList.add('active');
                
                // 更新面包屑
                this.updateBreadcrumb(pageId);
                
                // 更新导航激活状态
                this.updateNavigation(pageId);
                
                // 更新当前页面
                this.currentPage = pageId;
                
                // 特殊处理：趋势分析页面需要重新渲染图表
                if (pageId === 'trends') {
                    console.log('🔄 Router: 检测到切换到趋势分析页面');
                    
                    // 增加50ms延时，等待CSS的display: block生效
                    setTimeout(() => {
                        try {
                            console.log('📱 Router: 开始调用 TrendsPage.onPageShow()');
                            if (TrendsPage && TrendsPage.onPageShow) {
                                TrendsPage.onPageShow();
                            } else {
                                console.error('❌ Router: TrendsPage 或 onPageShow 方法不存在');
                            }
                        } catch (error) {
                            console.error('❌ Router: 调用 TrendsPage.onPageShow() 失败:', error);
                        }
                    }, 50); // 50ms延时，等待CSS display: block 生效
                }
                
                // 特殊处理：生产报表页面需要隐藏右侧边栏（全屏显示）
                if (pageId === 'production-report') {
                    console.log('🔄 Router: 检测到切换到生产报表页面');
                    
                    // 隐藏右侧边栏
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        mainContent.style.marginRight = '0';
                        mainContent.style.transition = 'margin-right 0.3s ease';
                    }
                    
                    // 增加50ms延时，等待CSS变化生效
                    setTimeout(() => {
                        try {
                            console.log('📱 Router: 开始调用生产报表页面显示逻辑');
                            
                            // 调用生产报表页面的显示处理
                            if (ProductionReportPage && ProductionReportPage.onPageShow) {
                                ProductionReportPage.onPageShow();
                            } else {
                                console.error('❌ Router: ProductionReportPage 或 onPageShow 方法不存在');
                            }
                            
                        } catch (error) {
                            console.error('❌ Router: 调用 ProductionReportPage.onPageShow() 失败:', error);
                        }
                    }, 50); // 50ms延时，等待CSS变化生效
                }
                
                // 特殊处理：单图审图页面需要重新调整画布
                if (pageId === 'single-image-review') {
                    console.log('🔄 Router: 检测到切换到单图审图页面');
                    
                    // 增加50ms延时，等待CSS的display: block生效
                    setTimeout(() => {
                        try {
                            console.log('📱 Router: 开始触发单图审图页面显示事件');
                            
                            // 触发自定义事件通知页面切换
                            const pageChangedEvent = new CustomEvent('pageChanged', {
                                detail: { pageId: 'single-image-review' }
                            });
                            document.dispatchEvent(pageChangedEvent);
                            
                        } catch (error) {
                            console.error('❌ Router: 触发单图审图页面事件失败:', error);
                        }
                    }, 50); // 50ms延时，等待CSS display: block 生效
                }
                
                // 特殊处理：检验报表页面需要初始化表格
                if (pageId === 'inspection-report') {
                    console.log('🔄 Router: 检测到切换到检验报表页面');
                    
                    // 增加50ms延时，等待CSS的display: block生效
                    setTimeout(() => {
                        try {
                            console.log('📱 Router: 开始调用检验报表页面显示逻辑');
                            
                            // 调用检验报表页面的显示处理
                            if (InspectionReportPage && InspectionReportPage.onPageShow) {
                                InspectionReportPage.onPageShow();
                            } else {
                                console.error('❌ Router: InspectionReportPage 或 onPageShow 方法不存在');
                            }
                            
                        } catch (error) {
                            console.error('❌ Router: 调用 InspectionReportPage.onPageShow() 失败:', error);
                        }
                    }, 50); // 50ms延时，等待CSS变化生效
                }
            }
        } catch (error) {
            throw error;
        }
    },
    
    // 更新面包屑导航
    updateBreadcrumb: function(pageId) {
        try {
            const breadcrumbActive = document.getElementById('breadcrumbActive');
            if (breadcrumbActive && this.pageNames[pageId]) {
                breadcrumbActive.textContent = this.pageNames[pageId];
            }
        } catch (error) {
            // 静默处理面包屑更新错误
        }
    },
    
    // 更新导航激活状态
    updateNavigation: function(pageId) {
        try {
            // 移除所有激活状态
            const allNavItems = document.querySelectorAll('.sub-item, .menu-link');
            
            allNavItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // 设置当前页面的激活状态 - 优先使用data-page属性匹配
            let matched = false;
            
            allNavItems.forEach(item => {
                const itemPageId = item.dataset.page;
                if (itemPageId === pageId) {
                    item.classList.add('active');
                    matched = true;
                }
            });
            
            // 如果没有data-page属性匹配，则使用文本匹配（向后兼容）
            if (!matched) {
                const submenuItems = document.querySelectorAll('.sub-item');
                submenuItems.forEach(item => {
                    const itemText = item.textContent.trim();
                    if ((pageId === 'high-risk-warning' && itemText === '高危缺陷预警') ||
                        (pageId === 'defect-excess-warning' && itemText === '缺陷超限预警') ||
                        (pageId === 'single-image-review' && itemText === '单图审图') ||
                        (pageId === 'multi-image-review' && itemText === '多图审图') ||
                        (pageId === 'mapping' && itemText === 'Mapping') ||
                        (pageId === 'trends' && itemText === '趋势分析')) {
                        item.classList.add('active');
                        matched = true;
                    }
                });
                
                // 处理其他页面的导航逻辑
                const menuLinks = document.querySelectorAll('.menu-link');
                menuLinks.forEach(item => {
                    const itemText = item.textContent.trim();
                    if ((pageId === 'parameter-config' && itemText === '参数配置') ||
                        (pageId === 'template-config' && itemText === '模版配置') ||
                        (pageId === 'user-management' && itemText === '人员管理') ||
                        (pageId === 'log-management' && itemText === '日志管理')) {
                        item.classList.add('active');
                        matched = true;
                    }
                });
            }
            
        } catch (error) {
            // 静默处理导航更新错误
        }
    },
    
    // 初始化路由系统 - 导出的主要初始化函数
    initRouter: function() {
        try {
            // 使用事件委托，为导航容器添加点击事件监听
            const navContainer = document.querySelector('.nav-scroller');
            
            if (navContainer) {
                navContainer.addEventListener('click', (e) => {
                    try {
                        // 查找被点击的导航项
                        const navItem = e.target.closest('.sub-item, .menu-link');
                        
                        if (navItem) {
                            e.preventDefault();
                            
                            // 优先使用data-page属性，如果没有则使用文本匹配
                            let pageId = navItem.dataset.page;
                            
                            if (!pageId) {
                                const itemText = navItem.textContent.trim();
                                pageId = this.getPageIdFromText(itemText);
                            }
                            
                            if (pageId) {
                                this.loadPage(pageId);
                            }
                        }
                    } catch (error) {
                        // 静默处理点击事件错误
                    }
                });
            }
        } catch (error) {
            throw error;
        }
    },
    
    // 根据文本获取页面ID
    getPageIdFromText: function(text) {
        const textToPageId = {
            '单图审图': 'single-image-review',
            '多图审图': 'multi-image-review',
            'Mapping': 'mapping',
            '趋势分析': 'trends',
            '生产报表': 'production-report',
            '检验报表': 'inspection-report',
            '高危缺陷预警': 'high-risk-warning',
            '缺陷超限预警': 'defect-excess-warning',
            '机台管理': 'machine-management',
            '版类型管理': 'version-management',
            '料号管理': 'material-management',
            '模型管理': 'model-management',
            '标签管理': 'label-management',
            '数据集管理': 'dataset-management',
            '数据标注': 'data-annotation',
            '项目设置': 'project-settings',
            '参数配置': 'parameter-config',
            '模版配置': 'template-config',
            '人员管理': 'user-management',
            '日志管理': 'log-management'
        };

        return textToPageId[text] || null;
    },
    
    // 获取当前页面
    getCurrentPage: function() {
        return this.currentPage;
    },
    
    // 调用页面隐藏方法
    callPageHide: function(pageId) {
        try {
            if (!pageId) return;

            console.log(`🔄 Router: 调用页面 ${pageId} 的 onPageHide 方法`);

            // 根据页面ID调用对应的onPageHide方法
            switch (pageId) {
                // 可以在这里添加其他页面的onPageHide调用
                default:
                    // 对于没有特殊处理的页面，不需要调用onPageHide
                    break;
            }
        } catch (error) {
            console.error(`❌ Router: 调用页面 ${pageId} 的 onPageHide 方法失败:`, error);
        }
    },

    // 设置默认页面
    setDefaultPage: function() {
        try {
            this.loadPage('high-risk-warning');
        } catch (error) {
            throw error;
        }
    }
};
