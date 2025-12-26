// ================= UI 工具函数 =================

import { LogSystem } from './logSystem.js';

export const UiUtils = {
    // 数字步进器功能
    setupNumberStepper: function(stepper) {
        const input = stepper.querySelector('.stepper-input');
        
        stepper.addEventListener('dblclick', () => {
            if (stepper.classList.contains('readonly')) {
                // 进入编辑模式
                stepper.classList.remove('readonly');
                input.removeAttribute('readonly');
                input.focus();
                input.select();
                
                // 记录编辑操作日志
                LogSystem.addLog(
                    LogSystem.levels.INFO, 
                    LogSystem.types.USER_ACTION, 
                    `进入数字输入框编辑模式: ${stepper.id}`, 
                    JSON.stringify({ stepperId: stepper.id, value: input.value }), 
                    'System'
                );
            }
        });
        
        input.addEventListener('blur', () => {
            // 退出编辑模式
            setTimeout(() => {
                stepper.classList.add('readonly');
                input.setAttribute('readonly', true);
                
                // 记录编辑完成日志
                LogSystem.addLog(
                    LogSystem.levels.INFO, 
                    LogSystem.types.USER_ACTION, 
                    `退出数字输入框编辑模式: ${stepper.id}`, 
                    JSON.stringify({ stepperId: stepper.id, value: input.value }), 
                    'System'
                );
            }, 200);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
        
        // 防止输入框的滚轮事件
        input.addEventListener('wheel', (e) => {
            e.preventDefault();
        });
    },
    
    // 增加数值
    increaseValue: function(stepperId) {
        const stepper = document.getElementById(stepperId);
        if (!stepper) return;
        
        const input = stepper.querySelector('.stepper-input');
        const currentValue = parseInt(input.value) || 0;
        const maxValue = parseInt(input.max) || 999;
        
        if (currentValue < maxValue) {
            const oldValue = input.value;
            input.value = currentValue + 1;
            
            // 记录数据变更日志
            LogSystem.addLog(
                LogSystem.levels.INFO, 
                LogSystem.types.DATA_CHANGE, 
                `数值变更: ${stepperId} 从 ${oldValue} 变更为 ${input.value}`, 
                JSON.stringify({ stepperId: stepperId, oldValue: oldValue, newValue: input.value }), 
                'System'
            );
        }
    },
    
    // 减少数值
    decreaseValue: function(stepperId) {
        const stepper = document.getElementById(stepperId);
        if (!stepper) return;
        
        const input = stepper.querySelector('.stepper-input');
        const currentValue = parseInt(input.value) || 0;
        const minValue = parseInt(input.min) || 0;
        
        if (currentValue > minValue) {
            const oldValue = input.value;
            input.value = currentValue - 1;
            
            // 记录数据变更日志
            LogSystem.addLog(
                LogSystem.levels.INFO, 
                LogSystem.types.DATA_CHANGE, 
                `数值变更: ${stepperId} 从 ${oldValue} 变更为 ${input.value}`, 
                JSON.stringify({ stepperId: stepperId, oldValue: oldValue, newValue: input.value }), 
                'System'
            );
        }
    },
    
    // 设置可编辑字段的事件监听
    setupEditableField: function(field) {
        const fieldType = field.dataset.fieldType;
        
        // 双击进入编辑模式
        field.addEventListener('dblclick', () => {
            if (fieldType === 'text') {
                this.enterEditTextMode(field);
            } else if (fieldType === 'select') {
                this.enterEditSelectMode(field);
            }
        });
        
        // 失去焦点退出编辑模式
        field.addEventListener('blur', () => {
            setTimeout(() => {
                if (fieldType === 'text') {
                    this.exitEditTextMode(field);
                } else if (fieldType === 'select') {
                    this.exitEditSelectMode(field);
                }
            }, 200); // 延迟以确保选择框的点击事件先触发
        });
        
        // 回车键退出编辑模式（仅对文本输入框）
        if (fieldType === 'text') {
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    field.blur();
                }
            });
        }
    },
    
    // 进入文本编辑模式
    enterEditTextMode: function(field) {
        field.classList.add('editing');
        field.readOnly = false;
        field.focus();
        // 选中所有文本
        field.select();
        
        // 记录编辑操作日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `进入文本编辑模式`, 
            JSON.stringify({ fieldType: 'text', value: field.value }), 
            'System'
        );
    },
    
    // 退出文本编辑模式
    exitEditTextMode: function(field) {
        field.classList.remove('editing');
        field.readOnly = true;
        
        // 记录编辑完成日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `退出文本编辑模式`, 
            JSON.stringify({ fieldType: 'text', value: field.value }), 
            'System'
        );
    },
    
    // 进入选择框编辑模式
    enterEditSelectMode: function(field) {
        field.classList.remove('select-readonly');
        field.classList.add('select-editing');
        
        // 记录编辑操作日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `进入选择框编辑模式`, 
            JSON.stringify({ fieldType: 'select', value: field.value }), 
            'System'
        );
    },
    
    // 退出选择框编辑模式
    exitEditSelectMode: function(field) {
        field.classList.remove('select-editing');
        field.classList.add('select-readonly');
        
        // 记录编辑完成日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `退出选择框编辑模式`, 
            JSON.stringify({ fieldType: 'select', value: field.value }), 
            'System'
        );
    },
    
    // 初始化 Toggle 按钮组
    initToggleButtons: function() {
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有 active 类
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                // 添加 active 类到当前按钮
                button.classList.add('active');
                
                // 记录切换操作日志
                LogSystem.addLog(
                    LogSystem.levels.INFO, 
                    LogSystem.types.USER_ACTION, 
                    `切换按钮状态: ${button.dataset.value}`, 
                    JSON.stringify({ value: button.dataset.value }), 
                    'System'
                );
            });
        });
    },
    
    // 刷新绘图配置
    refreshDrawingConfig: function() {
        const refreshBtn = document.querySelector('.refresh-btn');
        if (!refreshBtn) return;
        
        // 视觉反馈
        refreshBtn.style.transform = 'rotate(360deg)';
        refreshBtn.style.transition = 'transform 0.5s';
        
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
        }, 500);
        
        // 记录刷新操作日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `刷新绘图配置`, 
            '', 
            'System'
        );
    },
    
    // 全选所有缺陷
    selectAllDefects: function() {
        const checkboxes = document.querySelectorAll('.defect-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // 记录全选操作日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `全选所有缺陷`, 
            JSON.stringify({ count: checkboxes.length }), 
            'System'
        );
    },
    
    // 搜索缺陷
    searchDefects: function() {
        const searchInput = document.getElementById('defectSearch');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const defectItems = document.querySelectorAll('.defect-item');
        
        defectItems.forEach(item => {
            const defectName = item.querySelector('.defect-name').textContent.toLowerCase();
            if (searchTerm && !defectName.includes(searchTerm)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });
        
        // 记录搜索操作日志
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `搜索缺陷: ${searchTerm}`, 
            JSON.stringify({ searchTerm: searchTerm }), 
            'System'
        );
    },
    
    // 关闭模态框
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // 删除单行
    deleteRow: function(button, type) {
        const row = button.closest('tr');
        if (!row) return;
        
        row.style.transition = 'opacity 0.3s';
        row.style.opacity = '0.5';
        row.classList.add('deleted-row');
        
        // 记录删除操作日志
        LogSystem.addLog(
            LogSystem.levels.WARNING, 
            LogSystem.types.DATA_CHANGE, 
            `删除行: ${type}`, 
            JSON.stringify({ type: type }), 
            'System'
        );
        
        setTimeout(() => {
            row.remove();
        }, 300);
    },
    
    // 删除选中行
    deleteSelected: function(type) {
        const tableId = type === 'high-risk' ? 'highRiskTable' : 'excessWarningTable';
        const checkboxes = document.querySelectorAll(`#${tableId} .checkbox-input:checked`);
        if (checkboxes.length === 0) {
            alert('请先选择要删除的行');
            return;
        }
        
        // 记录批量删除操作日志
        LogSystem.addLog(
            LogSystem.levels.WARNING, 
            LogSystem.types.DATA_CHANGE, 
            `批量删除选中行: ${type}`, 
            JSON.stringify({ count: checkboxes.length }), 
            'System'
        );
        
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                row.style.transition = 'opacity 0.3s';
                row.style.opacity = '0.5';
                row.classList.add('deleted-row');
                
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
        });
    },
    
    // 初始化所有UI组件
    initAllComponents: function() {
        // 为现有的可编辑字段设置双击编辑功能
        const editableFields = document.querySelectorAll('.editable-field');
        editableFields.forEach(field => {
            this.setupEditableField(field);
        });
        
        // 为现有的数字输入框设置事件监听
        const steppers = document.querySelectorAll('.number-stepper');
        steppers.forEach(stepper => {
            this.setupNumberStepper(stepper);
        });
        
        // 为 Mapping 页面的搜索框添加事件监听
        const searchInput = document.getElementById('defectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchDefects());
        }
        
        // 初始化 Toggle 按钮组
        this.initToggleButtons();
        
        // 为所有级别复选框添加事件监听
        const levelCheckboxes = document.querySelectorAll('.level-checkbox');
        levelCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // 记录级别变更日志
                LogSystem.addLog(
                    LogSystem.levels.INFO, 
                    LogSystem.types.DATA_CHANGE, 
                    `缺陷级别变更`, 
                    JSON.stringify({ checkbox: checkbox.checked }), 
                    'System'
                );
            });
        });
    }
};
