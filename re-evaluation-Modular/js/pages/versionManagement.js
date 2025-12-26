/**
 * 版类型管理页面模块
 * 用于定义不同PCB产品的拼板结构和尺寸参数
 */
const BoardTypeManagement = {
    // 模拟数据库
    boardTypes: [
        {
            id: 'bt-001',
            name: 'Standard-2x3',
            description: '标准2x3拼板，大尺寸',
            rows: 2,
            columns: 3,
            unitWidth: 50,
            unitHeight: 30,
            gapX: 2,
            gapY: 2,
            createTime: '2023-10-15'
        },
        {
            id: 'bt-002',
            name: 'Matrix-10x10',
            description: '10x10密集型拼板',
            rows: 10,
            columns: 10,
            unitWidth: 10,
            unitHeight: 10,
            gapX: 1,
            gapY: 1,
            createTime: '2023-10-20'
        },
        {
            id: 'bt-003',
            name: 'Strip-1x8',
            description: '1x8条带状拼板',
            rows: 1,
            columns: 8,
            unitWidth: 15,
            unitHeight: 40,
            gapX: 1.5,
            gapY: 0,
            createTime: '2023-11-05'
        }
    ],
    
    // 当前选中的版型
    currentBoardType: null,
    
    // 初始化页面
    init() {
        console.log('初始化版类型管理页面');
        
        // 从localStorage加载数据
        this.loadBoardTypes();
        
        this.bindEvents();
        this.renderBoardTypeList();
        
        // 默认选中第一个版型，如果有的话
        if (this.boardTypes.length > 0) {
            this.selectBoardType(this.boardTypes[0]);
        } else {
            // 如果没有版型，创建一个默认版型
            this.createNewBoardType();
        }
    },
    
    // 从localStorage加载版型数据
    loadBoardTypes() {
        const savedBoardTypes = localStorage.getItem('boardTypes');
        if (savedBoardTypes) {
            try {
                this.boardTypes = JSON.parse(savedBoardTypes);
            } catch (e) {
                console.error('加载版型数据失败:', e);
                // 如果加载失败，使用默认数据
            }
        }
    },
    
    // 绑定事件
    bindEvents() {
        // 新建版型按钮
        document.getElementById('newBoardTypeBtn').addEventListener('click', () => {
            this.createNewBoardType();
        });
        
        // 搜索框
        document.getElementById('boardTypeSearch').addEventListener('input', (e) => {
            this.filterBoardTypes(e.target.value);
        });
        
        // 表单输入事件 - 实时更新预览
        ['rows', 'columns', 'unitWidth', 'unitHeight', 'gapX', 'gapY'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updatePreview();
                });
            }
        });
        
        // 保存按钮
        document.getElementById('saveBoardTypeBtn').addEventListener('click', () => {
            this.saveCurrentBoardType();
        });
    },
    
    // 渲染版型列表
    renderBoardTypeList() {
        const listContainer = document.getElementById('boardTypeList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        this.boardTypes.forEach(boardType => {
            const item = document.createElement('div');
            item.className = 'board-type-item';
            item.dataset.id = boardType.id;
            
            item.innerHTML = `
                <div class="board-type-name">${boardType.name}</div>
                <div class="board-type-desc">${boardType.rows}x${boardType.columns}</div>
            `;
            
            item.addEventListener('click', () => {
                this.selectBoardType(boardType);
            });
            
            listContainer.appendChild(item);
        });
    },
    
    // 筛选版型
    filterBoardTypes(searchTerm) {
        const items = document.querySelectorAll('.board-type-item');
        
        items.forEach(item => {
            const name = item.querySelector('.board-type-name').textContent.toLowerCase();
            const desc = item.querySelector('.board-type-desc').textContent.toLowerCase();
            const term = searchTerm.toLowerCase();
            
            if (name.includes(term) || desc.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    // 选中版型
    selectBoardType(boardType) {
        this.currentBoardType = boardType;
        
        // 更新列表选中状态
        document.querySelectorAll('.board-type-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.id === boardType.id) {
                item.classList.add('selected');
            }
        });
        
        // 填充表单
        this.fillForm(boardType);
        
        // 更新预览
        this.updatePreview();
    },
    
    // 填充表单
    fillForm(boardType) {
        document.getElementById('boardTypeName').value = boardType.name;
        document.getElementById('boardTypeDesc').value = boardType.description || '';
        document.getElementById('rows').value = boardType.rows;
        document.getElementById('columns').value = boardType.columns;
        document.getElementById('unitWidth').value = boardType.unitWidth;
        document.getElementById('unitHeight').value = boardType.unitHeight;
        document.getElementById('gapX').value = boardType.gapX;
        document.getElementById('gapY').value = boardType.gapY;
    },
    
    // 创建新版型
    createNewBoardType() {
        const newBoardType = {
            id: 'bt-' + Date.now(),
            name: '新版型-' + Date.now(),
            description: '',
            rows: 2,
            columns: 2,
            unitWidth: 20,
            unitHeight: 20,
            gapX: 2,
            gapY: 2,
            createTime: new Date().toISOString().split('T')[0]
        };
        
        this.boardTypes.push(newBoardType);
        this.renderBoardTypeList();
        this.selectBoardType(newBoardType);
    },
    
    // 保存当前版型
    saveCurrentBoardType() {
        if (!this.currentBoardType) return;
        
        // 更新数据
        this.currentBoardType.name = document.getElementById('boardTypeName').value;
        this.currentBoardType.description = document.getElementById('boardTypeDesc').value;
        this.currentBoardType.rows = parseInt(document.getElementById('rows').value);
        this.currentBoardType.columns = parseInt(document.getElementById('columns').value);
        this.currentBoardType.unitWidth = parseFloat(document.getElementById('unitWidth').value);
        this.currentBoardType.unitHeight = parseFloat(document.getElementById('unitHeight').value);
        this.currentBoardType.gapX = parseFloat(document.getElementById('gapX').value);
        this.currentBoardType.gapY = parseFloat(document.getElementById('gapY').value);
        
        // 保存到localStorage
        this.saveBoardTypes();
        
        // 更新列表
        this.renderBoardTypeList();
        this.selectBoardType(this.currentBoardType);
        
        // 显示保存成功提示
        alert('保存成功');
    },
    
    // 保存版型数据到localStorage
    saveBoardTypes() {
        localStorage.setItem('boardTypes', JSON.stringify(this.boardTypes));
    },
    
    // 更新预览
    updatePreview() {
        const rows = parseInt(document.getElementById('rows').value) || 1;
        const columns = parseInt(document.getElementById('columns').value) || 1;
        const unitWidth = parseFloat(document.getElementById('unitWidth').value) || 10;
        const unitHeight = parseFloat(document.getElementById('unitHeight').value) || 10;
        const gapX = parseFloat(document.getElementById('gapX').value) || 0;
        const gapY = parseFloat(document.getElementById('gapY').value) || 0;
        
        // 调用renderPreview函数更新预览
        this.renderPreview(rows, columns, unitWidth, unitHeight, gapX, gapY);
    },
    
    /**
     * 渲染预览 - 实现可视化预览逻辑
     * @param {number} rows - 行数
     * @param {number} columns - 列数
     * @param {number} unitWidth - 单元格宽度
     * @param {number} unitHeight - 单元格高度
     * @param {number} gapX - 水平间距
     * @param {number} gapY - 垂直间距
     */
    renderPreview(rows, columns, unitWidth, unitHeight, gapX, gapY) {
        const previewContainer = document.getElementById('boardPreview');
        if (!previewContainer) return;
        
        // 清空预览
        previewContainer.innerHTML = '';
        
        // 计算总尺寸
        const totalWidth = columns * unitWidth + (columns - 1) * gapX;
        const totalHeight = rows * unitHeight + (rows - 1) * gapY;
        
        // 设置容器尺寸
        previewContainer.style.width = `${totalWidth}px`;
        previewContainer.style.height = `${totalHeight}px`;
        
        // 创建网格
        previewContainer.style.display = 'grid';
        previewContainer.style.gridTemplateColumns = `repeat(${columns}, ${unitWidth}px)`;
        previewContainer.style.gridTemplateRows = `repeat(${rows}, ${unitHeight}px)`;
        previewContainer.style.gap = `${gapY}px ${gapX}px`;
        
        // 添加单元格
        for (let i = 0; i < rows * columns; i++) {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';
            cell.textContent = i + 1;
            cell.style.display = 'flex';
            cell.style.justifyContent = 'center';
            cell.style.alignItems = 'center';
            cell.style.fontSize = '12px';
            cell.style.color = '#333';
            cell.style.backgroundColor = '#fff';
            cell.style.border = '1px solid #ddd';
            cell.style.cursor = 'pointer';
            
            // 添加点击效果
            cell.addEventListener('click', function() {
                // 切换选中状态
                this.classList.toggle('selected');
                this.style.backgroundColor = this.classList.contains('selected') ? '#e0f0ff' : '#fff';
            });
            
            previewContainer.appendChild(cell);
        }
    },
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 如果当前页面是版类型管理页面，则初始化
    if (document.getElementById('versionManagementPage')) {
        BoardTypeManagement.init();
    }
});

// 导出模块
export { BoardTypeManagement };