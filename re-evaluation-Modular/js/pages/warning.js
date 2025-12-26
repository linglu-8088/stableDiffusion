// ================= 预警页面功能 =================

import { LogSystem } from '../modules/logSystem.js';
import { UiUtils } from '../modules/ui-utils.js';

export const WarningPage = {
    highRiskRowIdCounter: 2, // 高危缺陷预警现有行数
    excessRowIdCounter: 2, // 缺陷超限预警现有行数
    
    // 初始化预警页面
    init: function() {
        this.initHighRiskWarning();
        this.initExcessWarning();
    },
    
    // 初始化高危缺陷预警
    initHighRiskWarning: function() {
        // 开关状态监听
        const highRiskWarning = document.getElementById('highRiskWarning');
        const warningLock = document.getElementById('warningLock');
        
        if (highRiskWarning) {
            highRiskWarning.addEventListener('change', () => {
                LogSystem.addLog(
                    LogSystem.levels.SUCCESS, 
                    LogSystem.types.SYSTEM_CONFIG, 
                    `高危缺陷预警状态变更为: ${highRiskWarning.checked ? '已启用' : '未启用'}`, 
                    JSON.stringify({ enabled: highRiskWarning.checked }), 
                    'System'
                );
            });
        }
        
        if (warningLock) {
            warningLock.addEventListener('change', () => {
                LogSystem.addLog(
                    LogSystem.levels.SUCCESS, 
                    LogSystem.types.SYSTEM_CONFIG, 
                    `预警加锁状态变更为: ${warningLock.checked ? '已启用' : '未启用'}`, 
                    JSON.stringify({ enabled: warningLock.checked }), 
                    'System'
                );
            });
        }
    },
    
    // 初始化缺陷超限预警
    initExcessWarning: function() {
        // 开关状态监听
        const excessWarning = document.getElementById('excessWarning');
        const warningLockExcess = document.getElementById('warningLockExcess');
        
        if (excessWarning) {
            excessWarning.addEventListener('change', () => {
                LogSystem.addLog(
                    LogSystem.levels.SUCCESS, 
                    LogSystem.types.SYSTEM_CONFIG, 
                    `缺陷超限预警状态变更为: ${excessWarning.checked ? '已启用' : '未启用'}`, 
                    JSON.stringify({ enabled: excessWarning.checked }), 
                    'System'
                );
            });
        }
        
        if (warningLockExcess) {
            warningLockExcess.addEventListener('change', () => {
                LogSystem.addLog(
                    LogSystem.levels.SUCCESS, 
                    LogSystem.types.SYSTEM_CONFIG, 
                    `超限预警加锁状态变更为: ${warningLockExcess.checked ? '已启用' : '未启用'}`, 
                    JSON.stringify({ enabled: warningLockExcess.checked }), 
                    'System'
                );
            });
        }
    },
    
    // 添加新行
    addNewRow: function(type) {
        LogSystem.addLog(
            LogSystem.levels.INFO, 
            LogSystem.types.USER_ACTION, 
            `添加新行: ${type}`, 
            JSON.stringify({ type: type }), 
            'System'
        );
        
        if (type === 'high-risk') {
            this.addHighRiskRow();
        } else if (type === 'excess-warning') {
            this.addExcessWarningRow();
        }
    },
    
    // 添加高危缺陷预警行
    addHighRiskRow: function() {
        this.highRiskRowIdCounter++;
        const tableBody = document.getElementById('highRiskTableBody');
        if (!tableBody) return;
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <div class="checkbox-container">
                    <input type="checkbox" class="checkbox-input" data-row-id="${this.highRiskRowIdCounter}">
                </div>
            </td>
            <td>
                <input type="text" class="editable-field" placeholder="请输入缺陷名称" data-field-type="text">
            </td>
            <td>
                <select class="editable-field select-readonly" data-field-type="select">
                    <option>外观缺陷</option>
                    <option>尺寸偏差</option>
                    <option>功能异常</option>
                    <option>其他</option>
                </select>
            </td>
            <td>
                <div class="level-checkbox-container">
                    <input type="checkbox" class="level-checkbox mild">
                </div>
            </td>
            <td>
                <div class="level-checkbox-container">
                    <input type="checkbox" class="level-checkbox moderate">
                </div>
            </td>
            <td>
                <div class="level-checkbox-container">
                    <input type="checkbox" class="level-checkbox severe">
                </div>
            </td>
            <td>
                <select class="select-field">
                    <option>自动标记</option>
                    <option selected>人工复检</option>
                    <option>暂停生产</option>
                </select>
            </td>
            <td>
                <button class="delete-btn" onclick="WarningPage.deleteRow(this, 'high-risk')">
                    <span class="trash-icon">🗑️</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(newRow);
        
        // 为新行的复选框添加事件监听
        const newCheckbox = newRow.querySelector('.level-checkbox');
        if (newCheckbox) {
            newCheckbox.addEventListener('change', () => {
                LogSystem.addLog(
                    LogSystem.levels.INFO, 
                    LogSystem.types.DATA_CHANGE, 
                    `缺陷级别变更: ${this.highRiskRowIdCounter}`, 
                    JSON.stringify({ 
                        rowId: this.highRiskRowIdCounter, 
                        mild: newCheckbox.checked, 
                        moderate: newCheckbox.checked, 
                        severe: newCheckbox.checked 
                    }), 
                    'System'
                );
            });
        }
        
        // 为新行的可编辑字段添加双击事件监听
        const editableFields = newRow.querySelectorAll('.editable-field');
        editableFields.forEach(field => {
            UiUtils.setupEditableField(field);
        });
    },
    
    // 添加缺陷超限预警行
    addExcessWarningRow: function() {
        this.excessRowIdCounter++;
        const tableBody = document.getElementById('excessWarningTableBody');
        if (!tableBody) return;
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <div class="checkbox-container">
                    <input type="checkbox" class="checkbox-input" data-row-id="${this.excessRowIdCounter}">
                </div>
            </td>
            <td>
                <input type="text" class="editable-field" placeholder="请输入缺陷名称" data-field-type="text">
            </td>
            <td>
                <select class="editable-field select-readonly" data-field-type="select">
                    <option>外观缺陷</option>
                    <option>尺寸偏差</option>
                    <option>功能异常</option>
                    <option>其他</option>
                </select>
            </td>
            <td>
                <div class="level-checkbox-container">
                    <input type="checkbox" class="level-checkbox mild" checked>
                </div>
            </td>
            <td>
                <div class="level-checkbox-container">
                    <input type="checkbox" class="level-checkbox moderate">
                </div>
            </td>
            <td>
                <div class="level-checkbox-container">
                    <input type="checkbox" class="level-checkbox severe">
                </div>
            </td>
            <td>
                <div class="number-stepper readonly" id="stepper-${this.excessRowIdCounter}">
                    <button class="stepper-btn decrease" onclick="UiUtils.decreaseValue('stepper-${this.excessRowIdCounter}')">−</button>
                    <input type="number" class="stepper-input" value="1" min="0" max="999" readonly>
                    <button class="stepper-btn increase" onclick="UiUtils.increaseValue('stepper-${this.excessRowIdCounter}')">+</button>
                </div>
            </td>
            <td>
                <select class="select-field">
                    <option>自动标记</option>
                    <option selected>人工复检</option>
                    <option>暂停生产</option>
                </select>
            </td>
            <td>
                <button class="delete-btn" onclick="WarningPage.deleteRow(this, 'excess-warning')">
                    <span class="trash-icon">🗑️</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(newRow);
        
        // 为新行的复选框添加事件监听
        const newCheckbox = newRow.querySelector('.level-checkbox');
        if (newCheckbox) {
            newCheckbox.addEventListener('change', () => {
                LogSystem.addLog(
                    LogSystem.levels.INFO, 
                    LogSystem.types.DATA_CHANGE, 
                    `缺陷级别变更: ${this.excessRowIdCounter}`, 
                    JSON.stringify({ 
                        rowId: this.excessRowIdCounter, 
                        mild: newCheckbox.checked, 
                        moderate: newCheckbox.checked, 
                        severe: newCheckbox.checked 
                    }), 
                    'System'
                );
            });
        }
        
        // 为新行的可编辑字段添加双击事件监听
        const editableFields = newRow.querySelectorAll('.editable-field');
        editableFields.forEach(field => {
            UiUtils.setupEditableField(field);
        });
        
        // 为新行的数字输入框设置事件监听
        const newStepper = newRow.querySelector('.number-stepper');
        if (newStepper) {
            UiUtils.setupNumberStepper(newStepper);
        }
    },
    
    // 删除单行
    deleteRow: function(button, type) {
        UiUtils.deleteRow(button, type);
    },
    
    // 删除选中行
    deleteSelected: function(type) {
        UiUtils.deleteSelected(type);
    }
};
