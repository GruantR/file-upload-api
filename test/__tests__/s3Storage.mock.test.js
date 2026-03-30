// test/__tests__/s3Storage.mock.test.js
const MockS3Storage = require('../__mocks__/s3Storage');

describe('S3Storage Mock', () => {
  let storage;

  beforeEach(() => {
    storage = new MockS3Storage();
  });

  it('should save and retrieve a file', async () => {
    const mockFile = {
      filename: 'test.jpg',
      buffer: Buffer.from('test-content')
    };
    const mockFileData = { id: 1 };

    const url = await storage.save(mockFile, mockFileData);
    expect(url).toBe('http://mock-minio:9000/bucket/test.jpg');
  });

  it('should return path for file', async () => {
    const path = await storage.getPath('test.jpg');
    expect(path).toBe('http://mock-minio:9000/bucket/test.jpg');
  });

  it('should delete a file', async () => {
    const mockFile = { filename: 'to-delete.jpg' };
    await storage.save(mockFile, {});
    
    await storage.delete('to-delete.jpg');

    await expect(storage.getStream('to-delete.jpg')).rejects.toThrow('File not found');
  });
});