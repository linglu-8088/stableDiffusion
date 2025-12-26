// ================= 模型管理页面 =================

import { LogSystem } from '../modules/logSystem.js';

export const ModelManagement = {
    // 模型数据
    modelData: [
        {
            id: 1,
            name: "AOI缺陷检测模型",
            latestVersion: "v2.1.0",
            versionCount: 3,
            device: "AOI-01",
            step: "detection",
            labelFile: "aoi_labels_v2.json",
            updateTime: "2023-11-15",
            description: "用于PCB表面缺陷检测的专业AI模型",
            expanded: true,
            versions: [
                {
                    id: 101,
                    version: "v2.1.0",
                    modelFile: "aoi_detection_v2.1.0.pt",
                    createTime: "2023-11-15",
                    updateTime: "2023-11-15",
                    description: "优化了小缺陷检测能力"
                },
                {
                    id: 102,
                    version: "v2.0.0",
                    modelFile: "aoi_detection_v2.0.0.pt",
                    createTime: "2023-09-20",
                    updateTime: "2023-10-05",
                    description: "增加了新的缺陷类型识别"
                },
                {
                    id: 103,
                    version: "v1.0.0",
                    modelFile: "aoi_detection_v1.0.0.pt",
                    createTime: "2023-06-10",
                    updateTime: "2023-08-15",
                    description: "初始版本"
                }
            ]
        },
        {
            id: 2,
            name: "焊点质量评估模型",
            latestVersion: "v1.5.2",
            versionCount: 5,
            device: "AOI-02",
            step: "classification",
            labelFile: "solder_quality_labels.json",
            updateTime: "2023-11-10",
            description: "评估焊点质量的分类模型",
            expanded: false,
            versions: [
                {
                    id: 201,
                    version: "v1.5.2",
                    modelFile: "solder_quality_v1.5.2.h5",
                    createTime: "2023-11-10",
                    updateTime: "2023-11-10",
                    description: "修复了圆形焊点分类错误"
                },
                {
                    id: 202,
                    version: "v1.5.1",
                    modelFile: "solder_quality_v1.5.1.h5",
                    createTime: "2023-10-15",
                    updateTime: "2023-10-20",
                    description: "提高了分类准确率"
                }
            ]
        },
        {
            id: 3,
            name: "元件定位模型",
            latestVersion: "v1.2.0",
            versionCount: 2,
            device: "AOI-03",
            step: "pre-processing",
            labelFile: "component_location_labels.csv",
            updateTime: "2023-10-28",
            description: "用于精准定位PCB上元件位置",
            expanded: false,
            versions: [
                {
                    id: 301,
                    version: "v1.2.0",
                    modelFile: "component_location_v1.2.0.onnx",
                    createTime: "2023-10-28",
                    updateTime: "2023-10-28",
                    description: "优化了小元件定位精度"
                },
                {
                    id: 302,
                    version: "v1.0.0",
                    modelFile: "component_location_v1.0.0.onnx",
                    createTime: "2023-08-05",
                    updateTime: "2023-09-10",
                    description: "初始版本"
                }
            ]
        },
        {
            id: 4,
            name: "表面缺陷分类模型",
            latestVersion: "v1.0.5",
            versionCount: 6,
            device: "AOI-01",
            step: "classification",
            labelFile: "surface_defect_labels.json",
            updateTime: "2023-11-12",
            description: "用于表面缺陷进行分类的专业模型",
            expanded: false,
            versions: [
                {
                    id: 401,
                    version: "v1.0.5",
                    modelFile: "surface_defect_v1.0.5.pkl",
                    createTime: "2023-11-12",
                    updateTime: "2023-11-12",
                    description: "增加了新的缺陷类型"
                }
            ]
        },
        {
            id: 5,
            name: "尺寸检验预处理模型",
            latestVersion: "v1.3.1",
            versionCount: 4,
            device: "AOI-02",
            step: "pre-processing",
            labelFile: "dimension_labels.json",
            updateTime: "2023-11-08",
            description: "用于尺寸检验的图像预处理模型",
            expanded: false,
            versions: [
                {
                    id: 501,
                    version: "v1.3.1",
                    modelFile: "dimension_preprocess_v1.3.1.pt",
                    createTime: "2023-11-08",
                    updateTime: "2023-11-08",
                    description: "优化了边缘检测算法"
                }
            ]
        }
    ],

    // 初始化模型管理页面
    init: function() {
        try {
            console.log('🧠 初始化模型管理页面');

            // 渲染模型表格
            this.renderModelTable();

            // 绑定事件
            this.bindEvents();

            // 记录日志
            LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.PAGE_ACCESS, '访问模型管理页面', '', 'ModelManagement');
        } catch (error) {
            console.error('❌ 模型管理页面初始化失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.SYSTEM_CONFIG, '模型管理页面初始化失败', error.message, 'ModelManagement');
        }
    },

    // 渲染模型表格
    renderModelTable: function() {
        const tableBody = document.getElementById('modelTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.modelData.forEach((model, index) => {
            // 创建主表格行
            const mainRow = document.createElement('tr');
            mainRow.innerHTML = `
                <td>
                    <span class="expand-icon ${model.expanded ? 'expanded' : ''}" data-id="${model.id}">
                        ▶
                    </span>
                </td>
                <td>${index + 1}</td>
                <td>${model.name}</td>
                <td>${model.latestVersion}</td>
                <td>${model.versionCount}</td>
                <td>${model.device}</td>
                <td>${this.getStepName(model.step)}</td>
                <td>${model.labelFile}</td>
                <td>${model.updateTime}</td>
                <td>${model.description}</td>
                <td>
                    <div class="action-buttons-container">
                        <button class="action-btn action-btn-add" data-id="${model.id}">新增版本</button>
                        <button class="action-btn action-btn-edit" data-id="${model.id}">编辑</button>
                        <button class="action-btn action-btn-delete" data-id="${model.id}">删除</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(mainRow);

            // 创建详情表格行
            const detailRow = document.createElement('tr');
            detailRow.className = `detail-table-container ${model.expanded ? 'show' : ''}`;
            detailRow.innerHTML = `
                <td colspan="11">
                    <div class="detail-table-wrapper">
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th width="60">序号</th>
                                    <th>版本号</th>
                                    <th>模型文件名称</th>
                                    <th>创建时间</th>
                                    <th>更新时间</th>
                                    <th>描述</th>
                                    <th width="120">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${model.versions.map((version, vIndex) => `
                                    <tr>
                                        <td>${vIndex + 1}</td>
                                        <td>${version.version}</td>
                                        <td>${version.modelFile}</td>
                                        <td>${version.createTime}</td>
                                        <td>${version.updateTime}</td>
                                        <td>${version.description}</td>
                                        <td>
                                            <div class="action-buttons-container">
                                                <button class="action-btn action-btn-edit" data-model-id="${model.id}" data-version-id="${version.id}">编辑</button>
                                                <button class="action-btn action-btn-delete" data-model-id="${model.id}" data-version-id="${version.id}">删除</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </td>
            `;
            tableBody.appendChild(detailRow);
        });

        console.log(`✅ 渲染 ${this.modelData.length} 个模型记录`);
    },

    // 获取步骤名称
    getStepName: function(step) {
        const stepMap = {
            'pre-processing': '预处理',
            'detection': '检测',
            'classification': '分类'
        };
        return stepMap[step] || step;
    },

    // 绑定事件
    bindEvents: function() {
        // 新建模型按钮
        const newModelBtn = document.getElementById('newModelBtn');
        if (newModelBtn) {
            newModelBtn.addEventListener('click', () => this.showNewModelModal());
        }

        // 关闭新建模型弹窗
        const closeModal = document.getElementById('closeNewModelModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideNewModelModal());
        }

        const cancelNewModel = document.getElementById('cancelNewModel');
        if (cancelNewModel) {
            cancelNewModel.addEventListener('click', () => this.hideNewModelModal());
        }

        // 确认新建模型
        const confirmNewModel = document.getElementById('confirmNewModel');
        if (confirmNewModel) {
            confirmNewModel.addEventListener('click', () => this.saveNewModel());
        }

        // 文件浏览按钮
        const browseModelFile = document.getElementById('browseModelFile');
        if (browseModelFile) {
            browseModelFile.addEventListener('click', () => {
                const fileInput = document.getElementById('newModelFile');
                if (fileInput) fileInput.click();
            });
        }

        const browseLabelFile = document.getElementById('browseLabelFile');
        if (browseLabelFile) {
            browseLabelFile.addEventListener('click', () => {
                const fileInput = document.getElementById('newLabelFile');
                if (fileInput) fileInput.click();
            });
        }

        // 文件选择事件
        const modelFileInput = document.getElementById('newModelFile');
        if (modelFileInput) {
            modelFileInput.addEventListener('change', (e) => {
                const fileName = e.target.files[0] ? e.target.files[0].name : '未选择文件';
                const fileNameDisplay = document.getElementById('modelFileName');
                if (fileNameDisplay) fileNameDisplay.textContent = fileName;
            });
        }

        const labelFileInput = document.getElementById('newLabelFile');
        if (labelFileInput) {
            labelFileInput.addEventListener('change', (e) => {
                const fileName = e.target.files[0] ? e.target.files[0].name : '未选择文件';
                const fileNameDisplay = document.getElementById('labelFileName');
                if (fileNameDisplay) fileNameDisplay.textContent = fileName;
            });
        }

        // 阈值调节按钮
        const thresholdDecrease = document.getElementById('thresholdDecrease');
        if (thresholdDecrease) {
            thresholdDecrease.addEventListener('click', () => {
                const input = document.getElementById('newModelThreshold');
                if (input) {
                    const value = parseFloat(input.value);
                    if (value > 0) {
                        input.value = (value - 0.1).toFixed(1);
                    }
                }
            });
        }

        const thresholdIncrease = document.getElementById('thresholdIncrease');
        if (thresholdIncrease) {
            thresholdIncrease.addEventListener('click', () => {
                const input = document.getElementById('newModelThreshold');
                if (input) {
                    const value = parseFloat(input.value);
                    if (value < 1) {
                        input.value = (value + 0.1).toFixed(1);
                    }
                }
            });
        }

        // 表格展开/折叠和操作按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('expand-icon')) {
                const modelId = parseInt(e.target.getAttribute('data-id'));
                this.toggleModelExpansion(modelId);
            }

            if (e.target.classList.contains('action-btn')) {
                const action = e.target.classList.contains('action-btn-add') ? 'add-version' :
                              e.target.classList.contains('action-btn-edit') ? 'edit' : 'delete';
                const modelId = parseInt(e.target.getAttribute('data-id'));
                const versionId = e.target.getAttribute('data-version-id') ?
                                 parseInt(e.target.getAttribute('data-version-id')) : null;

                this.handleAction(action, modelId, versionId);
            }
        });

        // 查询和重置按钮
        const queryBtn = document.getElementById('queryBtn');
        if (queryBtn) {
            queryBtn.addEventListener('click', () => this.filterModels());
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    },

    // 显示新建模型弹窗
    showNewModelModal: function() {
        const modal = document.getElementById('newModelModal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    // 隐藏新建模型弹窗
    hideNewModelModal: function() {
        const modal = document.getElementById('newModelModal');
        if (modal) {
            modal.classList.remove('show');
        }

        // 重置表单
        this.clearNewModelForm();
    },

    // 清空新建模型表单
    clearNewModelForm: function() {
        const inputs = [
            'newModelName', 'newModelVersion', 'newModelFile',
            'modelFileName', 'newModelDevice', 'newModelStep',
            'newModelThreshold', 'newLabelFile', 'labelFileName', 'newModelDescription'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'file') {
                    element.value = '';
                } else if (element.tagName === 'SPAN') {
                    element.textContent = '未选择文件';
                } else {
                    element.value = '';
                }
            }
        });

        // 重置阈值默认值
        const thresholdInput = document.getElementById('newModelThreshold');
        if (thresholdInput) {
            thresholdInput.value = '0.5';
        }
    },

    // 保存新模型
    saveNewModel: function() {
        try {
            const name = document.getElementById('newModelName')?.value.trim();
            const version = document.getElementById('newModelVersion')?.value.trim();
            const modelFile = document.getElementById('newModelFile')?.files[0];
            const device = document.getElementById('newModelDevice')?.value;
            const step = document.getElementById('newModelStep')?.value;
            const threshold = document.getElementById('newModelThreshold')?.value;
            const labelFile = document.getElementById('newLabelFile')?.files[0];
            const description = document.getElementById('newModelDescription')?.value.trim();

            // 验证必填字段
            if (!name || !version || !modelFile || !device || !step) {
                alert('请填写所有必填字段');
                return;
            }

            // 创建新模型对象
            const newModel = {
                id: this.modelData.length + 1,
                name: name,
                latestVersion: version,
                versionCount: 1,
                device: device,
                step: step,
                labelFile: labelFile ? labelFile.name : '',
                updateTime: new Date().toISOString().split('T')[0],
                description: description,
                expanded: false,
                versions: [
                    {
                        id: (this.modelData.length + 1) * 100 + 1,
                        version: version,
                        modelFile: modelFile.name,
                        createTime: new Date().toISOString().split('T')[0],
                        updateTime: new Date().toISOString().split('T')[0],
                        description: description
                    }
                ]
            };

            // 添加到数据数组
            this.modelData.unshift(newModel);

            // 重新渲染表格
            this.renderModelTable();

            // 隐藏弹窗
            this.hideNewModelModal();

            // 记录日志
            LogSystem.addLog(LogSystem.levels.SUCCESS, LogSystem.types.USER_ACTION, '创建新模型', `模型: ${newModel.name}`, 'ModelManagement');

        } catch (error) {
            console.error('❌ 保存模型失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.USER_ACTION, '创建模型失败', error.message, 'ModelManagement');
        }
    },

    // 切换模型展开/折叠状态
    toggleModelExpansion: function(modelId) {
        const model = this.modelData.find(m => m.id === modelId);
        if (model) {
            model.expanded = !model.expanded;
            this.renderModelTable();
        }
    },

    // 处理操作按钮点击
    handleAction: function(action, modelId, versionId) {
        if (action === 'add-version') {
            // 新增版本
            const model = this.modelData.find(m => m.id === modelId);
            if (model) {
                const newVersion = {
                    id: model.id * 100 + model.versions.length + 1,
                    version: `v${model.versions.length + 1}.0.0`,
                    modelFile: `${model.name}_v${model.versions.length + 1}.0.0.pt`,
                    createTime: new Date().toISOString().split('T')[0],
                    updateTime: new Date().toISOString().split('T')[0],
                    description: '新增加版本'
                };

                model.versions.unshift(newVersion);
                model.latestVersion = newVersion.version;
                model.versionCount = model.versions.length;

                this.renderModelTable();
                alert('版本添加成功！');

                LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '添加模型版本', `模型ID: ${modelId}`, 'ModelManagement');
            }
        } else if (action === 'edit') {
            if (versionId) {
                // 编辑版本
                alert(`编辑版本 ID: ${versionId}\n此功能正在开发中...`);
            } else {
                // 编辑模型
                alert(`编辑模型 ID: ${modelId}\n此功能正在开发中...`);
            }
        } else if (action === 'delete') {
            if (versionId) {
                // 删除版本
                if (confirm('确定要删除此版本吗？')) {
                    const model = this.modelData.find(m => m.id === modelId);
                    if (model && model.versions.length > 1) {
                        model.versions = model.versions.filter(v => v.id !== versionId);
                        model.versionCount = model.versions.length;
                        model.latestVersion = model.versions[0].version;

                        this.renderModelTable();
                        alert('版本删除成功！');

                        LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.USER_ACTION, '删除模型版本', `版本ID: ${versionId}`, 'ModelManagement');
                    } else {
                        alert('至少需要保留一个版本');
                    }
                }
            } else {
                // 删除模型
                if (confirm('确定要删除此模型及其所有版本吗？')) {
                    const index = this.modelData.findIndex(m => m.id === modelId);
                    if (index !== -1) {
                        const deletedModel = this.modelData.splice(index, 1)[0];
                        this.renderModelTable();
                        alert('模型删除成功！');

                        LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.USER_ACTION, '删除模型', `模型: ${deletedModel.name}`, 'ModelManagement');
                    }
                }
            }
        }
    },

    // 筛选模型
    filterModels: function() {
        const modelName = document.getElementById('modelNameFilter')?.value.trim().toLowerCase() || '';
        const device = document.getElementById('deviceFilter')?.value || '';
        const step = document.getElementById('stepFilter')?.value || '';
        const updateTime = document.getElementById('updateTimeFilter')?.value || '';

        // 这里可以调用API获取筛选后的数据
        // 为了演示，这里只是重新渲染当前数据
        this.renderModelTable();

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '筛选模型', `条件: ${modelName || '无'}`, 'ModelManagement');
    },

    // 重置筛选条件
    resetFilters: function() {
        const filters = ['modelNameFilter', 'deviceFilter', 'stepFilter', 'updateTimeFilter'];

        filters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });

        // 重新渲染表格
        this.renderModelTable();

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '重置模型筛选条件', '', 'ModelManagement');
    },

    // 页面显示时的处理
    onPageShow: function() {
        // 可以在这里添加页面显示时的逻辑
        console.log('🧠 模型管理页面显示');
    }
};