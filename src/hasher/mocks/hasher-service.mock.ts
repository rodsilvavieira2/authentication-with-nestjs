export class HasherServiceMOCK {
  async hash(plaintext: string): Promise<string> {
    return 'hash';
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    return true;
  }
}
