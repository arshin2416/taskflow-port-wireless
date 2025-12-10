import tasksData from "../mockData/tasks.json";

class TaskService {
  constructor() {
    this.storageKey = "taskflow_tasks";
    this.initializeStorage();
  }

  initializeStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(tasksData));
    }
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  async getById(id) {
    await this.delay();
    const tasks = await this.getAll();
    return tasks.find(task => task.Id === parseInt(id)) || null;
  }

  async getByCategory(categoryId) {
    await this.delay();
    const tasks = await this.getAll();
    return tasks.filter(task => task.categoryId === categoryId);
  }

  async getByStatus(status) {
    await this.delay();
    const tasks = await this.getAll();
    return tasks.filter(task => task.status === status);
  }

  async getToday() {
    await this.delay();
    const tasks = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.status === 'active' && 
      task.dueDate === today
    );
  }

  async getUpcoming() {
    await this.delay();
    const tasks = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.status === 'active' && 
      task.dueDate && 
      task.dueDate > today
    );
  }

  async getOverdue() {
    await this.delay();
    const tasks = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.status === 'active' && 
      task.dueDate && 
      task.dueDate < today
    );
  }

  async create(taskData) {
    await this.delay();
    const tasks = await this.getAll();
    const maxId = tasks.reduce((max, task) => Math.max(max, task.Id), 0);
    
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      status: "active",
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    const updatedTasks = [...tasks, newTask];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedTasks));
    return { ...newTask };
  }

  async update(id, taskData) {
    await this.delay();
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.Id === parseInt(id));
    
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...taskData,
      Id: parseInt(id)
    };
    
    // Handle completion status changes
    if (taskData.status === 'completed' && tasks[taskIndex].status === 'active') {
      updatedTask.completedAt = new Date().toISOString();
    } else if (taskData.status === 'active' && tasks[taskIndex].status === 'completed') {
      updatedTask.completedAt = null;
    }
    
    tasks[taskIndex] = updatedTask;
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    return { ...updatedTask };
  }

  async delete(id) {
    await this.delay();
    const tasks = await this.getAll();
    const filteredTasks = tasks.filter(task => task.Id !== parseInt(id));
    localStorage.setItem(this.storageKey, JSON.stringify(filteredTasks));
    return true;
  }

  async search(query) {
    await this.delay();
    const tasks = await this.getAll();
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export default new TaskService();