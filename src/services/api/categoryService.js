import categoriesData from "../mockData/categories.json";

class CategoryService {
  constructor() {
    this.storageKey = "taskflow_categories";
    this.initializeStorage();
  }

  initializeStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(categoriesData));
    }
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    const stored = localStorage.getItem(this.storageKey);
    const categories = stored ? JSON.parse(stored) : [];
    return categories.sort((a, b) => a.order - b.order);
  }

  async getById(id) {
    await this.delay();
    const categories = await this.getAll();
    return categories.find(category => category.Id === parseInt(id)) || null;
  }

  async create(categoryData) {
    await this.delay();
    const categories = await this.getAll();
    const maxId = categories.reduce((max, category) => Math.max(max, category.Id), 0);
    const maxOrder = categories.reduce((max, category) => Math.max(max, category.order), 0);
    
    const newCategory = {
      ...categoryData,
      Id: maxId + 1,
      order: maxOrder + 1
    };
    
    const updatedCategories = [...categories, newCategory];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedCategories));
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await this.delay();
    const categories = await this.getAll();
    const categoryIndex = categories.findIndex(category => category.Id === parseInt(id));
    
    if (categoryIndex === -1) {
      throw new Error("Category not found");
    }
    
    const updatedCategory = {
      ...categories[categoryIndex],
      ...categoryData,
      Id: parseInt(id)
    };
    
    categories[categoryIndex] = updatedCategory;
    localStorage.setItem(this.storageKey, JSON.stringify(categories));
    return { ...updatedCategory };
  }

  async delete(id) {
    await this.delay();
    const categories = await this.getAll();
    const filteredCategories = categories.filter(category => category.Id !== parseInt(id));
    localStorage.setItem(this.storageKey, JSON.stringify(filteredCategories));
    return true;
  }
}

export default new CategoryService();