// ================= 人员管理页面 =================

import { LogSystem } from '../modules/logSystem.js';

export const UserManagement = {
    users: [], // 存储所有用户数据
    currentPage: 1,
    pageSize: 10,
    currentRoleFilter: 'all', // 当前角色筛选
    editingUserId: null, // 当前正在编辑的用户ID

    // 初始化人员管理页面
    init: function() {
        try {
            console.log('👥 初始化人员管理页面');

            // 生成模拟用户数据
            this.generateMockUsers();

            // 渲染页面
            this.renderPage();

            // 绑定事件
            this.bindEvents();

            // 记录日志
            LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.PAGE_ACCESS, '访问人员管理页面', '', 'UserManagement');
        } catch (error) {
            console.error('❌ 人员管理页面初始化失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.SYSTEM_CONFIG, '人员管理页面初始化失败', error.message, 'UserManagement');
        }
    },

    // 生成模拟用户数据
    generateMockUsers: function() {
        const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
        const departments = ['生产部', '质检部', '技术部', '维护部', '管理部'];
        const roles = [
            { value: 'admin', label: '系统管理员' },
            { value: 'engineer', label: '制程工程师' },
            { value: 'operator', label: '产线操作员' }
        ];

        // 生成8-10个用户
        const userCount = Math.floor(Math.random() * 3) + 8; // 8-10个用户

        this.users = [];

        for (let i = 0; i < userCount; i++) {
            const role = roles[Math.floor(Math.random() * roles.length)];
            const baseDate = new Date(2025, 11, 1); // 2025年12月1日
            const lastLogin = new Date(baseDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // 随机30天内

            this.users.push({
                id: `EMP${String(1000 + i).padStart(4, '0')}`,
                name: names[i % names.length] + (i >= names.length ? String(i - names.length + 1) : ''),
                role: role.value,
                roleLabel: role.label,
                department: departments[Math.floor(Math.random() * departments.length)],
                password: '123456', // 默认密码
                status: Math.random() > 0.1 ? 'active' : 'inactive', // 90%启用，10%停用
                lastLogin: lastLogin,
                createdAt: new Date(lastLogin.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000) // 创建时间在登录时间前一年内
            });
        }

        console.log(`✅ 生成 ${this.users.length} 个模拟用户数据`);
    },

    // 渲染页面
    renderPage: function() {
        this.renderRoleCounts();
        this.renderUserTable();
        this.renderPagination();
    },

    // 渲染角色统计数量
    renderRoleCounts: function() {
        const roleCounts = {
            all: this.users.length,
            admin: this.users.filter(u => u.role === 'admin').length,
            engineer: this.users.filter(u => u.role === 'engineer').length,
            operator: this.users.filter(u => u.role === 'operator').length
        };

        // 更新侧边栏角色数量显示
        Object.keys(roleCounts).forEach(role => {
            const element = document.getElementById(`${role}Count`);
            if (element) {
                element.textContent = `(${roleCounts[role]})`;
            }
        });
    },

    // 渲染用户表格
    renderUserTable: function() {
        const tableBody = document.getElementById('userTableBody');
        if (!tableBody) return;

        // 筛选用户数据
        let filteredUsers = this.users;
        if (this.currentRoleFilter !== 'all') {
            filteredUsers = this.users.filter(user => user.role === this.currentRoleFilter);
        }

        // 搜索筛选
        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.id.toLowerCase().includes(searchTerm) ||
                user.name.toLowerCase().includes(searchTerm)
            );
        }

        // 分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageUsers = filteredUsers.slice(startIndex, endIndex);

        // 生成表格HTML
        tableBody.innerHTML = pageUsers.map(user => this.createUserRow(user)).join('');

        // 更新分页信息
        this.updatePaginationInfo(filteredUsers.length);

        console.log(`✅ 渲染 ${pageUsers.length} 个用户记录`);
    },

    // 创建用户行HTML
    createUserRow: function(user) {
        const lastLoginFormatted = this.formatDateTime(user.lastLogin);
        const statusText = user.status === 'active' ? '启用' : '停用';
        const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
        const roleBadgeClass = this.getRoleBadgeClass(user.role);

        return `
            <tr data-user-id="${user.id}">
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                </td>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>
                    <span class="role-badge ${roleBadgeClass}">${user.roleLabel}</span>
                </td>
                <td>${user.department}</td>
                <td>${lastLoginFormatted}</td>
                <td>
                    <span class="status-indicator ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="UserManagement.editUser('${user.id}')">编辑</button>
                        <button class="btn btn-sm btn-warning" onclick="UserManagement.resetPassword('${user.id}')">重置密码</button>
                        <button class="btn btn-sm btn-danger" onclick="UserManagement.deleteUser('${user.id}')">删除</button>
                    </div>
                </td>
            </tr>
        `;
    },

    // 获取角色标签样式类
    getRoleBadgeClass: function(role) {
        const badgeClasses = {
            admin: 'role-admin',      // 红色
            engineer: 'role-engineer', // 蓝色
            operator: 'role-operator'  // 绿色
        };
        return badgeClasses[role] || '';
    },

    // 渲染分页控件
    renderPagination: function() {
        const paginationControls = document.querySelector('.pagination-controls');
        if (!paginationControls) return;

        // 分页逻辑已在renderUserTable中处理，这里只需要确保控件存在
        console.log('✅ 分页控件已渲染');
    },

    // 更新分页信息
    updatePaginationInfo: function(totalCount) {
        const totalPages = Math.ceil(totalCount / this.pageSize);
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, totalCount);

        // 更新显示信息
        const currentStart = document.getElementById('currentStart');
        const currentEnd = document.getElementById('currentEnd');
        const totalUsers = document.getElementById('totalUsers');
        const currentPage = document.getElementById('currentPage');
        const totalPagesElement = document.getElementById('totalPages');

        if (currentStart) currentStart.textContent = totalCount > 0 ? start : 0;
        if (currentEnd) currentEnd.textContent = end;
        if (totalUsers) totalUsers.textContent = totalCount;
        if (currentPage) currentPage.textContent = this.currentPage;
        if (totalPagesElement) totalPagesElement.textContent = totalPages || 1;
    },

    // 绑定事件
    bindEvents: function() {
        // 角色筛选事件
        this.bindRoleFilterEvents();

        // 搜索事件
        this.bindSearchEvents();

        // 分页事件已在HTML中绑定
    },

    // 绑定角色筛选事件
    bindRoleFilterEvents: function() {
        // 绑定树形结构的角色选择事件
        const roleTreeItems = document.querySelectorAll('.role-tree-item[data-role]');
        roleTreeItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // 防止事件冒泡到父级节点
                e.stopPropagation();

                // 移除所有active类
                document.querySelectorAll('.role-tree-item').forEach(i => i.classList.remove('active'));
                // 添加当前项的active类
                e.currentTarget.classList.add('active');

                // 更新筛选条件
                this.currentRoleFilter = e.currentTarget.dataset.role || 'all';
                this.currentPage = 1; // 重置到第一页

                // 重新渲染表格
                this.renderUserTable();
                this.renderPagination();

                LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION,
                    `筛选用户角色: ${this.currentRoleFilter}`, '', 'UserManagement');
            });
        });

        // 绑定树节点展开/折叠事件（只对有子项的节点）
        const expandableNodes = document.querySelectorAll('.role-tree-node .role-tree-item:not([data-role])');
        expandableNodes.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleRoleGroup(item);
            });
        });
    },

    // 绑定搜索事件
    bindSearchEvents: function() {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.currentPage = 1; // 重置到第一页
                this.renderUserTable();
            });
        }
    },

    // 打开新增用户模态框
    openAddUserModal: function() {
        this.editingUserId = null;
        this.clearUserModal();
        document.getElementById('userModalTitle').textContent = '新增人员';
        document.getElementById('passwordHint').textContent = '新增时必填，编辑时留空表示不修改';
        document.getElementById('userModal').style.display = 'flex';

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, '打开新增人员模态框', '', 'UserManagement');
    },

    // 打开编辑用户模态框
    editUser: function(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.editingUserId = userId;
        this.fillUserModal(user);
        document.getElementById('userModalTitle').textContent = '编辑人员';
        document.getElementById('passwordHint').textContent = '留空表示不修改密码';
        document.getElementById('userModal').style.display = 'flex';

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION, `编辑用户: ${userId}`, '', 'UserManagement');
    },

    // 关闭用户模态框
    closeUserModal: function() {
        document.getElementById('userModal').style.display = 'none';
        this.editingUserId = null;
    },

    // 清空用户模态框
    clearUserModal: function() {
        document.getElementById('userIdInput').value = '';
        document.getElementById('userNameInput').value = '';
        document.getElementById('userRoleSelect').value = '';
        document.getElementById('userPasswordInput').value = '';
        document.getElementById('userDepartmentInput').value = '';
        document.querySelector('input[name="userStatus"][value="active"]').checked = true;
    },

    // 填充用户模态框
    fillUserModal: function(user) {
        document.getElementById('userIdInput').value = user.id;
        document.getElementById('userNameInput').value = user.name;
        document.getElementById('userRoleSelect').value = user.role;
        document.getElementById('userPasswordInput').value = ''; // 编辑时不显示密码
        document.getElementById('userDepartmentInput').value = user.department;
        document.querySelector(`input[name="userStatus"][value="${user.status}"]`).checked = true;
    },

    // 保存用户
    saveUser: function() {
        try {
            const userData = this.getUserFormData();

            if (!userData.id || !userData.name || !userData.role) {
                alert('请填写所有必填字段！');
                return;
            }

            // 检查工号是否重复（新增时）
            if (!this.editingUserId && this.users.some(u => u.id === userData.id)) {
                alert('工号已存在，请使用其他工号！');
                return;
            }

            if (this.editingUserId) {
                // 编辑用户
                this.updateUser(this.editingUserId, userData);
                LogSystem.addLog(LogSystem.levels.SUCCESS, LogSystem.types.USER_ACTION,
                    `编辑用户成功: ${userData.id}`, '', 'UserManagement');
            } else {
                // 新增用户
                this.addUser(userData);
                LogSystem.addLog(LogSystem.levels.SUCCESS, LogSystem.types.USER_ACTION,
                    `新增用户成功: ${userData.id}`, '', 'UserManagement');
            }

            this.closeUserModal();
            this.renderPage();

        } catch (error) {
            console.error('❌ 保存用户失败:', error);
            LogSystem.addLog(LogSystem.levels.ERROR, LogSystem.types.USER_ACTION,
                '保存用户失败', error.message, 'UserManagement');
        }
    },

    // 获取用户表单数据
    getUserFormData: function() {
        return {
            id: document.getElementById('userIdInput').value.trim(),
            name: document.getElementById('userNameInput').value.trim(),
            role: document.getElementById('userRoleSelect').value,
            password: document.getElementById('userPasswordInput').value,
            department: document.getElementById('userDepartmentInput').value.trim(),
            status: document.querySelector('input[name="userStatus"]:checked').value
        };
    },

    // 添加用户
    addUser: function(userData) {
        const roleLabels = {
            admin: '系统管理员',
            engineer: '制程工程师',
            operator: '产线操作员'
        };

        const newUser = {
            ...userData,
            roleLabel: roleLabels[userData.role],
            lastLogin: new Date(),
            createdAt: new Date()
        };

        this.users.push(newUser);
    },

    // 更新用户
    updateUser: function(userId, userData) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        const roleLabels = {
            admin: '系统管理员',
            engineer: '制程工程师',
            operator: '产线操作员'
        };

        // 只更新非空字段
        if (userData.name) this.users[userIndex].name = userData.name;
        if (userData.role) {
            this.users[userIndex].role = userData.role;
            this.users[userIndex].roleLabel = roleLabels[userData.role];
        }
        if (userData.password) this.users[userIndex].password = userData.password;
        if (userData.department) this.users[userIndex].department = userData.department;
        if (userData.status) this.users[userIndex].status = userData.status;
    },

    // 删除用户
    deleteUser: function(userId) {
        if (!confirm('确定要删除此用户吗？此操作不可恢复！')) return;

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        this.users.splice(userIndex, 1);
        this.renderPage();

        LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.USER_ACTION,
            `删除用户: ${userId}`, '', 'UserManagement');
    },

    // 重置密码
    resetPassword: function(userId) {
        if (!confirm('确定要重置此用户的密码吗？密码将重置为 123456')) return;

        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.password = '123456';
        alert('密码已重置为 123456');

        LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.USER_ACTION,
            `重置用户密码: ${userId}`, '', 'UserManagement');
    },

    // 批量停用
    bulkDeactivate: function() {
        const selectedCheckboxes = document.querySelectorAll('.user-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert('请先选择要停用的用户！');
            return;
        }

        if (!confirm(`确定要停用选中的 ${selectedCheckboxes.length} 个用户吗？`)) return;

        selectedCheckboxes.forEach(checkbox => {
            const userId = checkbox.value;
            const user = this.users.find(u => u.id === userId);
            if (user) {
                user.status = 'inactive';
            }
        });

        this.renderPage();

        LogSystem.addLog(LogSystem.levels.WARNING, LogSystem.types.USER_ACTION,
            `批量停用 ${selectedCheckboxes.length} 个用户`, '', 'UserManagement');
    },

    // 全选/取消全选
    toggleSelectAll: function() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const userCheckboxes = document.querySelectorAll('.user-checkbox');

        userCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    },

    // 分页方法
    goToFirstPage: function() {
        this.currentPage = 1;
        this.renderUserTable();
    },

    goToPrevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderUserTable();
        }
    },

    goToNextPage: function() {
        const totalPages = Math.ceil(this.users.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderUserTable();
        }
    },

    goToLastPage: function() {
        const totalPages = Math.ceil(this.users.length / this.pageSize);
        this.currentPage = totalPages;
        this.renderUserTable();
    },

    // 工具方法
    formatDateTime: function(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // 切换角色组展开/折叠状态
    toggleRoleGroup: function(item) {
        const node = item.closest('.role-tree-node');
        const arrow = item.querySelector('.role-tree-arrow');

        if (node.classList.contains('expanded')) {
            // 折叠
            node.classList.remove('expanded');
            node.classList.add('collapsed');
            if (arrow) arrow.textContent = '▶';
        } else {
            // 展开
            node.classList.remove('collapsed');
            node.classList.add('expanded');
            if (arrow) arrow.textContent = '▼';
        }
    },

    // 选择角色（更新角色筛选）
    selectRole: function(role) {
        // 这个方法可以被HTML直接调用
        this.currentRoleFilter = role;
        this.currentPage = 1; // 重置到第一页

        // 重新渲染表格
        this.renderUserTable();
        this.renderPagination();

        LogSystem.addLog(LogSystem.levels.INFO, LogSystem.types.USER_ACTION,
            `筛选用户角色: ${role}`, '', 'UserManagement');
    },

    // 页面显示时的处理
    onPageShow: function() {
        // 可以在这里添加页面显示时的逻辑
        console.log('👥 人员管理页面显示');
    }
};
