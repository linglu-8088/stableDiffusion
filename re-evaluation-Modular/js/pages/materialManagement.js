// 料号管理页面脚本
document.addEventListener('DOMContentLoaded', function() {
    // 模拟料号数据
    let materialData = [
        {
            id: 1,
            partNo: "P001-2023",
            customerName: "客户A",
            boardType: "Standard-2x3",
            aiModel: "AOI-Detection-v2.1",
            threshold: 0.85,
            createTime: "2023-05-15",
            status: "active",
            customerCode: "C001",
            remarks: "标准版型，高精度检测"
        },
        {
            id: 2,
            partNo: "P002-2023",
            customerName: "客户B",
            boardType: "Compact-1x2",
            aiModel: "AOI-Detection-v1.8",
            threshold: 0.75,
            createTime: "2023-06-20",
            status: "active",
            customerCode: "C002",
            remarks: "紧凑版型，常规检测"
        },
        {
            id: 3,
            partNo: "P003-2023",
            customerName: "客户C",
            boardType: "Standard-2x3",
            aiModel: "AOI-Detection-v2.0",
            threshold: 0.80,
            createTime: "2023-07-10",
            status: "inactive",
            customerCode: "C003",
            remarks: "标准版型，中等精度"
        },
        {
            id: 4,
            partNo: "P004-2023",
            customerName: "客户D",
            boardType: "Large-4x6",
            aiModel: "AOI-Detection-v2.2",
            threshold: 0.90,
            createTime: "2023-08-05",
            status: "active",
            customerCode: "C004",
            remarks: "大尺寸版型，超高精度"
        },
        {
            id: 5,
            partNo: "P005-2023",
            customerName: "客户A",
            boardType: "Compact-1x2",
            aiModel: "AOI-Detection-v1.9",
            threshold: 0.70,
            createTime: "2023-09-12",
            status: "active",
            customerCode: "C001",
            remarks: "紧凑版型，低精度快速检测"
        },
        {
            id: 6,
            partNo: "P006-2023",
            customerName: "客户B",
            boardType: "Standard-2x3",
            aiModel: "AOI-Detection-v2.1",
            threshold: 0.85,
            createTime: "2023-10-18",
            status: "active",
            customerCode: "C002",
            remarks: "标准版型，高精度检测"
        },
        {
            id: 7,
            partNo: "P007-2023",
            customerName: "客户C",
            boardType: "Large-4x6",
            aiModel: "AOI-Detection-v2.3",
            threshold: 0.95,
            createTime: "2023-11-22",
            status: "inactive",
            customerCode: "C003",
            remarks: "大尺寸版型，最高精度"
        },
        {
            id: 8,
            partNo: "P008-2023",
            customerName: "客户D",
            boardType: "Compact-1x2",
            aiModel: "AOI-Detection-v2.0",
            threshold: 0.75,
            createTime: "2023-12-05",
            status: "active",
            customerCode: "C004",
            remarks: "紧凑版型，常规检测"
        }
    ];

    // 版型选项数据
    const boardTypeOptions = [
        "Standard-2x3",
        "Compact-1x2",
        "Large-4x6",
        "Custom-3x4",
        "Mini-1x1"
    ];

    // AI模型选项数据
    const aiModelOptions = [
        "AOI-Detection-v1.8",
        "AOI-Detection-v1.9",
        "AOI-Detection-v2.0",
        "AOI-Detection-v2.1",
        "AOI-Detection-v2.2",
        "AOI-Detection-v2.3"
    ];

    // 当前编辑的料号数据
    let currentEditingMaterial = null;

    // 初始化页面
    function init() {
        renderMaterialTable(materialData);
        bindEvents();
    }

    // 渲染料号表格
    function renderMaterialTable(data) {
        const tableBody = document.getElementById('materialTableBody');
        tableBody.innerHTML = '';

        data.forEach((material, index) => {
            const row = document.createElement('tr');
            
            // 序号
            const indexCell = document.createElement('td');
            indexCell.textContent = index + 1;
            row.appendChild(indexCell);
            
            // 料号
            const partNoCell = document.createElement('td');
            partNoCell.textContent = material.partNo;
            row.appendChild(partNoCell);
            
            // 客户名称
            const customerCell = document.createElement('td');
            customerCell.textContent = material.customerName;
            row.appendChild(customerCell);
            
            // 关联版型
            const boardTypeCell = document.createElement('td');
            const boardTypeTag = document.createElement('span');
            boardTypeTag.className = 'board-type-tag';
            boardTypeTag.textContent = material.boardType;
            boardTypeCell.appendChild(boardTypeTag);
            row.appendChild(boardTypeCell);
            
            // 关联模型
            const modelCell = document.createElement('td');
            const modelTag = document.createElement('span');
            modelTag.className = 'model-tag';
            modelTag.textContent = material.aiModel;
            modelCell.appendChild(modelTag);
            row.appendChild(modelCell);
            
            // 检测阈值
            const thresholdCell = document.createElement('td');
            thresholdCell.textContent = material.threshold;
            row.appendChild(thresholdCell);
            
            // 创建时间
            const createTimeCell = document.createElement('td');
            createTimeCell.textContent = material.createTime;
            row.appendChild(createTimeCell);
            
            // 状态
            const statusCell = document.createElement('td');
            const statusSwitch = document.createElement('label');
            statusSwitch.className = 'switch';
            
            const statusInput = document.createElement('input');
            statusInput.type = 'checkbox';
            statusInput.checked = material.status === 'active';
            statusInput.addEventListener('change', function() {
                toggleMaterialStatus(material.id, this.checked);
            });
            
            const statusSlider = document.createElement('span');
            statusSlider.className = 'slider';
            
            statusSwitch.appendChild(statusInput);
            statusSwitch.appendChild(statusSlider);
            statusCell.appendChild(statusSwitch);
            row.appendChild(statusCell);
            
            // 操作
            const actionCell = document.createElement('td');
            const actionContainer = document.createElement('div');
            actionContainer.className = 'action-buttons-container';
            
            // 编辑按钮
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn action-btn-edit';
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', function() {
                openMaterialModal(material);
            });
            
            // 复制按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn action-btn-copy';
            copyBtn.textContent = '复制';
            copyBtn.addEventListener('click', function() {
                copyMaterial(material);
            });
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn action-btn-delete';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', function() {
                deleteMaterial(material.id);
            });
            
            actionContainer.appendChild(editBtn);
            actionContainer.appendChild(copyBtn);
            actionContainer.appendChild(deleteBtn);
            actionCell.appendChild(actionContainer);
            row.appendChild(actionCell);
            
            tableBody.appendChild(row);
        });
    }

    // 切换料号状态
    function toggleMaterialStatus(id, isActive) {
        const material = materialData.find(m => m.id === id);
        if (material) {
            material.status = isActive ? 'active' : 'inactive';
            showMessage(`料号 ${material.partNo} 已${isActive ? '启用' : '停用'}`);
        }
    }

    // 打开料号弹窗
    function openMaterialModal(material = null) {
        currentEditingMaterial = material;
        const isEdit = material !== null;
        
        // 创建弹窗HTML
        const modalHTML = `
            <div class="modal-overlay" id="materialModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">${isEdit ? '编辑料号' : '新建料号'}</h3>
                        <button class="modal-close" id="closeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <!-- 基础信息 -->
                        <div class="form-section">
                            <h4 class="form-section-title">基础信息</h4>
                            <div class="form-group">
                                <label class="form-label">料号</label>
                                <input type="text" class="form-input" id="partNoInput" value="${isEdit ? material.partNo : ''}" placeholder="请输入料号">
                            </div>
                            <div class="form-group">
                                <label class="form-label">客户代码</label>
                                <input type="text" class="form-input" id="customerCodeInput" value="${isEdit ? material.customerCode : ''}" placeholder="请输入客户代码">
                            </div>
                            <div class="form-group">
                                <label class="form-label">客户名称</label>
                                <input type="text" class="form-input" id="customerNameInput" value="${isEdit ? material.customerName : ''}" placeholder="请输入客户名称">
                            </div>
                            <div class="form-group">
                                <label class="form-label">备注</label>
                                <textarea class="form-textarea" id="remarksInput" placeholder="请输入备注信息">${isEdit ? material.remarks : ''}</textarea>
                            </div>
                        </div>
                        
                        <!-- 关联配置 -->
                        <div class="form-section">
                            <h4 class="form-section-title">关联配置</h4>
                            <div class="form-group">
                                <label class="form-label">版型选择</label>
                                <select class="form-select" id="boardTypeSelect">
                                    ${boardTypeOptions.map(type => `<option value="${type}" ${isEdit && material.boardType === type ? 'selected' : ''}>${type}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">AI模型</label>
                                <select class="form-select" id="aiModelSelect">
                                    ${aiModelOptions.map(model => `<option value="${model}" ${isEdit && material.aiModel === model ? 'selected' : ''}>${model}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <!-- 检测参数 -->
                        <div class="form-section">
                            <h4 class="form-section-title">检测参数</h4>
                            <div class="form-group">
                                <label class="form-label">置信度阈值 (Confidence)</label>
                                <div class="slider-container">
                                    <div class="slider-track">
                                        <div class="slider-fill" id="thresholdFill"></div>
                                        <div class="slider-thumb" id="thresholdThumb"></div>
                                    </div>
                                    <div class="slider-value" id="thresholdValue">${isEdit ? material.threshold : '0.7'}</div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">最小缺陷尺寸 (um)</label>
                                <input type="number" class="form-input" id="minDefectSizeInput" value="${isEdit ? (material.minDefectSize || '10') : '10'}" placeholder="请输入最小缺陷尺寸">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-default" id="cancelBtn">取消</button>
                        <button class="btn btn-primary" id="saveBtn">保存</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加弹窗到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 显示弹窗
        setTimeout(() => {
            document.getElementById('materialModal').classList.add('show');
            initThresholdSlider(isEdit ? material.threshold : 0.7);
        }, 10);
        
        // 绑定弹窗事件
        bindModalEvents();
    }

    // 初始化阈值滑块
    function initThresholdSlider(value) {
        const fill = document.getElementById('thresholdFill');
        const thumb = document.getElementById('thresholdThumb');
        const valueDisplay = document.getElementById('thresholdValue');
        const track = document.querySelector('.slider-track');
        
        // 设置初始值
        updateSlider(value);
        
        // 添加拖动事件
        let isDragging = false;
        
        thumb.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const trackRect = track.getBoundingClientRect();
            const position = (e.clientX - trackRect.left) / trackRect.width;
            const newValue = Math.max(0, Math.min(1, position));
            
            updateSlider(newValue);
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // 点击轨道直接跳转
        track.addEventListener('click', function(e) {
            if (e.target === thumb) return;
            
            const trackRect = track.getBoundingClientRect();
            const position = (e.clientX - trackRect.left) / trackRect.width;
            const newValue = Math.max(0, Math.min(1, position));
            
            updateSlider(newValue);
        });
        
        function updateSlider(value) {
            const percentage = value * 100;
            fill.style.width = `${percentage}%`;
            thumb.style.left = `${percentage}%`;
            valueDisplay.textContent = value.toFixed(2);
        }
    }

    // 绑定弹窗事件
    function bindModalEvents() {
        // 关闭弹窗
        document.getElementById('closeModal').addEventListener('click', closeMaterialModal);
        document.getElementById('cancelBtn').addEventListener('click', closeMaterialModal);
        
        // 点击遮罩关闭弹窗
        document.getElementById('materialModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeMaterialModal();
            }
        });
        
        // 保存料号
        document.getElementById('saveBtn').addEventListener('click', saveMaterial);
    }

    // 关闭料号弹窗
    function closeMaterialModal() {
        const modal = document.getElementById('materialModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    // 保存料号
    function saveMaterial() {
        const partNo = document.getElementById('partNoInput').value.trim();
        const customerCode = document.getElementById('customerCodeInput').value.trim();
        const customerName = document.getElementById('customerNameInput').value.trim();
        const remarks = document.getElementById('remarksInput').value.trim();
        const boardType = document.getElementById('boardTypeSelect').value;
        const aiModel = document.getElementById('aiModelSelect').value;
        const threshold = parseFloat(document.getElementById('thresholdValue').textContent);
        const minDefectSize = document.getElementById('minDefectSizeInput').value.trim();
        
        // 验证必填字段
        if (!partNo || !customerCode || !customerName) {
            showMessage('请填写完整的基础信息', 'error');
            return;
        }
        
        if (currentEditingMaterial) {
            // 编辑模式
            const material = materialData.find(m => m.id === currentEditingMaterial.id);
            if (material) {
                material.partNo = partNo;
                material.customerCode = customerCode;
                material.customerName = customerName;
                material.remarks = remarks;
                material.boardType = boardType;
                material.aiModel = aiModel;
                material.threshold = threshold;
                material.minDefectSize = minDefectSize;
                
                showMessage(`料号 ${partNo} 已更新`);
            }
        } else {
            // 新建模式
            const newMaterial = {
                id: materialData.length > 0 ? Math.max(...materialData.map(m => m.id)) + 1 : 1,
                partNo,
                customerCode,
                customerName,
                remarks,
                boardType,
                aiModel,
                threshold,
                minDefectSize,
                createTime: new Date().toISOString().split('T')[0],
                status: 'active'
            };
            
            materialData.push(newMaterial);
            showMessage(`料号 ${partNo} 已创建`);
        }
        
        // 刷新表格
        renderMaterialTable(materialData);
        
        // 关闭弹窗
        closeMaterialModal();
    }

    // 复制料号
    function copyMaterial(material) {
        const newMaterial = {
            ...material,
            id: materialData.length > 0 ? Math.max(...materialData.map(m => m.id)) + 1 : 1,
            partNo: material.partNo + '-copy',
            createTime: new Date().toISOString().split('T')[0],
            status: 'inactive'
        };
        
        materialData.push(newMaterial);
        renderMaterialTable(materialData);
        showMessage(`料号 ${newMaterial.partNo} 已复制`);
    }

    // 删除料号
    function deleteMaterial(id) {
        if (confirm('确定要删除此料号吗？此操作不可恢复。')) {
            const index = materialData.findIndex(m => m.id === id);
            if (index !== -1) {
                const partNo = materialData[index].partNo;
                materialData.splice(index, 1);
                renderMaterialTable(materialData);
                showMessage(`料号 ${partNo} 已删除`);
            }
        }
    }

    // 显示消息提示
    function showMessage(message, type = 'success') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            background-color: ${type === 'success' ? '#67c23a' : '#f56c6c'};
            z-index: 2000;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 显示动画
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // 筛选料号数据
    function filterMaterials() {
        const searchTerm = document.getElementById('materialSearchInput').value.toLowerCase();
        const customerFilter = document.getElementById('customerFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        const filteredData = materialData.filter(material => {
            // 搜索条件
            const matchSearch = !searchTerm || 
                material.partNo.toLowerCase().includes(searchTerm) || 
                material.customerName.toLowerCase().includes(searchTerm);
            
            // 客户筛选
            const matchCustomer = !customerFilter || material.customerName === customerFilter;
            
            // 状态筛选
            const matchStatus = !statusFilter || material.status === statusFilter;
            
            return matchSearch && matchCustomer && matchStatus;
        });
        
        renderMaterialTable(filteredData);
    }

    // 重置筛选条件
    function resetFilters() {
        document.getElementById('materialSearchInput').value = '';
        document.getElementById('customerFilter').value = '';
        document.getElementById('statusFilter').value = '';
        
        renderMaterialTable(materialData);
    }

    // 绑定页面事件
    function bindEvents() {
        // 新建料号
        document.getElementById('newMaterialBtn').addEventListener('click', function() {
            openMaterialModal();
        });
        
        // 批量导入
        document.getElementById('importMaterialBtn').addEventListener('click', function() {
            showMessage('批量导入功能正在开发中');
        });
        
        // 查询
        document.getElementById('queryMaterialBtn').addEventListener('click', filterMaterials);
        
        // 重置
        document.getElementById('resetMaterialBtn').addEventListener('click', resetFilters);
        
        // 搜索框回车触发查询
        document.getElementById('materialSearchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterMaterials();
            }
        });
    }

    // 初始化页面
    init();
});