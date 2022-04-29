export class UserServiceMOCK {
  async createLocalUser(data: any) {
    return data;
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return { id };
  }

  async update(id: string, data: any) {
    return { id, ...data };
  }

  async remove(id: string) {
    return { id };
  }

  async findByEmail(email: string) {
    return { email };
  }

  async createOrFindGoogleAccount(data: any) {
    return data;
  }
}
