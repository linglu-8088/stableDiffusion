// ================= Mapping 页面功能 =================

import { LogSystem } from '../modules/logSystem.js';
import { UiUtils } from '../modules/ui-utils.js';

export const MappingPage = {
    // 初始化Mapping页面
    init: function() {
        // 初始化已经通过UiUtils.initAllComponents()处理了大部分功能
        // 这里可以添加Mapping页面特有的初始化逻辑
    },
    
    // 全选所有缺陷
    selectAllDefects: function() {
        UiUtils.selectAllDefects();
    },
    
    // 搜索缺陷
    searchDefects: function() {
        UiUtils.searchDefects();
    },
    
    // 刷新绘图配置
    refreshDrawingConfig: function() {
        UiUtils.refreshDrawingConfig();
    }
};
